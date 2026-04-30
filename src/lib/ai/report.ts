import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type ReportType = "summary" | "analysis" | "qa" | "key_points";

const REPORT_PROMPTS: Record<ReportType, string> = {
  summary: `Write a comprehensive executive summary of this document.
Structure your response with these sections:
1. **Overview** — What this document is about (2-3 sentences)
2. **Key Points** — 5-7 bullet points of the most important information
3. **Conclusions** — Main takeaways and implications
Be concise, professional, and factual.`,

  analysis: `Perform a detailed analytical review of this document.
Structure your response with:
1. **Purpose & Context** — Why this document exists and for whom
2. **Main Arguments/Content** — Core ideas, data, or claims presented
3. **Strengths** — Well-supported points or notable aspects
4. **Gaps or Limitations** — What's missing or could be improved
5. **Overall Assessment** — Your professional evaluation
Be objective and evidence-based.`,

  qa: `Create a comprehensive Q&A document based on this content.
Generate 8-12 important questions that someone reading this document would want answered, and provide thorough answers based on the document content.
Format as:
**Q: [question]**
A: [answer]

Cover the most important topics, definitions, processes, and facts in the document.`,

  key_points: `Extract and explain all the key points from this document.
Format as a structured list:
- Use **bold** for each key point title
- Follow with 1-2 sentences of explanation
- Group related points under subheadings if applicable
- Include any important numbers, dates, or names mentioned
- End with a "Bottom Line" section of 1-2 sentences`,
};

export async function generateReport(
  documentText: string,
  reportType: ReportType,
  documentName: string
): Promise<ReadableStream> {
  const prompt = REPORT_PROMPTS[reportType];

  const stream = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 8192,
    thinking: { type: "adaptive" },
    messages: [
      {
        role: "user",
        content: `Generate a ${reportType} report for the document titled "${documentName}".

${prompt}

DOCUMENT CONTENT:
${documentText.slice(0, 80000)}`,
      },
    ],
    stream: true,
  });

  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } finally {
        controller.close();
      }
    },
  });
}
