import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/prisma";
import { Navbar } from "@/components/features/Navbar";
import { DocumentView } from "@/components/features/DocumentView";
import { ProcessingStatus } from "@/components/features/ProcessingStatus";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText, ExternalLink, ChevronLeft, Zap, FileBarChart2,
} from "lucide-react";
import { formatBytes, formatDate } from "@/lib/utils";
import type { ChatMessage } from "@/hooks/useStreamChat";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const session = await auth();
  if (!session?.user?.id) return { title: "Document — DocuMind" };
  const { id } = await params;
  const doc = await db.document.findFirst({
    where: { id, userId: session.user.id },
    select: { name: true },
  });
  return { title: doc ? `${doc.name} — DocuMind` : "Document — DocuMind" };
}

export default async function DocumentPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const document = await db.document.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!document) notFound();

  const allSessions = await db.chatSession.findMany({
    where: { documentId: id, userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { messages: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true },
      },
    },
  });

  let activeSession = allSessions[0];
  if (!activeSession) {
    activeSession = await db.chatSession.create({
      data: {
        documentId: id,
        userId: session.user.id,
        title: `Chat about ${document.name}`,
      },
      include: {
        _count: { select: { messages: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, createdAt: true },
        },
      },
    });
    allSessions.unshift(activeSession);
  }

  const activeMessages = await db.message.findMany({
    where: { chatSessionId: activeSession.id },
    orderBy: { createdAt: "asc" },
  });

  const initialMessages: ChatMessage[] = activeMessages.map((m) => ({
    id: m.id,
    role: m.role === "USER" ? "user" : "assistant",
    content: m.content,
  }));

  const statusVariant: Record<string, "success" | "warning" | "danger"> = {
    READY: "success",
    PROCESSING: "warning",
    FAILED: "danger",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={session.user} />
      <main className="flex-1 flex flex-col max-w-[1600px] mx-auto w-full px-4 sm:px-6 py-4 gap-4">

        {/* Document header bar */}
        <div className="bg-white rounded-xl border border-neutral-200 px-5 py-3 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1 text-neutral-500 shrink-0">
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>

          <div className="w-px h-5 bg-neutral-200 shrink-0" />

          <div className="w-9 h-9 bg-violet-100 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-violet-600" />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-neutral-900 truncate text-sm sm:text-base">
              {document.name}
            </h1>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-400">
              <span>{formatBytes(document.fileSize)}</span>
              {document.pageCount && <span>· {document.pageCount} pages</span>}
              <span>· {formatDate(document.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={statusVariant[document.status]}>{document.status}</Badge>

            {document.status === "READY" && (
              <>
                <Link href={`/documents/${id}/report`} className="hidden sm:block">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <FileBarChart2 className="w-4 h-4" />
                    Report
                  </Button>
                </Link>
                <Link href={`/documents/${id}/extract`} className="hidden sm:block">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Zap className="w-4 h-4" />
                    Extract
                  </Button>
                </Link>
              </>
            )}

            <a href={document.fileUrl} target="_blank" rel="noopener noreferrer" className="hidden sm:block">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ExternalLink className="w-4 h-4" />
                PDF
              </Button>
            </a>
          </div>
        </div>

        {/* Main content */}
        {document.status === "READY" ? (
          <DocumentView
            documentId={document.id}
            documentName={document.name}
            sessions={allSessions}
            activeSession={{ ...activeSession, fullMessages: initialMessages }}
          />
        ) : document.status === "PROCESSING" ? (
          <ProcessingStatus documentId={document.id} />
        ) : (
          <div className="bg-white rounded-xl border border-red-200 flex items-center justify-center py-12">
            <div className="text-center">
              <p className="font-medium text-red-600">Processing failed</p>
              <p className="text-sm text-neutral-400 mt-1">
                Please delete this document and upload it again.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
