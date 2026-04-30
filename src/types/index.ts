export type { User, Document, ChatSession, Message, Subscription } from "@prisma/client";

export interface DocumentWithStats {
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
  _count?: { chatSessions: number };
}

export interface ChatMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  sources?: Array<{ text: string; pageNumber?: number }>;
  createdAt: Date;
}

export interface APIResponse<T> {
  data?: T;
  error?: string;
}

export type Plan = "FREE" | "PRO";
