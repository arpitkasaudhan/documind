export interface TextChunk {
  text: string;
  pageNumber?: number;
  chunkIndex: number;
}

export function chunkText(
  text: string,
  chunkSize = 1000,
  overlap = 200
): TextChunk[] {
  const chunks: TextChunk[] = [];
  const sentences = text.split(/(?<=[.?!])\s+/);
  let current = "";
  let chunkIndex = 0;

  for (const sentence of sentences) {
    if ((current + sentence).length > chunkSize && current.length > 0) {
      chunks.push({ text: current.trim(), chunkIndex });
      // overlap: keep last portion
      const words = current.split(" ");
      const overlapWords = words.slice(-Math.floor(overlap / 5));
      current = overlapWords.join(" ") + " " + sentence;
      chunkIndex++;
    } else {
      current += (current ? " " : "") + sentence;
    }
  }

  if (current.trim()) {
    chunks.push({ text: current.trim(), chunkIndex });
  }

  return chunks;
}

export function chunkByPage(pages: string[]): TextChunk[] {
  const chunks: TextChunk[] = [];
  pages.forEach((pageText, pageIndex) => {
    const pageChunks = chunkText(pageText);
    pageChunks.forEach((chunk) => {
      chunks.push({ ...chunk, pageNumber: pageIndex + 1 });
    });
  });
  return chunks;
}
