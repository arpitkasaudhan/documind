import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/prisma";
import { Navbar } from "@/components/features/Navbar";
import { FileUpload } from "@/components/features/FileUpload";
import { DocumentGrid } from "@/components/features/DocumentGrid";
import { Button } from "@/components/ui/button";

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
  const atLimit = documents.length >= docLimit;

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
              {documents.length}/{docLimit} documents ·{" "}
              <span className={plan === "PRO" ? "text-violet-600 font-medium" : "text-neutral-500"}>
                {plan} plan
              </span>
            </p>
          </div>
          {plan === "FREE" && (
            <Link href="/pricing">
              <Button variant="outline" size="sm">⚡ Upgrade to Pro</Button>
            </Link>
          )}
        </div>

        {/* Upload — hide when at limit */}
        {!atLimit ? (
          <div className="bg-white rounded-2xl border border-dashed border-violet-300 p-8 mb-8">
            <h2 className="text-lg font-semibold text-neutral-900 mb-1">Upload a document</h2>
            <p className="text-sm text-neutral-500 mb-6">PDF files up to 10MB</p>
            <FileUpload />
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex items-center justify-between">
            <div>
              <p className="font-medium text-amber-800">Document limit reached</p>
              <p className="text-sm text-amber-600 mt-0.5">
                Delete a document or upgrade to Pro for up to 100 documents.
              </p>
            </div>
            <Link href="/pricing">
              <Button size="sm">Upgrade</Button>
            </Link>
          </div>
        )}

        {/* Documents with search */}
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Your documents
            <span className="ml-2 text-sm font-normal text-neutral-400">({documents.length})</span>
          </h2>
          <DocumentGrid documents={documents} docLimit={docLimit} />
        </div>
      </main>
    </div>
  );
}
