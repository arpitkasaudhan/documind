"use client";

import { useState } from "react";
import { ChatWindow } from "./ChatWindow";
import { SessionSidebar } from "./SessionSidebar";
import type { ChatMessage } from "@/hooks/useStreamChat";

interface Session {
  id: string;
  title: string;
  _count: { messages: number };
  messages: Array<{ content: string; createdAt: Date }>;
}

interface SessionWithMessages extends Session {
  fullMessages: ChatMessage[];
}

interface DocumentChatViewProps {
  documentId: string;
  sessions: Session[];
  activeSession: Session & { fullMessages: ChatMessage[] };
}

export function DocumentChatView({
  documentId,
  sessions,
  activeSession,
}: DocumentChatViewProps) {
  const [activeChatId, setActiveChatId] = useState(activeSession.id);
  const [loadedSessions, setLoadedSessions] = useState<Record<string, SessionWithMessages>>({
    [activeSession.id]: activeSession,
  });
  const [loading, setLoading] = useState(false);

  const handleSelectSession = async (sessionId: string) => {
    if (loadedSessions[sessionId]) {
      setActiveChatId(sessionId);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      const data = await res.json();
      const messages: ChatMessage[] = (data.session.messages ?? []).map(
        (m: { id: string; role: string; content: string }) => ({
          id: m.id,
          role: m.role === "USER" ? "user" as const : "assistant" as const,
          content: m.content,
        })
      );
      setLoadedSessions((prev) => ({
        ...prev,
        [sessionId]: { ...data.session, fullMessages: messages },
      }));
      setActiveChatId(sessionId);
    } finally {
      setLoading(false);
    }
  };

  const current = loadedSessions[activeChatId];

  return (
    <div className="flex-1 bg-white rounded-xl border border-neutral-200 overflow-hidden flex min-h-[600px]">
      <SessionSidebar
        documentId={documentId}
        sessions={sessions}
        activeChatSessionId={activeChatId}
        onSelectSession={handleSelectSession}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          </div>
        ) : current ? (
          <ChatWindow
            documentId={documentId}
            chatSessionId={activeChatId}
            initialMessages={current.fullMessages}
          />
        ) : null}
      </div>
    </div>
  );
}
