export type {
  User,
  Document,
  ChatSession,
  Message,
  Subscription,
  DocumentStatus,
  MessageRole,
  Plan,
} from "@prisma/client";

export interface DocumentWithChatCount {
  id: string;
  name: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  pageCount: number | null;
  status: "PROCESSING" | "READY" | "FAILED";
  vectorized: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: { chatSessions: number };
}

export interface APIResponse<T> {
  data?: T;
  error?: string;
}
