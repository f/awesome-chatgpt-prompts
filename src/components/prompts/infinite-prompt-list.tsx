"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, SearchX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useFilterContext } from "./filter-context";
import { PromptCard, type PromptCardProps } from "./prompt-card";

interface InfinitePromptListProps {
  initialPrompts: PromptCardProps["prompt"][];
  initialTotal: number;
  filters: {
    q?: string;
    type?: string;
    category?: string;
    tag?: string;
    sort?: string;
  };
}

function PromptCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex items-center gap-2 pt-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function InfinitePromptList({ 
  initialPrompts, 
  initialTotal,
  filters 
}: InfinitePromptListProps) {
  const t = useTranslations("prompts");
  const searchParams = useSearchParams();
  const { isFilterPending, setFilterPending } = useFilterContext();
  const [prompts, setPrompts] = useState(initialPrompts);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPrompts.length < initialTotal);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Reset when new data arrives from server
  useEffect(() => {
    setPrompts(initialPrompts);
    setPage(1);
    setHasMore(initialPrompts.length < initialTotal);
    setFilterPending(false);
  }, [initialPrompts, initialTotal, setFilterPending]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const params = new URLSearchParams();
      params.set("page", nextPage.toString());
      if (filters.q) params.set("q", filters.q);
      if (filters.type) params.set("type", filters.type);
      if (filters.category) params.set("category", filters.category);
      if (filters.tag) params.set("tag", filters.tag);
      if (filters.sort) params.set("sort", filters.sort);

      const response = await fetch(`/api/prompts?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      
      // Deduplicate by ID to prevent duplicate key errors
      setPrompts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newPrompts = data.prompts.filter((p: { id: string }) => !existingIds.has(p.id));
        return [...prev, ...newPrompts];
      });
      setPage(nextPage);
      setHasMore(data.prompts.length > 0 && prompts.length + data.prompts.length < data.total);
    } catch (error) {
      console.error("Failed to load more prompts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page, filters, prompts.length]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoading]);

  // Show skeleton while filtering
  if (isFilterPending) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <PromptCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <SearchX className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-1">{t("noPrompts")}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {t("noPromptsDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:auto-rows-fr">
        {prompts.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>

      {/* Loader / End indicator */}
      <div ref={loaderRef} className="flex items-center justify-center py-4">
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("loading")}
          </div>
        )}
        {!hasMore && prompts.length > 0 && (
          <p className="text-xs text-muted-foreground">{t("noMorePrompts")}</p>
        )}
      </div>
    </div>
  );
}
