"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface AISearchSettingsProps {
  enabled: boolean;
  promptsWithoutEmbeddings: number;
}

export function AISearchSettings({ enabled, promptsWithoutEmbeddings }: AISearchSettingsProps) {
  const t = useTranslations("admin");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  const handleGenerateEmbeddings = async () => {
    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/embeddings", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate embeddings");
      }

      const data = await response.json();
      setResult({ success: data.success, failed: data.failed });
      toast.success(t("aiSearch.generateSuccess", { count: data.success }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate embeddings");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!enabled) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          {t("aiSearch.title")}
        </CardTitle>
        <CardDescription>{t("aiSearch.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-muted-foreground">{t("aiSearch.promptsWithoutEmbeddings")}: </span>
            <span className="font-medium">{promptsWithoutEmbeddings}</span>
          </div>
        </div>

        {result && (
          <div className="flex items-center gap-2 text-sm">
            {result.failed === 0 ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-500" />
            )}
            <span>
              {t("aiSearch.generateResult", { success: result.success, failed: result.failed })}
            </span>
          </div>
        )}

        <Button
          onClick={handleGenerateEmbeddings}
          disabled={isGenerating || promptsWithoutEmbeddings === 0}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("aiSearch.generating")}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              {t("aiSearch.generateButton")}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
