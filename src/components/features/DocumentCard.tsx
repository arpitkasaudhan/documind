"use client";

import Link from "next/link";
import { FileText, MessageSquare, Trash2, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBytes, formatDate } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
  READY: { label: "Ready", variant: "success" as const, icon: CheckCircle, spin: false },
  FAILED: { label: "Failed", variant: "danger" as const, icon: AlertCircle, spin: false },
};

export function DocumentCard({
  id, name, fileSize, pageCount, status, createdAt, chatCount,
}: DocumentCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const cfg = statusConfig[status];
  const StatusIcon = cfg.icon;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("Delete this document and all its chats?")) return;
    setDeleting(true);
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-violet-600" />
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/documents/${id}`}>
              <h3 className="font-semibold text-neutral-900 truncate hover:text-violet-600 transition-colors">
                {name}
              </h3>
            </Link>
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
            className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-red-600"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
