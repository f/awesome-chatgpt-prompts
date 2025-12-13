"use client";

import { useMemo, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Variable } from "lucide-react";

interface VariableHintProps {
  content: string;
  onContentChange: (newContent: string) => void;
}

// Regex to match our supported variable format: ${name} or ${name:default}
const SUPPORTED_VAR_REGEX = /\$\{([a-zA-Z_][a-zA-Z0-9_\s]*?)(?::([^}]*))?\}/g;

export function VariableHint({ content, onContentChange }: VariableHintProps) {
  const t = useTranslations("prompts");
  const originalRef = useRef<{ name: string; defaultValue?: string } | null>(null);

  const variables = useMemo(() => {
    const vars: Array<{ name: string; defaultValue?: string }> = [];
    const matches = content.matchAll(SUPPORTED_VAR_REGEX);
    
    for (const match of matches) {
      const name = match[1].trim();
      const defaultValue = match[2]?.trim();
      // Avoid duplicates
      if (!vars.some(v => v.name === name && v.defaultValue === defaultValue)) {
        vars.push({ name, defaultValue });
      }
    }
    
    return vars;
  }, [content]);

  const handleFocus = useCallback((v: { name: string; defaultValue?: string }) => {
    originalRef.current = { ...v };
  }, []);

  const handleBlur = useCallback((
    e: React.FocusEvent<HTMLSpanElement>,
    field: 'name' | 'default',
    v: { name: string; defaultValue?: string }
  ) => {
    const newValue = e.currentTarget.textContent?.trim() || "";
    const original = originalRef.current;
    
    if (!original) return;

    if (field === 'name') {
      const sanitized = newValue.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
      if (sanitized && sanitized !== original.name) {
        // Replace all occurrences
        const regex = new RegExp(
          `\\$\\{${original.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(:[^}]*)?\\}`,
          'g'
        );
        const newContent = content.replace(regex, (_, defaultPart) => {
          return `\${${sanitized}${defaultPart || ''}}`;
        });
        onContentChange(newContent);
      } else {
        // Reset to original if invalid
        e.currentTarget.textContent = original.name;
      }
    } else {
      // Editing default value
      if (newValue !== (original.defaultValue || "")) {
        const regex = new RegExp(
          `\\$\\{${original.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(:[^}]*)?\\}`,
          'g'
        );
        const newContent = content.replace(regex, () => {
          return newValue ? `\${${original.name}:${newValue}}` : `\${${original.name}}`;
        });
        onContentChange(newContent);
      }
    }
    
    originalRef.current = null;
  }, [content, onContentChange]);

  const handleKeyDown = useCallback((
    e: React.KeyboardEvent<HTMLSpanElement>,
    field: 'name' | 'default',
    v: { name: string; defaultValue?: string }
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      e.preventDefault();
      const original = originalRef.current;
      if (original) {
        e.currentTarget.textContent = field === 'name' ? original.name : (original.defaultValue || "");
      }
      originalRef.current = null;
      e.currentTarget.blur();
    }
  }, []);

  if (variables.length === 0) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap overflow-x-auto">
      <Variable className="h-3 w-3 shrink-0" />
      <span>{t("detectedVariables")}:</span>
      <div className="flex gap-1 items-center">
        {variables.map((v, i) => (
          <code
            key={`${v.name}-${v.defaultValue || ''}-${i}`}
            className="bg-muted px-1.5 py-0.5 rounded text-foreground"
          >
            <span
              contentEditable
              suppressContentEditableWarning
              onFocus={() => handleFocus(v)}
              onBlur={(e) => handleBlur(e, 'name', v)}
              onKeyDown={(e) => handleKeyDown(e, 'name', v)}
              className="outline-none focus:bg-primary/20 focus:rounded-sm px-0.5 -mx-0.5 cursor-text"
              title={t("clickToEdit") || "Click to edit"}
            >
              {v.name}
            </span>
            {v.defaultValue !== undefined && (
              <>
                <span className="text-muted-foreground">:</span>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onFocus={() => handleFocus(v)}
                  onBlur={(e) => handleBlur(e, 'default', v)}
                  onKeyDown={(e) => handleKeyDown(e, 'default', v)}
                  className="text-muted-foreground outline-none focus:bg-primary/20 focus:rounded-sm focus:text-foreground px-0.5 -mx-0.5 cursor-text"
                  title={t("clickToEdit") || "Click to edit"}
                >
                  {v.defaultValue}
                </span>
              </>
            )}
          </code>
        ))}
      </div>
    </div>
  );
}
