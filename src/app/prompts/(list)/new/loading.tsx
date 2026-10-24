import { Skeleton } from "@/components/ui/skeleton";

export default function NewPromptLoading() {
  return (
    <>
      <div className="container max-w-3xl py-8">
        <div className="space-y-4">
          {/* Header: Page title + Private Switch */}
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-6 w-24" />
            <div className="flex items-center gap-3">
              {/* AI Builder button - hidden on mobile since panel is closed by default */}
              <Skeleton className="hidden sm:block h-7 w-28" />
              {/* Private switch */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-9 rounded-full" />
                <Skeleton className="h-4 w-14" />
              </div>
            </div>
          </div>

          {/* ===== METADATA SECTION ===== */}
          <div className="space-y-4 pb-6 border-b">
            {/* Row 1: Title + Category */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="w-full sm:w-64 space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            {/* Row 2: Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-16 w-full" />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Contributors */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* ===== INPUT SECTION ===== */}
          <div className="space-y-4 py-6">
            <Skeleton className="h-5 w-20" />
            
            {/* Input Type & Format selectors */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Skeleton className="h-9 w-48" />
              <div className="flex items-center gap-2 sm:ml-auto">
                <Skeleton className="h-5 w-9 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            {/* Prompt Content - Variable toolbar + Textarea */}
            <div className="rounded-md border overflow-hidden">
              <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
                <Skeleton className="h-7 w-7" />
                <Skeleton className="h-7 w-7" />
                <Skeleton className="h-7 w-7" />
              </div>
              <Skeleton className="h-[150px] w-full rounded-none" />
            </div>
          </div>

          {/* ===== LLM PROCESSING ARROW ===== */}
          <div className="flex flex-col items-center py-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-px w-16" />
              <Skeleton className="h-7 w-40 rounded-full" />
              <Skeleton className="h-px w-16" />
            </div>
          </div>

          {/* ===== OUTPUT SECTION ===== */}
          <div className="space-y-4 py-6 border-t">
            <Skeleton className="h-5 w-24" />
            
            {/* Output Type buttons */}
            <div className="inline-flex rounded-md border divide-x">
              <Skeleton className="h-10 w-20 rounded-l-md rounded-r-none" />
              <Skeleton className="h-10 w-20 rounded-none" />
              <Skeleton className="h-10 w-20 rounded-none" />
              <Skeleton className="h-10 w-20 rounded-r-md rounded-l-none" />
            </div>

            {/* Media URL */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>

      {/* Agent Panel Skeleton - only visible on desktop (sm+) since it's closed by default on mobile */}
      <div className="hidden sm:flex fixed z-50 bg-background shadow-lg flex-col
        right-0 left-auto top-12 bottom-auto h-[calc(100vh-3rem)] w-[400px] border-l border-t">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3 w-3" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-6" />
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="text-center py-8">
            <Skeleton className="h-8 w-8 mx-auto mb-3 rounded" />
            <Skeleton className="h-4 w-32 mx-auto mb-1" />
            <Skeleton className="h-3 w-48 mx-auto" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-3 w-24 mx-auto" />
              <div className="flex flex-wrap gap-1.5 justify-center">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="p-2 border-t">
          <div className="rounded-lg bg-muted/50 border px-2.5 py-2">
            <Skeleton className="h-8 w-full" />
            <div className="flex items-center justify-between mt-1.5">
              <div className="flex items-center gap-1">
                <Skeleton className="h-2.5 w-2.5" />
                <Skeleton className="h-2.5 w-16" />
              </div>
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
