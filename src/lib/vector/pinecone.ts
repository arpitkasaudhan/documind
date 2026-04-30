import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

export const getPineconeIndex = () =>
  pinecone.Index(process.env.PINECONE_INDEX!);

export interface VectorMetadata {
  documentId: string;
  userId: string;
  text: string;
  pageNumber?: number;
  chunkIndex: number;
}

export async function upsertVectors(
  vectors: Array<{ id: string; values: number[]; metadata: VectorMetadata }>
) {
  const index = getPineconeIndex();
  await index.upsert(vectors);
}

export async function queryVectors(
  queryVector: number[],
  documentId: string,
  topK = 5
): Promise<VectorMetadata[]> {
  const index = getPineconeIndex();
  const result = await index.query({
    vector: queryVector,
    topK,
    filter: { documentId },
    includeMetadata: true,
  });
  return (result.matches ?? []).map((m) => m.metadata as VectorMetadata);
}

export async function deleteDocumentVectors(documentId: string) {
  const index = getPineconeIndex();
  await index.deleteMany({ documentId });
}
