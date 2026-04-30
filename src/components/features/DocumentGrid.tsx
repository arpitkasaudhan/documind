"use client";

import { useState, useMemo } from "react";
import { Search, Upload, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DocumentCard } from "./DocumentCard";
import type { Document } from "@prisma/client";

interface DocumentGridProps {
  documents: Array<Document & { _count: { chatSessions: number } }>;
  docLimit: number;
}

export function DocumentGrid({ documents, docLimit }: DocumentGridProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return documents;
    const q = query.toLowerCase();
    return documents.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.originalName.toLowerCase().includes(q)
    );
  }, [documents, query]);

  return (
    <div>
      {/* Search bar */}
      {documents.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <Input
            placeholder="Search documents…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Empty state */}
      {documents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-neutral-200">
          <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="font-medium text-neutral-600">No documents yet</p>
          <p className="text-sm text-neutral-400 mt-1">Upload your first PDF above to get started.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
          <Search className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <p className="font-medium text-neutral-600">No results for &ldquo;{query}&rdquo;</p>
          <button
            onClick={() => setQuery("")}
            className="text-sm text-violet-600 mt-2 hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <DocumentCard
              key={doc.id}
              id={doc.id}
              name={doc.name}
              originalName={doc.originalName}
              fileSize={doc.fileSize}
              pageCount={doc.pageCount}
              status={doc.status}
              createdAt={doc.createdAt}
              chatCount={doc._count.chatSessions}
            />
          ))}
          {/* Add more slot */}
          {!query && documents.length < docLimit && (
            <button
              onClick={() => document.getElementById("file-input")?.click()}
              className="border-2 border-dashed border-neutral-300 rounded-xl p-6 flex flex-col items-center justify-center text-neutral-400 hover:border-violet-400 hover:text-violet-500 transition-all"
            >
              <Upload className="w-8 h-8 mb-2" />
              <span className="text-sm">Add document</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
