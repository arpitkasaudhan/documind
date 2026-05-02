"use client";

import { useRef, useEffect, useState } from "react";
import { Send, Loader2, Bot, User, Copy, Check, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStreamChat, type ChatMessage } from "@/hooks/useStreamChat";
import { toast } from "sonner";

interface ChatWindowProps {
  documentId: string;
  chatSessionId: string;
  initialMessages?: ChatMessage[];
}

export function ChatWindow({ documentId, chatSessionId, initialMessages = [] }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { messages, input, setInput, handleSubmit, isLoading } = useStreamChat({
    api: "/api/chat",
    body: { documentId, chatSessionId },
    initialMessages,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-neutral-400 py-16">
            <Bot className="w-12 h-12 mb-3 text-neutral-300" />
            <p className="font-medium">Ask anything about your document</p>
            <p className="text-sm mt-1 max-w-xs">
              I search the relevant sections and answer with citations.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {["Summarize this document", "What are the key points?", "Explain the main topic"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="text-xs bg-neutral-100 hover:bg-violet-100 hover:text-violet-700 text-neutral-600 px-3 py-1.5 rounded-full border border-neutral-200 hover:border-violet-300 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={cn("group flex gap-3", m.role === "user" ? "flex-row-reverse" : "")}>
            {/* Avatar */}
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
              m.role === "user" ? "bg-violet-600" : "bg-neutral-200"
            )}>
              {m.role === "user"
                ? <User className="w-4 h-4 text-white" />
                : <Bot className="w-4 h-4 text-neutral-600" />
              }
            </div>

            <div className={cn("max-w-[80%]", m.role === "user" ? "items-end" : "items-start", "flex flex-col gap-1")}>
              {/* Bubble */}
              <div className={cn(
                "rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap relative",
                m.role === "user"
                  ? "bg-violet-600 text-white rounded-tr-sm"
                  : "bg-neutral-100 text-neutral-900 rounded-tl-sm"
              )}>
                {m.content || (m.role === "assistant" && isLoading && (
                  <span className="inline-flex gap-1 items-center py-0.5">
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
                  </span>
                ))}

                {/* Copy button */}
                {m.content && (
                  <button
                    onClick={() => copyMessage(m.id, m.content)}
                    className={cn(
                      "absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all",
                      "bg-white border border-neutral-200 shadow-sm opacity-0 group-hover:opacity-100",
                      "hover:bg-neutral-50"
                    )}
                    title="Copy message"
                  >
                    {copiedId === m.id
                      ? <Check className="w-3 h-3 text-emerald-500" />
                      : <Copy className="w-3 h-3 text-neutral-400" />
                    }
                  </button>
                )}
              </div>

              {/* Source citations */}
              {m.role === "assistant" && m.sources && m.sources.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {m.sources.slice(0, 3).map((s, i) => (
                    <div
                      key={i}
                      className="inline-flex items-center gap-1 bg-violet-50 border border-violet-200 text-violet-700 text-xs px-2 py-0.5 rounded-full"
                      title={s.text}
                    >
                      <BookOpen className="w-3 h-3 shrink-0" />
                      {s.pageNumber ? `Page ${s.pageNumber}` : `Source ${i + 1}`}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-neutral-200 p-3 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your document… (Enter to send, Shift+Enter for new line)"
              disabled={isLoading}
              rows={1}
              className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 max-h-[120px] overflow-y-auto"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="icon"
            className="shrink-0 h-10 w-10"
          >
            {isLoading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />
            }
          </Button>
        </form>
        <p className="text-xs text-neutral-400 mt-1.5 px-1">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
