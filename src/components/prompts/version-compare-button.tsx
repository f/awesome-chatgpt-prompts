"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DiffView } from "@/components/ui/diff-view";
import { prettifyJson } from "@/lib/format";

interface VersionCompareButtonProps {
  versionContent: string;
  versionNumber: number;
  currentContent: string;
  promptType?: string;
  structuredFormat?: string | null;
}

export function VersionCompareButton({ 
  versionContent, 
  versionNumber, 
  currentContent,
  promptType,
  structuredFormat
}: VersionCompareButtonProps) {
  const isStructured = promptType === "STRUCTURED";
  const t = useTranslations("prompts");
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => setOpen(true)}
        title={t("compareWithCurrent")}
      >
        <GitCompare className="h-3.5 w-3.5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {t("version")} {versionNumber} → {t("currentVersion")}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-hidden">
            <DiffView
              original={isStructured && structuredFormat?.toLowerCase() === "json" ? prettifyJson(versionContent) : versionContent}
              modified={isStructured && structuredFormat?.toLowerCase() === "json" ? prettifyJson(currentContent) : currentContent}
              className="max-h-[calc(90vh-120px)]"
              language={isStructured ? (structuredFormat?.toLowerCase() as "json" | "yaml") || "json" : undefined}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
