import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/prisma";
import type { Document } from "@prisma/client";
import { Navbar } from "@/components/features/Navbar";
import { DocumentCard } from "@/components/features/DocumentCard";
import { FileUpload } from "@/components/features/FileUpload";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [documents, subscription] = await Promise.all([
    db.document.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { chatSessions: true } } },
    }),
    db.subscription.findUnique({ where: { userId: session.user.id } }),
  ]);

  const plan = subscription?.plan ?? "FREE";
  const docLimit = plan === "PRO" ? 100 : 3;

  return (
    <div className="min-h-screen">
      <Navbar user={session.user} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Welcome back, {session.user.name?.split(" ")[0] ?? "there"} 👋
            </h1>
            <p className="text-neutral-500 mt-1">
              {documents.length}/{docLimit} documents used · {plan} plan
            </p>
          </div>
          {plan === "FREE" && (
            <Link href="/pricing">
              <Button variant="outline" size="sm">Upgrade to Pro</Button>
            </Link>
          )}
        </div>

        {/* Upload */}
        <div className="bg-white rounded-2xl border border-dashed border-violet-300 p-8 mb-8">
          <h2 className="text-lg font-semibold text-neutral-900 mb-1">Upload a document</h2>
          <p className="text-sm text-neutral-500 mb-6">PDF files up to 10MB</p>
          <FileUpload />
        </div>

        {/* Documents */}
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Your documents
            <span className="ml-2 text-sm font-normal text-neutral-400">({documents.length})</span>
          </h2>

          {documents.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-neutral-200">
              <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="font-medium text-neutral-600">No documents yet</p>
              <p className="text-sm text-neutral-400 mt-1">Upload your first PDF above to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc: Document & { _count: { chatSessions: number } }) => (
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
              {documents.length < docLimit && (
                <button
                  onClick={() => document.getElementById("file-input")?.click()}
                  className="border-2 border-dashed border-neutral-300 rounded-xl p-6 flex flex-col items-center justify-center text-neutral-400 hover:border-violet-400 hover:text-violet-500 transition-all cursor-pointer"
                >
                  <Upload className="w-8 h-8 mb-2" />
                  <span className="text-sm">Add document</span>
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
