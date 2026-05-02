"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle, ExternalLink, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PDFViewerProps {
  documentId: string;
  documentName: string;
}

export function PDFViewer({ documentId, documentName }: PDFViewerProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch(`/api/documents/${documentId}/url`)
      .then((r) => r.json())
      .then((d) => {
        if (d.url) setUrl(d.url);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [documentId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-100 rounded-xl">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-2" />
          <p className="text-sm text-neutral-500">Loading PDF…</p>
        </div>
      </div>
    );
  }

  if (error || !url) {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-100 rounded-xl">
        <div className="text-center text-neutral-400">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Could not load PDF preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col rounded-xl border border-neutral-200 overflow-hidden bg-neutral-100 transition-all ${expanded ? "fixed inset-4 z-50 shadow-2xl" : "flex-1 min-h-0"}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-neutral-200 shrink-0">
        <p className="text-sm font-medium text-neutral-700 truncate max-w-xs">{documentName}</p>
        <div className="flex items-center gap-1">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" title="Open in new tab">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded((v) => !v)}
            title={expanded ? "Minimize" : "Fullscreen"}
          >
            {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      <iframe
        src={`${url}#toolbar=1&navpanes=1&scrollbar=1`}
        className="flex-1 w-full min-h-0"
        title={documentName}
      />
      {expanded && (
        <div
          className="fixed inset-0 -z-10 bg-black/50"
          onClick={() => setExpanded(false)}
        />
      )}
    </div>
  );
}
