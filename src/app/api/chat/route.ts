import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/prisma";
import { retrieveContext, buildRAGPrompt } from "@/lib/ai/rag";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages, documentId, chatSessionId } = await req.json();
  const userMessage: string = messages[messages.length - 1]?.content ?? "";

  const document = await db.document.findFirst({
    where: { id: documentId, userId: session.user.id, status: "READY" },
  });
  if (!document) {
    return new Response("Document not found or not ready", { status: 404 });
  }

  const context = await retrieveContext(userMessage, documentId, 5);
  const systemPrompt = buildRAGPrompt(userMessage, context);

  if (chatSessionId) {
    await db.message.create({
      data: { chatSessionId, role: "USER", content: userMessage },
    });
  }

  // Build message history excluding the last user message (already in system prompt context)
  const history = messages.slice(0, -1).map(
    (m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })
  );

  let fullText = "";

  const stream = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 4096,
    system: systemPrompt,
    messages: history,
    stream: true,
  });

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const text = event.delta.text;
            fullText += text;
            controller.enqueue(encoder.encode(text));
          }
        }
      } finally {
        controller.close();
        if (chatSessionId && fullText) {
          await db.message.create({
            data: {
              chatSessionId,
              role: "ASSISTANT",
              content: fullText,
              sources: context.map((c) => ({
                text: c.text.slice(0, 200),
                pageNumber: c.pageNumber,
              })),
            },
          });
        }
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
