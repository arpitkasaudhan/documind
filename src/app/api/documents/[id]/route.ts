import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/prisma";
import { deleteFromS3 } from "@/lib/storage/s3";
import { deleteDocumentVectors } from "@/lib/vector/pinecone";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const document = await db.document.findFirst({
    where: { id, userId: session.user.id },
    include: { chatSessions: { orderBy: { createdAt: "desc" } } },
  });

  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ document });
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
  const document = await db.document.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await Promise.all([
    deleteFromS3(document.fileKey),
    deleteDocumentVectors(document.id),
    db.document.delete({ where: { id: document.id } }),
  ]);

  return NextResponse.json({ success: true });
}
