"use client";

import { useState } from "react";
import { FileText, MessageSquare } from "lucide-react";
import { PDFViewer } from "./PDFViewer";
import { DocumentChatView } from "./DocumentChatView";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/hooks/useStreamChat";

interface Session {
  id: string;
  title: string;
  _count: { messages: number };
  messages: Array<{ content: string; createdAt: Date }>;
}

interface DocumentViewProps {
  documentId: string;
  documentName: string;
  sessions: Session[];
  activeSession: Session & { fullMessages: ChatMessage[] };
}

export function DocumentView({
  documentId,
  documentName,
  sessions,
  activeSession,
}: DocumentViewProps) {
  const [mobileTab, setMobileTab] = useState<"chat" | "pdf">("chat");

  return (
    <div className="flex-1 flex flex-col min-h-[600px]">
      {/* Mobile tab switcher — hidden on lg */}
      <div className="flex lg:hidden bg-white rounded-xl border border-neutral-200 p-1 mb-3">
        {(["chat", "pdf"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
              mobileTab === tab
                ? "bg-violet-600 text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            )}
          >
            {tab === "chat" ? (
              <><MessageSquare className="w-4 h-4" /> Chat</>
            ) : (
              <><FileText className="w-4 h-4" /> PDF</>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* PDF — desktop always visible, mobile conditionally */}
        <div className={cn(
          "lg:flex lg:flex-1 min-h-0",
          mobileTab === "pdf" ? "flex flex-1" : "hidden"
        )}>
          <PDFViewer documentId={documentId} documentName={documentName} />
        </div>

        {/* Chat — desktop always visible, mobile conditionally */}
        <div className={cn(
          "lg:flex lg:w-[480px] lg:shrink-0 min-h-[500px]",
          mobileTab === "chat" ? "flex flex-1 flex-col" : "hidden"
        )}>
          <DocumentChatView
            documentId={documentId}
            sessions={sessions}
            activeSession={activeSession}
          />
        </div>
      </div>
    </div>
  );
}
