"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SessionSidebarProps {
  documentId: string;
  sessions: Array<{
    id: string;
    title: string;
    _count: { messages: number };
    messages: Array<{ content: string; createdAt: Date }>;
  }>;
  activeChatSessionId: string;
  onSelectSession: (id: string) => void;
}

export function SessionSidebar({
  documentId,
  sessions: initialSessions,
  activeChatSessionId,
  onSelectSession,
}: SessionSidebarProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState(initialSessions);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const createSession = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });
      const data = await res.json();
      if (data.session) {
        setSessions((prev) => [{ ...data.session, _count: { messages: 0 }, messages: [] }, ...prev]);
        onSelectSession(data.session.id);
      }
    } finally {
      setCreating(false);
    }
  };

  const deleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setDeletingId(sessionId);
    await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeChatSessionId === sessionId) {
      const remaining = sessions.filter((s) => s.id !== sessionId);
      if (remaining.length > 0) onSelectSession(remaining[0].id);
    }
    setDeletingId(null);
    router.refresh();
  };

  return (
    <div className="w-64 border-r border-neutral-200 flex flex-col bg-neutral-50 shrink-0">
      <div className="p-3 border-b border-neutral-200">
        <Button onClick={createSession} disabled={creating} className="w-full" size="sm" variant="outline">
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          New chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sessions.length === 0 && (
          <p className="text-xs text-neutral-400 text-center py-4">No chats yet</p>
        )}
        {sessions.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelectSession(s.id)}
            className={cn(
              "w-full text-left p-2.5 rounded-lg text-sm transition-all group flex items-start gap-2",
              s.id === activeChatSessionId
                ? "bg-violet-100 text-violet-900"
                : "hover:bg-neutral-200 text-neutral-700"
            )}
          >
            <MessageSquare className="w-4 h-4 mt-0.5 shrink-0 text-neutral-400" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{s.title}</p>
              {s.messages[0] && (
                <p className="text-xs text-neutral-400 truncate mt-0.5">
                  {s.messages[0].content.slice(0, 40)}…
                </p>
              )}
              <p className="text-xs text-neutral-400">{s._count.messages} messages</p>
            </div>
            <button
              onClick={(e) => deleteSession(e, s.id)}
              className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-all mt-0.5"
            >
              {deletingId === s.id
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Trash2 className="w-3.5 h-3.5" />
              }
            </button>
          </button>
        ))}
      </div>
    </div>
  );
}
