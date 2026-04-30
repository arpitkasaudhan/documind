import pdfParse from "pdf-parse";

export interface ParsedPDF {
  text: string;
  pageCount: number;
  info: Record<string, unknown>;
}

export async function parsePDF(buffer: Buffer): Promise<ParsedPDF> {
  const data = await pdfParse(buffer);
  return {
    text: data.text,
    pageCount: data.numpages,
    info: data.info as Record<string, unknown>,
  };
}
