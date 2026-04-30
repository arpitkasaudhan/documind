import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/prisma";
import { z } from "zod";

const createSchema = z.object({
  documentId: z.string(),
  title: z.string().optional(),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const documentId = searchParams.get("documentId");

  const sessions = await db.chatSession.findMany({
    where: {
      userId: session.user.id,
      ...(documentId ? { documentId } : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { messages: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true },
      },
    },
  });

  return NextResponse.json({ sessions });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = createSchema.parse(await req.json());
    const document = await db.document.findFirst({
      where: { id: body.documentId, userId: session.user.id },
    });
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const chatSession = await db.chatSession.create({
      data: {
        documentId: body.documentId,
        userId: session.user.id,
        title: body.title ?? `Chat ${new Date().toLocaleDateString()}`,
      },
    });

    return NextResponse.json({ session: chatSession }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 422 });
    }
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
