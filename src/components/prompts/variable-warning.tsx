"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  detectVariables,
  convertAllVariables,
} from "@/lib/variable-detection";

interface VariableWarningProps {
  content: string;
  onConvert: (convertedContent: string) => void;
}

export function VariableWarning({ content, onConvert }: VariableWarningProps) {
  const t = useTranslations("prompts");

  const detected = useMemo(() => detectVariables(content), [content]);

  if (detected.length === 0) return null;

  const handleConvert = () => {
    const converted = convertAllVariables(content);
    onConvert(converted);
  };

  // Show max 5 unique examples
  const uniqueExamples = [...new Set(detected.map((v) => v.original))].slice(0, 5);

  return (
    <Alert className="border-amber-500/50 bg-amber-500/5">
      <AlertTriangle className="h-4 w-4 text-amber-500" />
      <AlertDescription className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              {t("variableWarningTitle")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("variableWarningDescription")}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="shrink-0 gap-1.5 border-amber-500/50 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400"
            onClick={handleConvert}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t("convertVariables")}
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {uniqueExamples.map((example, i) => (
            <Badge
              key={i}
              variant="outline"
              className="font-mono text-xs bg-background"
            >
              {example}
            </Badge>
          ))}
          {detected.length > 5 && (
            <Badge variant="secondary" className="text-xs">
              +{detected.length - 5} {t("more")}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {t("supportedFormat")}: <code className="bg-muted px-1 py-0.5 rounded">{`\${variable}`}</code> {t("or")} <code className="bg-muted px-1 py-0.5 rounded">{`\${variable:default}`}</code>
        </p>
      </AlertDescription>
    </Alert>
  );
}
