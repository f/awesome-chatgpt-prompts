"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { RunPromptButton } from "./run-prompt-button";
import { CodeView } from "@/components/ui/code-view";
import { prettifyJson } from "@/lib/format";

interface Variable {
  name: string;
  defaultValue: string;
  fullMatch: string;
}

interface InteractivePromptContentProps {
  content: string;
  className?: string;
  isStructured?: boolean;
  structuredFormat?: "json" | "yaml";
  title?: string;
}

// Parse ${variablename:defaultvalue} or ${variablename} patterns
function parseVariables(content: string): Variable[] {
  const regex = /\$\{([^:}]+)(?::([^}]*))?\}/g;
  const variables: Variable[] = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    variables.push({
      name: match[1].trim(),
      defaultValue: (match[2] ?? "").trim(),
      fullMatch: match[0],
    });
  }

  return variables;
}

// Get unique variable names with their default values
function getUniqueVariables(variables: Variable[]): { name: string; defaultValue: string }[] {
  const seen = new Map<string, string>();
  for (const variable of variables) {
    if (!seen.has(variable.name)) {
      seen.set(variable.name, variable.defaultValue);
    }
  }
  return Array.from(seen.entries()).map(([name, defaultValue]) => ({ name, defaultValue }));
}

// Contenteditable span component
function EditableSpan({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (spanRef.current && spanRef.current.textContent !== value) {
      spanRef.current.textContent = value;
    }
  }, [value]);

  const handleInput = () => {
    if (spanRef.current) {
      const newValue = spanRef.current.textContent || "";
      onChange(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <span
      ref={spanRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      className="inline bg-primary/10 border-b-2 border-primary/40 px-1 rounded-sm outline-none focus:border-primary focus:bg-primary/15 min-w-[2ch] cursor-text"
    />
  );
}

export function InteractivePromptContent({ 
  content, 
  className,
  isStructured = false,
  structuredFormat = "json",
  title
}: InteractivePromptContentProps) {
  const t = useTranslations("common");
  const [copied, setCopied] = useState(false);

  // Parse variables from content
  const variables = useMemo(() => parseVariables(content), [content]);
  const uniqueVariables = useMemo(() => getUniqueVariables(variables), [variables]);

  // Initialize values as empty strings (defaults are placeholders)
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const variable of variables) {
      if (!(variable.name in initial)) {
        initial[variable.name] = variable.defaultValue;
      }
    }
    return initial;
  });

  // Check if any values have been modified from defaults
  const isModified = useMemo(() => {
    for (const { name, defaultValue } of uniqueVariables) {
      if (values[name] !== defaultValue) {
        return true;
      }
    }
    return false;
  }, [values, uniqueVariables]);

  // Reset all values to defaults
  const handleReset = useCallback(() => {
    const initial: Record<string, string> = {};
    for (const variable of variables) {
      if (!(variable.name in initial)) {
        initial[variable.name] = variable.defaultValue;
      }
    }
    setValues(initial);
  }, [variables]);

  // Get the final content with variables replaced
  const getFinalContent = useCallback(() => {
    let result = content;
    for (const variable of variables) {
      // Use the value if set, otherwise use default
      const value = values[variable.name] || variable.defaultValue;
      result = result.replace(variable.fullMatch, value);
    }
    return result;
  }, [content, variables, values]);

  // Update a variable value
  const updateValue = useCallback((name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getFinalContent());
      setCopied(true);
      toast.success(t("copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("failedToCopy"));
    }
  };

  // Prettify JSON content for display
  const displayContent = isStructured && structuredFormat === "json" 
    ? prettifyJson(content) 
    : content;

  // If no variables, render simple content
  if (variables.length === 0) {
    if (isStructured) {
      return (
        <div className={className}>
          <div className="flex items-center justify-between mb-3">
            {title && <h3 className="text-base font-semibold">{title}</h3>}
            <div className="flex items-center gap-2">
              <RunPromptButton content={displayContent} />
              <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <CodeView 
            content={displayContent} 
            language={structuredFormat}
            className="text-sm"
          />
        </div>
      );
    }
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-3">
          {title && <h3 className="text-base font-semibold">{title}</h3>}
          <div className="flex items-center gap-2">
            <RunPromptButton content={content} />
            <Button variant="ghost" size="sm" onClick={copyToClipboard}>
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg font-mono border">
          {content}
        </pre>
      </div>
    );
  }

  // For structured prompts, render form above code view
  if (isStructured) {
    return (
      <div className={className}>
        {/* Header with title and action buttons */}
        <div className="flex items-center justify-between mb-3">
          {title && <h3 className="text-base font-semibold">{title}</h3>}
          <div className="flex items-center gap-2">
            {isModified && (
              <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 px-2 text-xs">
                <RotateCcw className="h-3 w-3 mr-1" />
                {t("reset")}
              </Button>
            )}
            <RunPromptButton content={getFinalContent()} />
            <Button variant="ghost" size="sm" onClick={copyToClipboard}>
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        {/* Variable form */}
        <div className="mb-4 p-4 rounded-lg border bg-muted/30 space-y-3">
          <span className="text-sm font-medium">{t("variables")}</span>
          <div className="grid gap-3 sm:grid-cols-2">
            {uniqueVariables.map(({ name, defaultValue }) => (
              <div key={name} className="space-y-1">
                <Label htmlFor={`var-${name}`} className="text-xs text-muted-foreground">
                  {name}
                </Label>
                <Input
                  id={`var-${name}`}
                  value={values[name] || ""}
                  onChange={(e) => updateValue(name, e.target.value)}
                  placeholder={defaultValue}
                  className="h-8 text-sm"
                />
              </div>
            ))}
          </div>
        </div>
        {/* Code view with replaced variables */}
        <CodeView 
          content={getFinalContent()} 
          language={structuredFormat}
          className="text-sm"
        />
      </div>
    );
  }

  // Render content with inline contenteditable spans
  const renderContent = () => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const regex = /\$\{([^:}]+)(?::([^}]*))?\}/g;
    let match;
    let keyIndex = 0;

    while ((match = regex.exec(content)) !== null) {
      // Add text before the variable
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }

      const name = match[1].trim();
      const currentValue = values[name] || "";

      // Add contenteditable span
      parts.push(
        <EditableSpan
          key={keyIndex++}
          value={currentValue}
          onChange={(newValue) => updateValue(name, newValue)}
        />
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts;
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        {title && <h3 className="text-base font-semibold">{title}</h3>}
        <div className="flex items-center gap-2">
          {isModified && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 px-2 text-xs">
              <RotateCcw className="h-3 w-3 mr-1" />
              {t("reset")}
            </Button>
          )}
          <RunPromptButton content={getFinalContent()} />
          <Button variant="ghost" size="sm" onClick={copyToClipboard}>
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <div className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg font-mono border leading-relaxed">
        {renderContent()}
      </div>
    </div>
  );
}
