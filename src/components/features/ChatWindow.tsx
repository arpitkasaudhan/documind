"use client";

import { useChat } from "ai/react";
import { useRef, useEffect } from "react";
import { Send, Loader2, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
  documentId: string;
  chatSessionId: string;
  initialMessages?: Array<{ id: string; role: "user" | "assistant"; content: string }>;
}

export function ChatWindow({ documentId, chatSessionId, initialMessages = [] }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    body: { documentId, chatSessionId },
    initialMessages,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-neutral-400">
            <Bot className="w-12 h-12 mb-3 text-neutral-300" />
            <p className="font-medium">Ask anything about your document</p>
            <p className="text-sm mt-1">I&apos;ll find the relevant sections and cite them.</p>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex gap-3 max-w-[85%]",
              m.role === "user" ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              m.role === "user" ? "bg-violet-600" : "bg-neutral-200"
            )}>
              {m.role === "user"
                ? <User className="w-4 h-4 text-white" />
                : <Bot className="w-4 h-4 text-neutral-600" />
              }
            </div>
            <div className={cn(
              "rounded-xl px-4 py-3 text-sm leading-relaxed",
              m.role === "user"
                ? "bg-violet-600 text-white rounded-tr-sm"
                : "bg-neutral-100 text-neutral-900 rounded-tl-sm"
            )}>
              {m.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
              <Bot className="w-4 h-4 text-neutral-600" />
            </div>
            <div className="bg-neutral-100 rounded-xl rounded-tl-sm px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-neutral-200 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about your document…"
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
