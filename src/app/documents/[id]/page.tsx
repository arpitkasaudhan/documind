import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/prisma";
import { Navbar } from "@/components/features/Navbar";
import { DocumentChatView } from "@/components/features/DocumentChatView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, ChevronLeft, Zap } from "lucide-react";
import { formatBytes, formatDate } from "@/lib/utils";
import type { ChatMessage } from "@/hooks/useStreamChat";

interface PageProps {
  params: Promise<{ id: string }>;
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

  // Ensure at least one session exists
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
      <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-4">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5 text-neutral-500">
              <ChevronLeft className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
        </div>

        {/* Document header */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-neutral-900 truncate">{document.name}</h1>
              <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                <span>{formatBytes(document.fileSize)}</span>
                {document.pageCount && <span>{document.pageCount} pages</span>}
                <span>Uploaded {formatDate(document.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={statusVariant[document.status]}>{document.status}</Badge>
              {document.status === "READY" && (
                <Link href={`/documents/${id}/extract`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Zap className="w-4 h-4" />
                    Extract data
                  </Button>
                </Link>
              )}
              <a href={document.fileUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <ExternalLink className="w-4 h-4" />
                  View PDF
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Chat */}
        {document.status === "READY" ? (
          <DocumentChatView
            documentId={document.id}
            sessions={allSessions}
            activeSession={{ ...activeSession, fullMessages: initialMessages }}
          />
        ) : document.status === "PROCESSING" ? (
          <div className="flex-1 bg-white rounded-xl border border-neutral-200 flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="font-medium text-neutral-700">Processing your document…</p>
              <p className="text-sm text-neutral-400 mt-1">This usually takes 30–60 seconds.</p>
              <p className="text-sm text-violet-500 mt-3 cursor-pointer hover:underline" onClick={() => window.location.reload()}>
                Refresh to check status
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-red-200 flex items-center justify-center py-12">
            <div className="text-center">
              <p className="font-medium text-red-600">Processing failed</p>
              <p className="text-sm text-neutral-400 mt-1">Please delete and re-upload this document.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
