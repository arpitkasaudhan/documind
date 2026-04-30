import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/prisma";
import { getPresignedUrl } from "@/lib/storage/s3";
import { parsePDF } from "@/lib/ai/pdf";
import { extractStructuredData } from "@/lib/ai/extract";
import { z } from "zod";

const EXTRACTION_PRESETS = {
  invoice: {
    instruction: "Extract all invoice information from this document.",
    schema: {
      type: "object" as const,
      properties: {
        invoice_number: { type: "string" },
        vendor_name: { type: "string" },
        date: { type: "string" },
        due_date: { type: "string" },
        total_amount: { type: "string" },
        currency: { type: "string" },
        line_items: { type: "string", description: "Summary of items" },
      },
      required: ["invoice_number", "total_amount"],
    },
  },
  contract: {
    instruction: "Extract key contract terms and parties from this document.",
    schema: {
      type: "object" as const,
      properties: {
        parties: { type: "string" },
        effective_date: { type: "string" },
        expiry_date: { type: "string" },
        key_obligations: { type: "string" },
        penalty_clauses: { type: "string" },
        jurisdiction: { type: "string" },
      },
      required: ["parties"],
    },
  },
};

const schema = z.object({
  documentId: z.string(),
  preset: z.enum(["invoice", "contract"]).optional(),
  customInstruction: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = schema.parse(await req.json());
    const document = await db.document.findFirst({
      where: { id: body.documentId, userId: session.user.id },
    });
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const signedUrl = await getPresignedUrl(document.fileKey);
    const res = await fetch(signedUrl);
    const buffer = Buffer.from(await res.arrayBuffer());
    const { text } = await parsePDF(buffer);

    const preset = body.preset ? EXTRACTION_PRESETS[body.preset] : null;
    const instruction =
      preset?.instruction ?? body.customInstruction ?? "Extract key information.";
    const extractionSchema = preset?.schema ?? {
      type: "object" as const,
      properties: {
        summary: { type: "string" },
        key_points: { type: "string" },
      },
      required: ["summary"],
    };

    const extracted = await extractStructuredData(text, extractionSchema, instruction);
    return NextResponse.json({ extracted });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message ?? "Validation error" }, { status: 422 });
    }
    return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
  }
}
