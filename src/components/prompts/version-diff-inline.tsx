"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getDiffStats } from "@/components/ui/diff-view";
import { DiffView } from "@/components/ui/diff-view";

interface VersionDiffInlineProps {
  originalContent: string;
  modifiedContent: string;
}

export function VersionDiffInline({ originalContent, modifiedContent }: VersionDiffInlineProps) {
  const t = useTranslations("diff");
  const [expanded, setExpanded] = useState(false);
  const stats = getDiffStats(originalContent, modifiedContent);
  const hasChanges = stats.additions > 0 || stats.deletions > 0;

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          {hasChanges ? (
            <>
              <span className="text-green-600 dark:text-green-400 font-medium">+{stats.additions} {t("tokens")}</span>
              <span className="text-red-600 dark:text-red-400 font-medium">-{stats.deletions} {t("tokens")}</span>
            </>
          ) : (
            <span className="text-muted-foreground">{t("noChanges")}</span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
      {expanded && (
        <div className="border-t">
          <DiffView original={originalContent} modified={modifiedContent} className="border-0 rounded-none" />
        </div>
      )}
    </div>
  );
}
