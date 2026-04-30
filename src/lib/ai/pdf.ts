// pdf-parse v2 requires a dynamic require to avoid ESM issues in Next.js
export interface ParsedPDF {
  text: string;
  pageCount: number;
  info: Record<string, unknown>;
}

export async function parsePDF(buffer: Buffer): Promise<ParsedPDF> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");
  const data = await pdfParse(buffer);
  return {
    text: data.text as string,
    pageCount: data.numpages as number,
    info: (data.info ?? {}) as Record<string, unknown>,
  };
}
