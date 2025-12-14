"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface AISearchSettingsProps {
  enabled: boolean;
  promptsWithoutEmbeddings: number;
  totalPrompts: number;
}

interface ProgressState {
  current: number;
  total: number;
  success: number;
  failed: number;
}

export function AISearchSettings({ enabled, promptsWithoutEmbeddings, totalPrompts }: AISearchSettingsProps) {
  const t = useTranslations("admin");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  const handleGenerateEmbeddings = async (regenerate: boolean = false) => {
    setIsGenerating(true);
    setResult(null);
    setProgress(null);

    try {
      const url = regenerate ? "/api/admin/embeddings?regenerate=true" : "/api/admin/embeddings";
      const response = await fetch(url, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate embeddings");
      }

      // Read the stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value);
        const lines = text.split("\n\n").filter(line => line.startsWith("data: "));
        
        for (const line of lines) {
          const jsonStr = line.replace("data: ", "");
          try {
            const data = JSON.parse(jsonStr);
            
            if (data.done) {
              setResult({ success: data.success, failed: data.failed });
              toast.success(t("aiSearch.generateSuccess", { count: data.success }));
            } else {
              setProgress({
                current: data.current,
                total: data.total,
                success: data.success,
                failed: data.failed,
              });
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate embeddings");
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  };

  if (!enabled) {
    return null;
  }

  const progressPercent = progress ? Math.round((progress.current / progress.total) * 100) : 0;

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

        {/* Progress bar */}
        {progress && (
          <div className="space-y-2">
            <Progress value={progressPercent} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progress.current} / {progress.total}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="flex gap-4 text-xs">
              <span className="text-green-600">✓ {progress.success}</span>
              {progress.failed > 0 && <span className="text-red-600">✗ {progress.failed}</span>}
            </div>
          </div>
        )}

        {result && !progress && (
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

        <div className="flex gap-2">
          <Button
            onClick={() => handleGenerateEmbeddings(false)}
            disabled={isGenerating || promptsWithoutEmbeddings === 0}
            className="flex-1"
          >
            {isGenerating && !progress ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("aiSearch.generating")}
              </>
            ) : isGenerating && progress ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {progress.current}/{progress.total}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t("aiSearch.generateButton")}
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleGenerateEmbeddings(true)}
            disabled={isGenerating || totalPrompts === 0}
            title={t("aiSearch.regenerateTooltip")}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
