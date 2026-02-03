"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Braces, FileCode } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface StructuredFormatWarningProps {
  content: string;
  isStructuredInput: boolean;
  onSwitchToStructured: (format: "JSON" | "YAML") => void;
}

/**
 * Detects if text content looks like JSON
 */
function looksLikeJson(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed) return false;
  
  // Check if it starts and ends with JSON object/array delimiters
  const startsWithJsonDelimiter = trimmed.startsWith("{") || trimmed.startsWith("[");
  const endsWithJsonDelimiter = trimmed.endsWith("}") || trimmed.endsWith("]");
  
  if (startsWithJsonDelimiter && endsWithJsonDelimiter) {
    // Additional check: try to parse it as JSON
    try {
      JSON.parse(trimmed);
      return true;
    } catch {
      // Even if it doesn't parse perfectly, if it has JSON-like structure, warn the user
      // Look for patterns like "key": value
      const hasJsonKeyPattern = /"[^"]+"\s*:/g.test(trimmed);
      return hasJsonKeyPattern;
    }
  }
  
  // Check for multiline JSON-like content that might have text before/after
  const jsonObjectPattern = /^\s*\{[\s\S]*"[^"]+"\s*:[\s\S]*\}\s*$/;
  const jsonArrayPattern = /^\s*\[[\s\S]*\{[\s\S]*"[^"]+"\s*:[\s\S]*\}[\s\S]*\]\s*$/;
  
  return jsonObjectPattern.test(trimmed) || jsonArrayPattern.test(trimmed);
}

/**
 * Detects if text content looks like YAML
 */
function looksLikeYaml(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed) return false;
  
  // Don't detect as YAML if it looks like JSON
  if (looksLikeJson(content)) return false;
  
  const lines = trimmed.split("\n").filter(line => line.trim() && !line.trim().startsWith("#"));
  if (lines.length < 2) return false;
  
  // YAML patterns to look for:
  // 1. Key-value pairs with colon (key: value)
  const keyValuePattern = /^[\w_-]+\s*:\s*.*/;
  // 2. List items (- item or - key: value)
  const listItemPattern = /^\s*-\s+.+/;
  // 3. Nested structure with indentation
  const indentedKeyPattern = /^\s{2,}[\w_-]+\s*:/;
  
  let keyValueCount = 0;
  let listItemCount = 0;
  let indentedCount = 0;
  
  for (const line of lines) {
    if (keyValuePattern.test(line)) keyValueCount++;
    if (listItemPattern.test(line)) listItemCount++;
    if (indentedKeyPattern.test(line)) indentedCount++;
  }
  
  // Consider it YAML if:
  // - Multiple key-value pairs at root level with some structure
  // - Or has list items with nested content
  // - Or has indented key-value structure
  const hasSignificantYamlStructure = 
    (keyValueCount >= 2 && (listItemCount > 0 || indentedCount > 0)) ||
    (listItemCount >= 2 && indentedCount >= 1) ||
    (keyValueCount >= 3 && indentedCount >= 2);
  
  return hasSignificantYamlStructure;
}

/**
 * Detects the likely format of structured content
 */
function detectStructuredFormat(content: string): "JSON" | "YAML" | null {
  if (looksLikeJson(content)) return "JSON";
  if (looksLikeYaml(content)) return "YAML";
  return null;
}

export function StructuredFormatWarning({ 
  content, 
  isStructuredInput, 
  onSwitchToStructured 
}: StructuredFormatWarningProps) {
  const t = useTranslations("prompts");

  const detectedFormat = useMemo(() => {
    // Only detect if not already in structured mode
    if (isStructuredInput) return null;
    return detectStructuredFormat(content);
  }, [content, isStructuredInput]);

  if (!detectedFormat) return null;

  const handleSwitch = () => {
    onSwitchToStructured(detectedFormat);
  };

  return (
    <Alert className="border-blue-500/50 bg-blue-500/5">
      {detectedFormat === "JSON" ? (
        <Braces className="h-4 w-4 text-blue-500" />
      ) : (
        <FileCode className="h-4 w-4 text-blue-500" />
      )}
      <AlertDescription className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
              {t("structuredFormatDetected", { format: detectedFormat })}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("structuredFormatWarningDescription")}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="shrink-0 gap-1.5 border-blue-500/50 text-blue-700 hover:bg-blue-500/10 dark:text-blue-400"
            onClick={handleSwitch}
          >
            {detectedFormat === "JSON" ? (
              <Braces className="h-3.5 w-3.5" />
            ) : (
              <FileCode className="h-3.5 w-3.5" />
            )}
            {t("switchToStructured", { format: detectedFormat })}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
