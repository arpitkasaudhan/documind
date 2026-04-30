import { Pinecone, type PineconeRecord } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

export const getPineconeIndex = () =>
  pinecone.Index(process.env.PINECONE_INDEX!);

export interface VectorMetadata {
  documentId: string;
  userId: string;
  text: string;
  pageNumber: number;
  chunkIndex: number;
}

export async function upsertVectors(
  vectors: Array<{ id: string; values: number[]; metadata: VectorMetadata }>
) {
  const index = getPineconeIndex();
  const records: PineconeRecord[] = vectors.map((v) => ({
    id: v.id,
    values: v.values,
    metadata: {
      documentId: v.metadata.documentId,
      userId: v.metadata.userId,
      text: v.metadata.text,
      pageNumber: v.metadata.pageNumber ?? 0,
      chunkIndex: v.metadata.chunkIndex,
    },
  }));
  await index.upsert({ records });
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
    filter: { documentId: { $eq: documentId } },
    includeMetadata: true,
  });
  return (result.matches ?? [])
    .filter((m) => m.metadata)
    .map((m) => m.metadata as unknown as VectorMetadata);
}

export async function deleteDocumentVectors(documentId: string) {
  const index = getPineconeIndex();
  await index.deleteMany({
    filter: { documentId: { $eq: documentId } },
  } as Parameters<typeof index.deleteMany>[0]);
}
