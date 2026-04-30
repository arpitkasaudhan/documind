import { auth } from "@/lib/auth";
import { db } from "@/lib/db/prisma";
import { getPresignedUrl } from "@/lib/storage/s3";
import { parsePDF } from "@/lib/ai/pdf";
import { generateReport, type ReportType } from "@/lib/ai/report";
import { z } from "zod";

const schema = z.object({
  documentId: z.string(),
  reportType: z.enum(["summary", "analysis", "qa", "key_points"]),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const body = schema.parse(await req.json());

    const document = await db.document.findFirst({
      where: { id: body.documentId, userId: session.user.id, status: "READY" },
    });
    if (!document) {
      return new Response("Document not found or not ready", { status: 404 });
    }

    const signedUrl = await getPresignedUrl(document.fileKey);
    const res = await fetch(signedUrl);
    const buffer = Buffer.from(await res.arrayBuffer());
    const { text } = await parsePDF(buffer);

    const stream = await generateReport(
      text,
      body.reportType as ReportType,
      document.name
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return new Response(e.issues[0]?.message ?? "Invalid request", { status: 422 });
    }
    return new Response("Report generation failed", { status: 500 });
  }
}
