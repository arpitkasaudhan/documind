import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const chatSession = await db.chatSession.findFirst({
    where: { id, userId: session.user.id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!chatSession) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ session: chatSession });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const chatSession = await db.chatSession.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!chatSession) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.chatSession.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { title } = await req.json();

  const chatSession = await db.chatSession.updateMany({
    where: { id, userId: session.user.id },
    data: { title },
  });

  return NextResponse.json({ updated: chatSession.count > 0 });
}
