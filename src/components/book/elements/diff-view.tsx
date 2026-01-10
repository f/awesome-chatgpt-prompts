"use client";

import { cn } from "@/lib/utils";

interface DiffViewProps {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
}

// Simple word-level diff algorithm
function computeDiff(before: string, after: string): { type: 'same' | 'added' | 'removed'; text: string }[] {
  const beforeWords = before.split(/(\s+)/);
  const afterWords = after.split(/(\s+)/);
  
  const result: { type: 'same' | 'added' | 'removed'; text: string }[] = [];
  
  // LCS-based diff
  const m = beforeWords.length;
  const n = afterWords.length;
  
  // Build LCS table
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (beforeWords[i - 1] === afterWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  // Backtrack to find diff
  let i = m, j = n;
  const diff: { type: 'same' | 'added' | 'removed'; text: string }[] = [];
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && beforeWords[i - 1] === afterWords[j - 1]) {
      diff.unshift({ type: 'same', text: beforeWords[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({ type: 'added', text: afterWords[j - 1] });
      j--;
    } else {
      diff.unshift({ type: 'removed', text: beforeWords[i - 1] });
      i--;
    }
  }
  
  // Merge consecutive same-type segments
  for (const segment of diff) {
    if (result.length > 0 && result[result.length - 1].type === segment.type) {
      result[result.length - 1].text += segment.text;
    } else {
      result.push({ ...segment });
    }
  }
  
  return result;
}

export function DiffView({ before, after, beforeLabel = "Before", afterLabel = "After" }: DiffViewProps) {
  const diff = computeDiff(before, after);
  
  return (
    <div className="my-4 grid md:grid-cols-2 gap-3">
      <div className="border rounded-lg overflow-hidden">
        <div className="px-3 py-2 bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-800">
          <span className="text-sm font-medium text-red-700 dark:text-red-300">{beforeLabel}</span>
        </div>
        <div className="p-3 text-sm font-mono whitespace-pre-wrap bg-muted/20">
          {diff.map((segment, i) => {
            if (segment.type === 'removed') {
              return (
                <span key={i} className="bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-200 line-through decoration-red-500">
                  {segment.text}
                </span>
              );
            } else if (segment.type === 'same') {
              return <span key={i}>{segment.text}</span>;
            }
            return null;
          })}
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="px-3 py-2 bg-green-50 dark:bg-green-950/30 border-b border-green-200 dark:border-green-800">
          <span className="text-sm font-medium text-green-700 dark:text-green-300">{afterLabel}</span>
        </div>
        <div className="p-3 text-sm font-mono whitespace-pre-wrap bg-muted/20">
          {diff.map((segment, i) => {
            if (segment.type === 'added') {
              return (
                <span key={i} className="bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-200">
                  {segment.text}
                </span>
              );
            } else if (segment.type === 'same') {
              return <span key={i}>{segment.text}</span>;
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}

interface VersionDiffProps {
  versions: {
    label: string;
    content: string;
    note?: string;
  }[];
}

export function VersionDiff({ versions }: VersionDiffProps) {
  if (versions.length < 1) return null;
  
  return (
    <div className="my-4 space-y-4">
      {versions.map((version, index) => {
        // First version: show without diff
        if (index === 0) {
          return (
            <div key={index} className="border rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-muted/50 border-b flex items-center justify-between">
                <span className="text-sm font-semibold">{version.label}</span>
                {version.note && (
                  <span className="text-xs text-muted-foreground">{version.note}</span>
                )}
              </div>
              <div className="p-4 text-sm font-mono whitespace-pre-wrap">
                {version.content}
              </div>
            </div>
          );
        }
        
        const prev = versions[index - 1];
        const diff = computeDiff(prev.content, version.content);
        
        return (
          <div key={index} className="border rounded-lg overflow-hidden">
            <div className="px-3 py-2 bg-muted/50 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">{prev.label}</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-sm font-semibold">{version.label}</span>
              </div>
              {version.note && (
                <span className="text-xs text-muted-foreground">{version.note}</span>
              )}
            </div>
            <div className="grid md:grid-cols-2 divide-x">
              <div className="p-3">
                <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-2">{prev.label}</div>
                <div className="text-sm font-mono whitespace-pre-wrap">
                  {diff.map((segment, i) => {
                    if (segment.type === 'removed') {
                      return (
                        <span key={i} className="bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-200 line-through decoration-red-500">
                          {segment.text}
                        </span>
                      );
                    } else if (segment.type === 'same') {
                      return <span key={i}>{segment.text}</span>;
                    }
                    return null;
                  })}
                </div>
              </div>
              <div className="p-3">
                <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-2">{version.label}</div>
                <div className="text-sm font-mono whitespace-pre-wrap">
                  {diff.map((segment, i) => {
                    if (segment.type === 'added') {
                      return (
                        <span key={i} className="bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-200">
                          {segment.text}
                        </span>
                      );
                    } else if (segment.type === 'same') {
                      return <span key={i}>{segment.text}</span>;
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
