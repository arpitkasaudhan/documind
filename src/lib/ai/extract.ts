import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ExtractionSchema {
  type: "object";
  properties: Record<string, { type: string; description?: string }>;
  required?: string[];
  additionalProperties?: boolean;
}

export async function extractStructuredData(
  documentText: string,
  schema: ExtractionSchema,
  instruction: string
): Promise<Record<string, unknown>> {
  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `${instruction}

Respond ONLY with a valid JSON object matching this schema (no markdown, no explanation):
${JSON.stringify({ ...schema, additionalProperties: false }, null, 2)}

DOCUMENT CONTENT:
${documentText.slice(0, 50000)}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from extraction");
  }
  // Strip markdown code fences if present
  const raw = textBlock.text.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(raw);
}

export async function generateDocumentSummary(
  documentText: string
): Promise<string> {
  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Summarize this document in 3-5 sentences. Focus on the main topic, key points, and purpose.

DOCUMENT:
${documentText.slice(0, 30000)}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return "";
  return textBlock.text;
}
