"use client";

import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import Editor from "@monaco-editor/react";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  code: string;
  language: string;
  filename?: string;
}

export function CodeEditor({ code, language, filename }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const lineCount = code.split('\n').length;

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("my-4 rounded-lg border overflow-hidden", isDark ? "bg-[#1e1e1e]" : "bg-[#ffffff]")}>
      <div className={cn("flex items-center justify-between px-4 py-2 border-b", isDark ? "bg-[#252526] border-[#3c3c3c]" : "bg-[#f3f3f3] border-[#e0e0e0]")}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          {filename && (
            <span className={cn("text-xs ml-2 font-mono", isDark ? "text-[#cccccc]" : "text-[#333333]")}>{filename}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-xs uppercase", isDark ? "text-[#6e6e6e]" : "text-[#999999]")}>{language}</span>
          <button
            onClick={handleCopy}
            className={cn("text-xs px-2 py-1 rounded transition-colors", isDark ? "bg-[#3c3c3c] text-[#cccccc] hover:bg-[#4c4c4c]" : "bg-[#e0e0e0] text-[#333333] hover:bg-[#d0d0d0]")}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </button>
        </div>
      </div>
      <Editor
        height={`${Math.min(lineCount * 19 + 20, 400)}px`}
        language={language}
        value={code}
        theme={isDark ? "vs-dark" : "light"}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 13,
          lineNumbers: "off",
          folding: false,
          lineDecorationsWidth: 12,
          lineNumbersMinChars: 0,
          renderLineHighlight: "none",
          scrollbar: { vertical: "hidden", horizontal: "auto" },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          contextmenu: false,
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}
