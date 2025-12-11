"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromptCard, type PromptCardProps } from "@/components/prompts/prompt-card";

export interface PromptListProps {
  prompts: PromptCardProps["prompt"][];
  currentPage: number;
  totalPages: number;
  pinnedIds?: Set<string>;
  showPinButton?: boolean;
}

export function PromptList({ prompts, currentPage, totalPages, pinnedIds, showPinButton = false }: PromptListProps) {
  const t = useTranslations("prompts");

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
        {prompts.map((prompt) => (
          <PromptCard 
            key={prompt.id} 
            prompt={prompt} 
            showPinButton={showPinButton}
            isPinned={pinnedIds?.has(prompt.id) ?? false}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button variant="outline" size="sm" className="h-7 text-xs" disabled={currentPage <= 1} asChild={currentPage > 1}>
            {currentPage > 1 ? <Link href={`?page=${currentPage - 1}`}>Previous</Link> : <span>Previous</span>}
          </Button>
          <span className="text-xs text-muted-foreground">{currentPage} / {totalPages}</span>
          <Button variant="outline" size="sm" className="h-7 text-xs" disabled={currentPage >= totalPages} asChild={currentPage < totalPages}>
            {currentPage < totalPages ? <Link href={`?page=${currentPage + 1}`}>Next</Link> : <span>Next</span>}
          </Button>
        </div>
      )}
    </div>
  );
}
