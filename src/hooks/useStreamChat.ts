"use client";

import { useState, useCallback } from "react";

export interface Source {
  text: string;
  pageNumber?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

interface UseStreamChatOptions {
  api: string;
  body: Record<string, unknown>;
  initialMessages?: ChatMessage[];
}

export function useStreamChat({ api, body, initialMessages = [] }: UseStreamChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const text = input.trim();
      if (!text || isLoading) return;

      const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: text };
      const assistantId = `a-${Date.now()}`;

      setMessages((prev) => [...prev, userMsg, { id: assistantId, role: "assistant", content: "" }]);
      setInput("");
      setIsLoading(true);

      try {
        const res = await fetch(api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [...messages, userMsg], ...body }),
        });

        if (!res.ok || !res.body) {
          throw new Error(await res.text());
        }

        // Read sources from response header
        const sourcesHeader = res.headers.get("X-Sources");
        const sources: Source[] = sourcesHeader ? JSON.parse(sourcesHeader) : [];

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + chunk } : m
            )
          );
        }

        // Attach sources after streaming completes
        if (sources.length > 0) {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, sources } : m))
          );
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Something went wrong";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: `Error: ${msg}` } : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [api, body, input, isLoading, messages]
  );

  return {
    messages,
    input,
    setInput,
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
      setInput(e.target.value),
    handleSubmit,
    isLoading,
  };
}
