import { Skeleton } from "@/components/ui/skeleton";

export default function PromptmastersLoading() {
  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header - centered */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-9 w-48" />
          </div>
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>

        {/* Tabs */}
        <Skeleton className="h-10 w-full mb-6 rounded-lg" />

        {/* Leaderboard */}
        <div className="divide-y">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3">
              <Skeleton className="h-6 w-8" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-10 w-12" />
                <Skeleton className="h-10 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
