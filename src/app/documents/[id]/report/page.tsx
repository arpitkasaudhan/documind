"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ChevronLeft, FileBarChart2, Loader2, Copy, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ id: string }>;
}

const REPORT_TYPES = [
  {
    id: "summary",
    label: "Executive Summary",
    description: "High-level overview with key points and conclusions",
    icon: "📋",
  },
  {
    id: "analysis",
    label: "Deep Analysis",
    description: "Purpose, arguments, strengths, gaps, and assessment",
    icon: "🔍",
  },
  {
    id: "qa",
    label: "Q&A Document",
    description: "8–12 questions and answers covering the document",
    icon: "💬",
  },
  {
    id: "key_points",
    label: "Key Points",
    description: "Structured list of all important facts and takeaways",
    icon: "✅",
  },
] as const;

type ReportTypeId = (typeof REPORT_TYPES)[number]["id"];

export default function ReportPage({ params }: PageProps) {
  const { id: documentId } = use(params);
  const [selected, setSelected] = useState<ReportTypeId>("summary");
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setGenerating(true);
    setReport("");
    const loadingToast = toast.loading("Generating report with Claude AI…");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, reportType: selected }),
      });

      if (!res.ok || !res.body) {
        throw new Error(await res.text());
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        setReport(full);
      }

      toast.dismiss(loadingToast);
      toast.success("Report generated!");
    } catch (e) {
      toast.dismiss(loadingToast);
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const copyReport = () => {
    navigator.clipboard.writeText(report);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReport = () => {
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${selected}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  // Render markdown-like bold text
  const renderReport = (text: string) => {
    return text.split("\n").map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={i}>
          {parts.map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={j}>{part.slice(2, -2)}</strong>
            ) : (
              part
            )
          )}
          {"\n"}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link href={`/documents/${documentId}`}>
          <Button variant="ghost" size="sm" className="gap-1.5 text-neutral-500 mb-6">
            <ChevronLeft className="w-4 h-4" />
            Back to chat
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <FileBarChart2 className="w-6 h-6 text-violet-600" />
            Generate AI Report
          </h1>
          <p className="text-neutral-500 mt-1">
            Let Claude analyze your document and write a professional report.
          </p>
        </div>

        {/* Report type selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {REPORT_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelected(type.id)}
              className={cn(
                "p-4 rounded-xl border text-left transition-all",
                selected === type.id
                  ? "border-violet-500 ring-2 ring-violet-200 bg-white"
                  : "border-neutral-200 bg-white hover:border-neutral-300"
              )}
            >
              <div className="text-2xl mb-2">{type.icon}</div>
              <p className="font-semibold text-neutral-900 text-sm">{type.label}</p>
              <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{type.description}</p>
            </button>
          ))}
        </div>

        <Button
          onClick={generate}
          disabled={generating}
          size="lg"
          className="w-full mb-8"
        >
          {generating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Writing report…</>
          ) : (
            <><FileBarChart2 className="w-4 h-4" /> Generate report</>
          )}
        </Button>

        {/* Report output */}
        {(report || generating) && (
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
              <h2 className="font-semibold text-neutral-800">
                {REPORT_TYPES.find((t) => t.id === selected)?.label}
              </h2>
              {report && !generating && (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={copyReport} className="gap-1.5">
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    Copy
                  </Button>
                  <Button variant="ghost" size="sm" onClick={downloadReport} className="gap-1.5">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              )}
            </div>
            <div className="p-5">
              {generating && !report && (
                <div className="flex items-center gap-2 text-neutral-500 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Claude is thinking…
                </div>
              )}
              <pre className="whitespace-pre-wrap text-sm text-neutral-800 leading-relaxed font-sans">
                {renderReport(report)}
                {generating && (
                  <span className="inline-block w-0.5 h-4 bg-violet-600 animate-pulse ml-0.5" />
                )}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
