"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ChevronLeft, Zap, Loader2, Copy, Check, FileText, Receipt, FileSignature } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

const PRESETS = [
  {
    id: "invoice",
    label: "Invoice",
    description: "Extract invoice number, vendor, amounts, dates",
    icon: Receipt,
    color: "bg-amber-100 text-amber-700",
  },
  {
    id: "contract",
    label: "Contract",
    description: "Extract parties, dates, key obligations, clauses",
    icon: FileSignature,
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "custom",
    label: "Custom",
    description: "Describe what you want to extract",
    icon: FileText,
    color: "bg-violet-100 text-violet-700",
  },
] as const;

type PresetId = "invoice" | "contract" | "custom";

export default function ExtractPage({ params }: PageProps) {
  const { id: documentId } = use(params);
  const [selected, setSelected] = useState<PresetId>("invoice");
  const [customInstruction, setCustomInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const extract = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const body =
        selected === "custom"
          ? { documentId, customInstruction }
          : { documentId, preset: selected };

      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.extracted);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Extraction failed");
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link href={`/documents/${documentId}`}>
          <Button variant="ghost" size="sm" className="gap-1.5 text-neutral-500 mb-6">
            <ChevronLeft className="w-4 h-4" />
            Back to chat
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-violet-600" />
            Extract structured data
          </h1>
          <p className="text-neutral-500 mt-1">Choose a preset or describe what to extract from your document.</p>
        </div>

        {/* Preset selector */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setSelected(preset.id as PresetId)}
              className={cn(
                "p-4 rounded-xl border text-left transition-all",
                selected === preset.id
                  ? "border-violet-500 ring-2 ring-violet-200 bg-white"
                  : "border-neutral-200 bg-white hover:border-neutral-300"
              )}
            >
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", preset.color)}>
                <preset.icon className="w-5 h-5" />
              </div>
              <p className="font-semibold text-neutral-900 text-sm">{preset.label}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{preset.description}</p>
            </button>
          ))}
        </div>

        {/* Custom instruction input */}
        {selected === "custom" && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Extraction instruction
            </label>
            <textarea
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              placeholder="e.g. Extract all employee names, their departments, and their salaries from this HR document."
              className="w-full h-24 rounded-lg border border-neutral-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        )}

        <Button
          onClick={extract}
          disabled={loading || (selected === "custom" && !customInstruction.trim())}
          size="lg"
          className="w-full mb-8"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Extracting with Claude AI…</>
          ) : (
            <><Zap className="w-4 h-4" /> Extract now</>
          )}
        </Button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Extracted data</CardTitle>
                  <CardDescription>
                    <Badge variant="success" className="mt-1">Extraction complete</Badge>
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={copyResult} className="gap-1.5">
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy JSON"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(result).map(([key, value]) => (
                  <div key={key} className="flex gap-3 border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide w-32 shrink-0 pt-0.5">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm text-neutral-900 flex-1">
                      {typeof value === "string" ? value : JSON.stringify(value)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
