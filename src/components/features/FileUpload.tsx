"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatBytes } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface FileUploadProps {
  onSuccess?: (documentId: string) => void;
}

export function FileUpload({ onSuccess }: FileUploadProps) {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (f: File) => {
    setError(null);
    if (f.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB.");
      return;
    }
    setFile(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }, []);

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSuccess?.(data.document.id);
      router.push(`/documents/${data.document.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !file && document.getElementById("file-input")?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all",
          dragging ? "border-violet-500 bg-violet-50" : "border-neutral-300 hover:border-violet-400 hover:bg-neutral-50",
          file && "cursor-default"
        )}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {file ? (
          <div className="flex items-center gap-3 justify-center">
            <FileText className="w-8 h-8 text-violet-600 shrink-0" />
            <div className="text-left min-w-0">
              <p className="font-medium text-neutral-900 truncate">{file.name}</p>
              <p className="text-sm text-neutral-500">{formatBytes(file.size)}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="ml-auto text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
            <p className="font-medium text-neutral-700">Drop your PDF here</p>
            <p className="text-sm text-neutral-400 mt-1">or click to browse · Max 10MB</p>
          </>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {file && (
        <Button onClick={upload} disabled={uploading} className="w-full mt-4" size="lg">
          {uploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Uploading & processing…</>
          ) : (
            <><Upload className="w-4 h-4" /> Upload Document</>
          )}
        </Button>
      )}
    </div>
  );
}
