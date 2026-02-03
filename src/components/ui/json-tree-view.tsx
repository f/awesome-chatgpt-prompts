"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type React from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface JsonNode {
  key: string | null;
  value: unknown;
  type: "object" | "array" | "string" | "number" | "boolean" | "null";
  path: string;
}

// Pure helper function - defined outside component to avoid recreation
const getNodeType = (value: unknown): JsonNode["type"] => {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object") return "object";
  return typeof value as "string" | "number" | "boolean";
};

// Recursive helper function - defined outside component
const collectExpandablePaths = (value: unknown, path: string, maxDepth: number, depth: number = 0): string[] => {
  const paths: string[] = [];
  const type = getNodeType(value);

  if ((type === "object" || type === "array") && depth < maxDepth) {
    paths.push(path);

    if (type === "array") {
      (value as unknown[]).forEach((item, index) => {
        paths.push(...collectExpandablePaths(item, `${path}.${index}`, maxDepth, depth + 1));
      });
    } else {
      Object.entries(value as Record<string, unknown>).forEach(([k, v]) => {
        paths.push(...collectExpandablePaths(v, `${path}.${k}`, maxDepth, depth + 1));
      });
    }
  }

  return paths;
};

interface JsonTreeViewProps {
  data: unknown;
  className?: string;
  fontSize?: "xs" | "sm" | "base";
  maxDepth?: number;
  onExpandAllRef?: React.MutableRefObject<(() => void) | undefined>;
  onCollapseAllRef?: React.MutableRefObject<(() => void) | undefined>;
}

function JsonTreeView({ data, className, fontSize = "xs", maxDepth = 10, onExpandAllRef, onCollapseAllRef }: JsonTreeViewProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(["root"]));

  const togglePath = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const allExpandablePaths = useMemo(() => {
    return collectExpandablePaths(data, "root", maxDepth);
  }, [data, maxDepth]);

  const expandAll = useCallback(() => {
    setExpandedPaths(new Set(allExpandablePaths));
  }, [allExpandablePaths]);

  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set(["root"]));
  }, []);

  const renderValue = (value: unknown, type: JsonNode["type"]): React.ReactNode => {
    switch (type) {
      case "string":
        return (
          <span className="text-green-600 dark:text-green-400">
            {String(value)}
          </span>
        );
      case "number":
        return (
          <span className="text-orange-600 dark:text-orange-400">
            {String(value)}
          </span>
        );
      case "boolean":
        return (
          <span className="text-purple-600 dark:text-purple-400">
            {String(value)}
          </span>
        );
      case "null":
        return (
          <span className="text-red-600 dark:text-red-400">null</span>
        );
      default:
        return null;
    }
  };

  const renderNode = (node: JsonNode, depth: number = 0, _isLast: boolean = true): React.ReactNode => {
    const { key, value, type, path } = node;
    const isExpanded = expandedPaths.has(path);
    const isComplex = type === "object" || type === "array";
    const canExpand = isComplex && depth < maxDepth;

    if (!isComplex) {
      return (
        <div className="flex items-center gap-2 py-1 px-2 -mx-2 rounded hover:bg-muted-foreground/10 transition-colors group">
          {key !== null && (
            <>
              <span className="text-blue-600 dark:text-blue-400 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">{key}</span>
              <span className="text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors">→</span>
            </>
          )}
          <span className="group-hover:opacity-90 transition-opacity">{renderValue(value, type)}</span>
        </div>
      );
    }

    const entries = type === "array"
      ? (value as unknown[]).map((item, index) => ({
          key: String(index),
          value: item,
          type: getNodeType(item),
          path: `${path}.${index}`,
        }))
      : Object.entries(value as Record<string, unknown>).map(([k, v]) => ({
          key: k,
          value: v,
          type: getNodeType(v),
          path: `${path}.${k}`,
        }));

    const itemCount = entries.length;
    const isEmpty = itemCount === 0;

    return (
      <div>
        {/* Node header */}
        <div className="flex items-center gap-2 py-1 px-2 -mx-2 rounded hover:bg-muted-foreground/10 transition-colors group">
          {canExpand && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePath(path);
              }}
              className="flex items-center justify-center w-4 h-4 rounded hover:bg-muted-foreground/30 active:bg-muted-foreground/40 transition-all shrink-0"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </button>
          )}
          {!canExpand && <span className="w-4 shrink-0" />}
          
          {key !== null && (
            <>
              <span className="text-blue-600 dark:text-blue-400 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">{key}</span>
              {type === "array" && (
                <span className="text-muted-foreground/50 text-xs group-hover:text-muted-foreground/70 transition-colors">[{itemCount}]</span>
              )}
            </>
          )}
          
          {!isExpanded && !isEmpty && (
            <span className="text-muted-foreground/50 text-xs group-hover:text-muted-foreground/70 transition-colors">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          )}
          
          {isEmpty && (
            <span className="text-muted-foreground/50 text-xs italic group-hover:text-muted-foreground/70 transition-colors">
              empty
            </span>
          )}
        </div>

        {/* Expanded content */}
        {isExpanded && canExpand && (
          <div className="ml-6 mt-1 space-y-0.5">
            {entries.map((entry, index) => {
              const isLastEntry = index === entries.length - 1;
              return (
                <div key={entry.path} className="relative">
                  {/* Tree connector line */}
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-border/30" style={{ marginLeft: '-1.25rem' }} />
                  {!isLastEntry && (
                    <div 
                      className="absolute left-0 w-px bg-border/30" 
                      style={{ 
                        marginLeft: '-1.25rem',
                        top: '1.5rem',
                        bottom: '-0.5rem'
                      }} 
                    />
                  )}
                  
                  <div className="flex items-start">
                    {/* Horizontal connector */}
                    <div 
                      className="absolute left-0 top-3 w-3 h-px bg-border/30" 
                      style={{ marginLeft: '-1.25rem' }} 
                    />
                    
                    <div className="flex-1">
                      {renderNode(entry, depth + 1, isLastEntry)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const rootNode: JsonNode = {
    key: null,
    value: data,
    type: getNodeType(data),
    path: "root",
  };

  // Expose expand/collapse functions via useEffect
  useEffect(() => {
    if (onExpandAllRef) {
      onExpandAllRef.current = expandAll;
    }
    if (onCollapseAllRef) {
      onCollapseAllRef.current = collapseAll;
    }
  }, [expandAll, collapseAll, onExpandAllRef, onCollapseAllRef]);

  return (
    <div
      className={cn(
        "overflow-auto bg-muted rounded-lg p-4 font-mono",
        {
          "text-xs": fontSize === "xs",
          "text-sm": fontSize === "sm",
          "text-base": fontSize === "base",
        },
        className
      )}
    >
      {renderNode(rootNode)}
    </div>
  );
}

export function JsonTreeViewWrapper({
  content,
  className,
  fontSize = "xs",
  onExpandAllRef,
  onCollapseAllRef
}: {
  content: string;
  className?: string;
  fontSize?: "xs" | "sm" | "base";
  onExpandAllRef?: React.MutableRefObject<(() => void) | undefined>;
  onCollapseAllRef?: React.MutableRefObject<(() => void) | undefined>;
}) {
  const parsedData = useMemo(() => {
    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
  }, [content]);

  if (parsedData === null) {
    return (
      <div className={cn("font-mono bg-muted rounded-lg p-4 border border-destructive/50 text-destructive text-sm", className)}>
        Invalid JSON
      </div>
    );
  }

  return (
    <JsonTreeView
      data={parsedData}
      className={className}
      fontSize={fontSize}
      onExpandAllRef={onExpandAllRef}
      onCollapseAllRef={onCollapseAllRef}
    />
  );
}
