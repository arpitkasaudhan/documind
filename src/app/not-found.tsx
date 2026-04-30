import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Brain className="w-8 h-8 text-violet-600" />
      </div>
      <h1 className="text-4xl font-bold text-neutral-900 mb-2">404</h1>
      <p className="text-neutral-500 mb-8 max-w-sm">
        This page doesn&apos;t exist. It may have been moved or deleted.
      </p>
      <Link href="/dashboard">
        <Button>Go to dashboard</Button>
      </Link>
    </div>
  );
}
