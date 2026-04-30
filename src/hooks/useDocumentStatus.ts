"use client";

import { useState, useEffect, useRef } from "react";

type DocumentStatus = "PROCESSING" | "READY" | "FAILED";

export function useDocumentStatus(
  documentId: string,
  initialStatus: DocumentStatus
) {
  const [status, setStatus] = useState<DocumentStatus>(initialStatus);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status !== "PROCESSING") return;

    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/documents/${documentId}`);
        if (!res.ok) return;
        const data = await res.json();
        const newStatus: DocumentStatus = data.document?.status;
        if (newStatus && newStatus !== "PROCESSING") {
          setStatus(newStatus);
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (newStatus === "READY") {
            // Reload the page so the chat UI appears
            window.location.reload();
          }
        }
      } catch {
        // ignore network errors
      }
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [documentId, status]);

  return status;
}
