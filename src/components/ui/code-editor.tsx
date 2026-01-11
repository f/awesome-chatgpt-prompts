"use client";

import { useTheme } from "next-themes";
import Editor, { type OnMount } from "@monaco-editor/react";
import { cn } from "@/lib/utils";
import { useCallback, useRef, useEffect, memo, forwardRef, useImperativeHandle } from "react";

export interface CodeEditorHandle {
  insertAtCursor: (text: string) => void;
}

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: "json" | "yaml" | "markdown";
  placeholder?: string;
  className?: string;
  minHeight?: string;
  debounceMs?: number;
  readOnly?: boolean;
}

const CodeEditorInner = forwardRef<CodeEditorHandle, CodeEditorProps>(function CodeEditorInner({
  value,
  onChange,
  language,
  placeholder,
  className,
  minHeight = "300px",
  debounceMs = 0,
  readOnly = false,
}, ref) {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const onChangeRef = useRef(onChange);
  const internalValueRef = useRef(value);
  
  // Keep onChange ref updated without triggering re-renders
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const handleEditorMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  useImperativeHandle(ref, () => ({
    insertAtCursor: (text: string) => {
      const editor = editorRef.current;
      if (editor) {
        const selection = editor.getSelection();
        if (selection) {
          editor.executeEdits("insert", [{
            range: selection,
            text,
            forceMoveMarkers: true,
          }]);
          editor.focus();
        }
      }
    },
  }), []);

  const handleChange = useCallback(
    (newValue: string | undefined) => {
      const val = newValue || "";
      // Track internal value to avoid external updates overriding typing
      internalValueRef.current = val;
      
      if (debounceMs > 0) {
        // Clear existing timer
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }
        // Set new timer
        debounceTimer.current = setTimeout(() => {
          onChangeRef.current(val);
        }, debounceMs);
      } else {
        onChangeRef.current(val);
      }
    },
    [debounceMs]
  );
  
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Only update editor value if it changed externally (not from typing)
  const displayValue = value || placeholder;

  return (
    <div
      dir="ltr"
      className={cn(
        "border rounded-md overflow-hidden text-left",
        className
      )}
      style={{ minHeight }}
    >
      <Editor
        height={minHeight}
        language={language}
        value={displayValue}
        onChange={handleChange}
        onMount={handleEditorMount}
        theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
        options={{
          minimap: { enabled: false },
          fontSize: 11,
          lineNumbers: "off",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          wrappingIndent: "indent",
          automaticLayout: true,
          tabSize: 2,
          padding: { top: 8, bottom: 8 },
          renderLineHighlight: readOnly ? "none" : "line",
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          readOnly: readOnly,
          domReadOnly: readOnly,
          scrollbar: {
            vertical: "auto",
            horizontal: "auto",
            verticalScrollbarSize: 4,
            horizontalScrollbarSize: 4,
          },
        }}
      />
    </div>
  );
});

// Memoize to prevent re-renders when parent state changes
// Only re-render when value, language, placeholder, className, minHeight, or debounceMs change
export const CodeEditor = memo(CodeEditorInner, (prevProps, nextProps) => {
  return (
    prevProps.value === nextProps.value &&
    prevProps.language === nextProps.language &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.className === nextProps.className &&
    prevProps.minHeight === nextProps.minHeight &&
    prevProps.debounceMs === nextProps.debounceMs &&
    prevProps.readOnly === nextProps.readOnly
  );
});
