"use client";

import { useDocumentStatus } from "@/hooks/useDocumentStatus";
import { Loader2 } from "lucide-react";

interface ProcessingStatusProps {
  documentId: string;
}

export function ProcessingStatus({ documentId }: ProcessingStatusProps) {
  useDocumentStatus(documentId, "PROCESSING");

  return (
    <div className="flex-1 bg-white rounded-xl border border-neutral-200 flex items-center justify-center py-20">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-violet-400 animate-spin mx-auto mb-4" />
        <p className="font-medium text-neutral-700">Processing your document…</p>
        <p className="text-sm text-neutral-400 mt-1">
          Building the AI index. This takes 30–60 seconds.
        </p>
        <p className="text-xs text-neutral-400 mt-3">Auto-refreshes when ready</p>
      </div>
    </div>
  );
}
