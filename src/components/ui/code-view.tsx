"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronsDown, ChevronsUp } from "lucide-react";
import { JsonTreeViewWrapper } from "./json-tree-view";

interface CodeViewProps {
  content: string;
  language?: "json" | "yaml";
  className?: string;
  maxLines?: number;
  fontSize?: "xs" | "sm" | "base";
  wordWrap?: boolean;
  preview?: boolean; // No scroll, just truncate with overflow hidden
}

type ViewMode = "code" | "tree";

export function CodeView({ content, language = "json", className, maxLines, fontSize = "xs", wordWrap = false, preview = false }: CodeViewProps) {
  const t = useTranslations("common");
  const [viewMode, setViewMode] = useState<ViewMode>("code");
  const expandAllRef = useRef<(() => void) | undefined>(undefined);
  const collapseAllRef = useRef<(() => void) | undefined>(undefined);
  
  const isJson = language === "json";
  const showToggle = isJson && !maxLines; // Only show toggle for JSON when not truncated

  // Try to parse JSON to validate it's valid for tree view
  let isValidJson = false;
  if (isJson) {
    try {
      JSON.parse(content);
      isValidJson = true;
    } catch {
      isValidJson = false;
    }
  }

  const lines = content.split("\n");
  const displayLines = maxLines ? lines.slice(0, maxLines) : lines;
  const hasMore = maxLines && lines.length > maxLines;

  const handleExpandAll = () => {
    expandAllRef.current?.();
  };

  const handleCollapseAll = () => {
    collapseAllRef.current?.();
  };

  return (
    <div className={cn("relative", className)}>
      {showToggle && isValidJson && (
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Code/Tree toggle buttons - left side */}
          <div className="flex gap-1">
            <Button
              variant={viewMode === "code" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("code")}
              className="h-7 px-2 text-xs"
            >
              {t("codeView")}
            </Button>
            <Button
              variant={viewMode === "tree" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("tree")}
              className="h-7 px-2 text-xs"
            >
              {t("treeView")}
            </Button>
          </div>
          
          {/* Expand/Collapse buttons - right side (only in tree view) */}
          {viewMode === "tree" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExpandAll}
                className="h-7 w-7 p-0"
                title={t("expandAll")}
              >
                <ChevronsDown className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCollapseAll}
                className="h-7 w-7 p-0"
                title={t("collapseAll")}
              >
                <ChevronsUp className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
      {viewMode === "tree" && isValidJson ? (
        <JsonTreeViewWrapper
          content={content}
          className={className}
          fontSize={fontSize}
          onExpandAllRef={expandAllRef}
          onCollapseAllRef={collapseAllRef}
        />
      ) : (
        <pre suppressHydrationWarning className={cn("font-mono bg-muted rounded p-2", preview ? "overflow-hidden" : "overflow-y-auto max-h-[500px]", {
            "text-xs": fontSize === "xs",
            "text-sm": fontSize === "sm",
            "text-base": fontSize === "base",
          })}>
          <div className={`language-${language} block`}>
            {displayLines.map((line, i) => (
              <div key={i} className="flex">
                <span className="select-none text-muted-foreground/50 w-6 text-right pr-2 shrink-0">
                  {i + 1}
                </span>
                <span className={cn("flex-1 font-mono", wordWrap && "break-all whitespace-pre-wrap")}>
                  {highlightLine(line, language)}
                </span>
              </div>
            ))}
            {hasMore && (
              <div className="flex">
                <span className="select-none text-muted-foreground/50 w-6 text-right pr-2 shrink-0">
                  ...
                </span>
                <span className="text-muted-foreground">
                  {t("moreLines", { count: lines.length - (maxLines || 0) })}
                </span>
              </div>
            )}
          </div>
        </pre>
      )}
    </div>
  );
}

// Simple syntax highlighting
function highlightLine(line: string, language: "json" | "yaml") {
  if (language === "json") {
    return highlightJSON(line);
  }
  return highlightYAML(line);
}

function highlightJSON(line: string) {
  // Match keys, strings, numbers, booleans, null
  const parts: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;

  // Key pattern: "key":
  const keyMatch = remaining.match(/^(\s*)("(?:[^"\\]|\\.)*")(\s*:\s*)/);
  if (keyMatch) {
    parts.push(<span key={key++}>{keyMatch[1]}</span>);
    parts.push(<span key={key++} className="text-blue-600 dark:text-blue-400">{keyMatch[2]}</span>);
    parts.push(<span key={key++}>{keyMatch[3]}</span>);
    remaining = remaining.slice(keyMatch[0].length);
  }

  // Value patterns
  const patterns = [
    { regex: /^("(?:[^"\\]|\\.)*")/, className: "text-green-600 dark:text-green-400" }, // strings
    { regex: /^(-?\d+\.?\d*(?:e[+-]?\d+)?)/, className: "text-orange-600 dark:text-orange-400" }, // numbers
    { regex: /^(true|false)/, className: "text-purple-600 dark:text-purple-400" }, // booleans
    { regex: /^(null)/, className: "text-red-600 dark:text-red-400" }, // null
  ];

  while (remaining) {
    let matched = false;
    for (const pattern of patterns) {
      const match = remaining.match(pattern.regex);
      if (match) {
        parts.push(<span key={key++} className={pattern.className}>{match[1]}</span>);
        remaining = remaining.slice(match[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      // Take one character
      parts.push(<span key={key++}>{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }
  }

  return <>{parts}</>;
}

function highlightYAML(line: string) {
  const parts: React.ReactNode[] = [];
  let key = 0;

  // Comment
  if (line.trim().startsWith("#")) {
    return <span className="text-muted-foreground">{line}</span>;
  }

  // Key: value pattern
  const keyValueMatch = line.match(/^(\s*)([\w-]+)(\s*:\s*)(.*)/);
  if (keyValueMatch) {
    parts.push(<span key={key++}>{keyValueMatch[1]}</span>);
    parts.push(<span key={key++} className="text-blue-600 dark:text-blue-400">{keyValueMatch[2]}</span>);
    parts.push(<span key={key++}>{keyValueMatch[3]}</span>);
    
    const value = keyValueMatch[4];
    if (value) {
      parts.push(highlightYAMLValue(value, key));
    }
    return <>{parts}</>;
  }

  // List item
  const listMatch = line.match(/^(\s*-\s*)(.*)/);
  if (listMatch) {
    parts.push(<span key={key++} className="text-muted-foreground">{listMatch[1]}</span>);
    parts.push(<span key={key++}>{listMatch[2]}</span>);
    return <>{parts}</>;
  }

  return <>{line}</>;
}

function highlightYAMLValue(value: string, startKey: number) {
  // String in quotes
  if (value.match(/^["'].*["']$/)) {
    return <span key={startKey} className="text-green-600 dark:text-green-400">{value}</span>;
  }
  // Number
  if (value.match(/^-?\d+\.?\d*$/)) {
    return <span key={startKey} className="text-orange-600 dark:text-orange-400">{value}</span>;
  }
  // Boolean
  if (value.match(/^(true|false)$/i)) {
    return <span key={startKey} className="text-purple-600 dark:text-purple-400">{value}</span>;
  }
  // Null
  if (value.match(/^(null|~)$/i)) {
    return <span key={startKey} className="text-red-600 dark:text-red-400">{value}</span>;
  }
  // Pipe for multiline
  if (value === "|" || value === ">") {
    return <span key={startKey} className="text-muted-foreground">{value}</span>;
  }
  return <span key={startKey}>{value}</span>;
}
