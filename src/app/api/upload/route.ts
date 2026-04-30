import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadToS3, generateFileKey } from "@/lib/storage/s3";
import { parsePDF } from "@/lib/ai/pdf";
import { indexDocument } from "@/lib/ai/rag";
import { db } from "@/lib/db/prisma";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["application/pdf"];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    // Check plan limits
    const docCount = await db.document.count({
      where: { userId: session.user.id },
    });
    const subscription = await db.subscription.findUnique({
      where: { userId: session.user.id },
    });
    const limit = subscription?.plan === "PRO" ? 100 : 3;
    if (docCount >= limit) {
      return NextResponse.json(
        { error: `Document limit reached. Upgrade to Pro for more.` },
        { status: 403 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileKey = generateFileKey(session.user.id, file.name);

    // Upload to S3
    const fileUrl = await uploadToS3(buffer, fileKey, file.type);

    // Parse PDF
    const parsed = await parsePDF(buffer);

    // Create DB record
    const document = await db.document.create({
      data: {
        userId: session.user.id,
        name: file.name.replace(/\.pdf$/i, ""),
        originalName: file.name,
        fileKey,
        fileUrl,
        fileSize: file.size,
        mimeType: file.type,
        pageCount: parsed.pageCount,
        status: "PROCESSING",
      },
    });

    // Index in Pinecone (async — don't block response)
    indexDocument(parsed.text, document.id, session.user.id)
      .then(async () => {
        await db.document.update({
          where: { id: document.id },
          data: { status: "READY", vectorized: true },
        });
      })
      .catch(async () => {
        await db.document.update({
          where: { id: document.id },
          data: { status: "FAILED" },
        });
      });

    return NextResponse.json({ document }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
