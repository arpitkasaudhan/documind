import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/prisma";
import { retrieveContext, buildRAGPrompt } from "@/lib/ai/rag";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages, documentId, chatSessionId } = await req.json();
  const userMessage: string = messages[messages.length - 1].content;

  // Verify document ownership
  const document = await db.document.findFirst({
    where: { id: documentId, userId: session.user.id, status: "READY" },
  });
  if (!document) {
    return new Response("Document not found or not ready", { status: 404 });
  }

  // Retrieve relevant context from Pinecone
  const context = await retrieveContext(userMessage, documentId, 5);
  const systemPrompt = buildRAGPrompt(userMessage, context);

  // Save user message to DB
  if (chatSessionId) {
    await db.message.create({
      data: {
        chatSessionId,
        role: "USER",
        content: userMessage,
      },
    });
  }

  const result = streamText({
    model: anthropic("claude-opus-4-7"),
    system: systemPrompt,
    messages: messages.slice(0, -1), // exclude last (already in system prompt)
    onFinish: async ({ text }) => {
      if (chatSessionId) {
        await db.message.create({
          data: {
            chatSessionId,
            role: "ASSISTANT",
            content: text,
            sources: context.map((c) => ({
              text: c.text.slice(0, 200),
              pageNumber: c.pageNumber,
            })),
          },
        });
      }
    },
  });

  return result.toDataStreamResponse();
}
