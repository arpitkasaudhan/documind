import { createEmbedding, createEmbeddings } from "./embeddings";
import { upsertVectors, queryVectors, VectorMetadata } from "../vector/pinecone";
import { chunkText } from "./chunker";

export async function indexDocument(
  text: string,
  documentId: string,
  userId: string
): Promise<number> {
  const chunks = chunkText(text, 1000, 200);
  if (chunks.length === 0) return 0;

  const texts = chunks.map((c) => c.text);
  const embeddings = await createEmbeddings(texts);

  const vectors = chunks.map((chunk, i) => ({
    id: `${documentId}-chunk-${i}`,
    values: embeddings[i],
    metadata: {
      documentId,
      userId,
      text: chunk.text,
      pageNumber: chunk.pageNumber,
      chunkIndex: chunk.chunkIndex,
    } as VectorMetadata,
  }));

  await upsertVectors(vectors);
  return chunks.length;
}

export interface RetrievedContext {
  text: string;
  pageNumber?: number;
  chunkIndex: number;
}

export async function retrieveContext(
  question: string,
  documentId: string,
  topK = 5
): Promise<RetrievedContext[]> {
  const queryEmbedding = await createEmbedding(question);
  const results = await queryVectors(queryEmbedding, documentId, topK);
  return results.map((r) => ({
    text: r.text,
    pageNumber: r.pageNumber,
    chunkIndex: r.chunkIndex,
  }));
}

export function buildRAGPrompt(
  question: string,
  context: RetrievedContext[]
): string {
  const contextText = context
    .map(
      (c, i) =>
        `[Source ${i + 1}${c.pageNumber ? ` - Page ${c.pageNumber}` : ""}]\n${c.text}`
    )
    .join("\n\n");

  return `You are a helpful document assistant. Answer the user's question based ONLY on the provided document context below.
If the answer is not found in the context, say "I couldn't find this information in the document."
Always reference which source you used (e.g., "According to Source 1...").

DOCUMENT CONTEXT:
${contextText}

USER QUESTION: ${question}`;
}
