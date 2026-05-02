"use client";

import Link from "next/link";
import { FileText, MessageSquare, Trash2, Loader2, CheckCircle, AlertCircle, Pencil, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBytes, formatDate } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DocumentCardProps {
  id: string;
  name: string;
  originalName: string;
  fileSize: number;
  pageCount: number | null;
  status: "PROCESSING" | "READY" | "FAILED";
  createdAt: Date;
  chatCount: number;
}

const statusConfig = {
  PROCESSING: { label: "Processing", variant: "warning" as const, icon: Loader2, spin: true },
  READY:      { label: "Ready",      variant: "success" as const, icon: CheckCircle, spin: false },
  FAILED:     { label: "Failed",     variant: "danger"  as const, icon: AlertCircle, spin: false },
};

export function DocumentCard({ id, name: initialName, fileSize, pageCount, status, createdAt, chatCount }: DocumentCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(initialName);
  const [draft, setDraft] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  const cfg = statusConfig[status];
  const StatusIcon = cfg.icon;

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const startEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    setDraft(name);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setDraft(name);
  };

  const saveRename = async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === name) { cancelEdit(); return; }
    setRenaming(true);
    try {
      const res = await fetch(`/api/documents/${id}/rename`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setName(trimmed);
      setEditing(false);
      toast.success("Document renamed");
      router.refresh();
    } catch {
      toast.error("Failed to rename");
    } finally {
      setRenaming(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm(`Delete "${name}" and all its chats?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success(`"${name}" deleted`); router.refresh(); }
      else toast.error("Failed to delete document");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-violet-600" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Title — normal or editing */}
            {editing ? (
              <div className="flex items-center gap-1 -ml-1">
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveRename();
                    if (e.key === "Escape") cancelEdit();
                  }}
                  className="flex-1 min-w-0 text-sm font-semibold border border-violet-400 rounded px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button onClick={saveRename} disabled={renaming} className="text-emerald-600 hover:text-emerald-700 p-0.5">
                  {renaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button onClick={cancelEdit} className="text-neutral-400 hover:text-neutral-600 p-0.5">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 group/title">
                <Link href={`/documents/${id}`}>
                  <h3 className="font-semibold text-neutral-900 truncate hover:text-violet-600 transition-colors text-sm">
                    {name}
                  </h3>
                </Link>
                <button
                  onClick={startEdit}
                  className="opacity-0 group-hover/title:opacity-100 text-neutral-400 hover:text-neutral-600 p-0.5 transition-opacity shrink-0"
                  title="Rename"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
              <span>{formatBytes(fileSize)}</span>
              {pageCount && <span>{pageCount} pages</span>}
              <span>{formatDate(createdAt)}</span>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <Badge variant={cfg.variant}>
                <StatusIcon className={`w-3 h-3 mr-1 ${cfg.spin ? "animate-spin" : ""}`} />
                {cfg.label}
              </Badge>
              {chatCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-neutral-500">
                  <MessageSquare className="w-3 h-3" />
                  {chatCount} chats
                </span>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={deleting}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-red-600 shrink-0"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
