import { Skeleton } from "@/components/ui/skeleton";

export default function TagsLoading() {
  return (
    <div className="container py-6">
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="h-6 w-24 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Search */}
      <Skeleton className="h-9 w-full max-w-sm mb-6" />

      {/* Tags Grid */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-full" />
        ))}
      </div>
    </div>
  );
}
