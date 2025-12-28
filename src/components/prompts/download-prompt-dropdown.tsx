"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Download, FileText, FileCode, Check, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface DownloadPromptDropdownProps {
  promptId: string;
  promptSlug?: string;
  promptType?: string;
}

export function DownloadPromptDropdown({ promptId, promptSlug, promptType }: DownloadPromptDropdownProps) {
  const t = useTranslations("prompts");
  const [copiedFormat, setCopiedFormat] = useState<"md" | "yml" | null>(null);
  
  const isSkill = promptType === "SKILL";

  const getFileName = (format: "md" | "yml") => {
    const base = promptSlug ? `${promptId}_${promptSlug}` : promptId;
    const filePrefix = isSkill ? "SKILL" : "prompt";
    return `${base}.${filePrefix}.${format}`;
  };

  const getFileUrl = (format: "md" | "yml") => {
    if (typeof window === "undefined") return "";
    const base = promptSlug ? `${promptId}_${promptSlug}` : promptId;
    const filePrefix = isSkill ? "SKILL" : "prompt";
    return `${window.location.origin}/prompts/${base}.${filePrefix}.${format}`;
  };

  const handleDownload = async (format: "md" | "yml") => {
    const url = getFileUrl(format);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch");
      const content = await response.text();
      
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = getFileName(format);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      
      toast.success(t("downloadStarted"));
    } catch {
      toast.error(t("downloadFailed"));
    }
  };

  const handleCopyUrl = async (format: "md" | "yml") => {
    const url = getFileUrl(format);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedFormat(format);
      toast.success(t("urlCopied"));
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch {
      toast.error(t("failedToCopyUrl"));
    }
  };

  // For SKILL type, show a simple button instead of dropdown
  if (isSkill) {
    return (
      <Button variant="ghost" size="sm" onClick={() => handleDownload("md")}>
        <Download className="h-4 w-4 mr-1" />
        {t("downloadSkillMd")}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Download className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleDownload("md")}>
          <FileText className="h-4 w-4 mr-2" />
          {t("downloadMarkdown")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("yml")}>
          <FileCode className="h-4 w-4 mr-2" />
          {t("downloadYaml")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleCopyUrl("md")}>
          {copiedFormat === "md" ? (
            <Check className="h-4 w-4 mr-2 text-green-500" />
          ) : (
            <Link className="h-4 w-4 mr-2" />
          )}
          {t("copyMarkdownUrl")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCopyUrl("yml")}>
          {copiedFormat === "yml" ? (
            <Check className="h-4 w-4 mr-2 text-green-500" />
          ) : (
            <Link className="h-4 w-4 mr-2" />
          )}
          {t("copyYamlUrl")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
