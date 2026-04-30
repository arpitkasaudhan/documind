import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-neutral-200 bg-white h-16" />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-40 mb-8" />
        <Skeleton className="h-40 w-full mb-8 rounded-2xl" />
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </main>
    </div>
  );
}
