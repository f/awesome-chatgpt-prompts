"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Play, RotateCcw, Code2, FileJson, FileText, Video, Music, Image as ImageIcon, MessageSquare, Sparkles } from "lucide-react";
import { toast } from "sonner";

// Import the actual prompts.chat library
import {
  builder,
  fromPrompt,
  templates,
  video,
  audio,
  image,
  chat,
  chatPresets,
  variables,
  similarity,
  quality,
  parser,
} from "prompts.chat";

// Import auto-generated type definitions and method options for Monaco
import { type ApiItem } from "@/data/api-docs";
import { TYPE_DEFINITIONS } from "@/data/type-definitions";
import { METHOD_OPTIONS } from "@/data/method-options";

// Import separated components
import { ApiDocsSidebar } from "./api-docs-sidebar";
import { ApiDetailsPopup } from "./api-details-popup";
import { toYaml } from "./utils";
import { type OutputFormat } from "./types";

// Import examples as raw text
import {
  EXAMPLE_VIDEO,
  EXAMPLE_AUDIO,
  EXAMPLE_IMAGE,
  EXAMPLE_CHAT,
  EXAMPLE_OPENAI_CHAT,
  DEFAULT_CODE,
} from "./examples";

export function PromptIde() {
  const t = useTranslations("ide");
  const { theme } = useTheme();
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState<string>("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("json");
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedApiItem, setSelectedApiItem] = useState<ApiItem | null>(null);

  // Check if code has imports other than 'prompts.chat'
  const hasExternalImports = useCallback(() => {
    const importRegex = /^import\s+.*?from\s+['"](.+?)['"];?\s*$/gm;
    let match;
    while ((match = importRegex.exec(code)) !== null) {
      const importPath = match[1];
      if (!importPath.startsWith('prompts.chat')) {
        return true;
      }
    }
    return false;
  }, [code]);

  const cannotEvaluate = hasExternalImports();

  const runCode = useCallback(() => {
    setIsRunning(true);
    setError(null);

    try {
      // Transform code: strip imports and handle the module-style code
      let transformedCode = code
        // Remove import statements
        .replace(/^import\s+.*?from\s+['"]prompts\.chat['"];?\s*$/gm, '')
        .replace(/^import\s+.*?from\s+['"]prompts\.chat\/.*?['"];?\s*$/gm, '')
        // Remove export statements but keep the content
        .replace(/^export\s+/gm, '')
        .trim();
      
      // Find the last expression (standalone identifier or expression) and return it
      const lines = transformedCode.split('\n');
      const lastLine = lines[lines.length - 1].trim();
      
      // If the last line is a simple identifier or expression (not a statement), wrap it in return
      if (lastLine && !lastLine.endsWith(';') && !lastLine.startsWith('//') && !lastLine.startsWith('/*')) {
        lines[lines.length - 1] = `return ${lastLine}`;
        transformedCode = lines.join('\n');
      } else if (lastLine.endsWith(';') && !lastLine.includes('=') && !lastLine.startsWith('const ') && !lastLine.startsWith('let ') && !lastLine.startsWith('var ')) {
        // Last line is an expression statement like "prompt;" - convert to return
        lines[lines.length - 1] = `return ${lastLine.slice(0, -1)}`;
        transformedCode = lines.join('\n');
      }
      
      // Wrap the code to capture the result
      const wrappedCode = `
        ${transformedCode}
      `;

      // Execute the code with the actual prompts.chat library
      const fn = new Function(
        'builder', 'fromPrompt', 'templates', 
        'video', 'audio', 'image', 'chat', 'chatPresets',
        'variables', 'similarity', 'quality', 'parser',
        wrappedCode
      );
      const result = fn(
        builder, fromPrompt, templates,
        video, audio, image, chat, chatPresets,
        variables, similarity, quality, parser
      );

      // Format output based on selected format
      formatOutput(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setOutput("");
    } finally {
      setIsRunning(false);
    }
  }, [code, outputFormat]);

  const formatOutput = useCallback((result: unknown) => {
    if (!result) {
      setOutput("");
      return;
    }

    try {
      switch (outputFormat) {
        case "json":
          setOutput(JSON.stringify(result, null, 2));
          break;
        case "yaml":
          setOutput(toYaml(result));
          break;
        case "markdown":
          if (typeof result === 'string') {
            setOutput(result);
          } else if (typeof result === 'object' && result !== null) {
            // Try common prompt result properties
            if ('content' in result) {
              setOutput((result as { content: string }).content);
            } else if ('prompt' in result) {
              setOutput((result as { prompt: string }).prompt);
            } else if ('systemPrompt' in result) {
              setOutput((result as { systemPrompt: string }).systemPrompt);
            } else {
              // Fallback to JSON for objects without known text properties
              setOutput(JSON.stringify(result, null, 2));
            }
          } else {
            setOutput(String(result));
          }
          break;
      }
    } catch {
      setError("Failed to format output");
    }
  }, [outputFormat]);

  // Re-run when output format changes
  useEffect(() => {
    if (output || error) {
      runCode();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outputFormat]);

  const handleEditorMount = useCallback((_editor: unknown, monaco: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m = monaco as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editor = _editor as any;
    
    // Add custom type definitions for prompts.chat
    m.languages?.typescript?.typescriptDefaults?.addExtraLib(
      TYPE_DEFINITIONS,
      'prompts.chat.d.ts'
    );

    // Configure TypeScript compiler options for better autocomplete
    m.languages?.typescript?.typescriptDefaults?.setCompilerOptions({
      target: 99, // ESNext
      allowNonTsExtensions: true,
      moduleResolution: 2, // NodeJs
      module: 99, // ESNext
      noEmit: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      strict: true,
    });

    // Enable better diagnostics for autocomplete
    m.languages?.typescript?.typescriptDefaults?.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    // Trigger suggestions automatically on string quotes and method calls
    editor?.updateOptions?.({
      quickSuggestions: {
        strings: true,
        comments: false,
        other: true,
      },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
      wordBasedSuggestions: 'off',
      parameterHints: { enabled: true },
    });

    // Register completion provider that triggers on quotes for string literals
    m.languages?.registerCompletionItemProvider?.('typescript', {
      triggerCharacters: ['"', "'", '('],
      provideCompletionItems: (model: unknown, position: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mdl = model as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pos = position as any;
        
        const textUntilPosition = mdl.getValueInRange({
          startLineNumber: pos.lineNumber,
          startColumn: 1,
          endLineNumber: pos.lineNumber,
          endColumn: pos.column,
        });

        // Check if we're inside a method call with a string argument
        // Match first param: .method(" or subsequent params: .method("value", "
        const methodMatch = textUntilPosition.match(/\.(\w+)\s*\([^)]*,\s*["']?$/) || 
                            textUntilPosition.match(/\.(\w+)\s*\(\s*["']?$/);
        if (!methodMatch) {
          return { suggestions: [] };
        }

        const methodName = methodMatch[1];
        
        // Use dynamically generated method options from TypeScript source
        const options = METHOD_OPTIONS[methodName];
        if (!options) {
          return { suggestions: [] };
        }

        // Determine if we need to include quotes
        const needsQuote = !textUntilPosition.endsWith('"') && !textUntilPosition.endsWith("'");
        const quoteChar = textUntilPosition.includes('"') ? '' : (needsQuote ? '"' : '');

        const suggestions = options.map((option, index) => ({
          label: option,
          kind: 12, // Value
          insertText: needsQuote ? `"${option}"` : option,
          sortText: String(index).padStart(3, '0'),
          detail: `${methodName} option`,
          range: {
            startLineNumber: pos.lineNumber,
            startColumn: pos.column,
            endLineNumber: pos.lineNumber,
            endColumn: pos.column,
          },
        }));

        return { suggestions };
      },
    });
  }, []);

  const copyOutput = useCallback(() => {
    navigator.clipboard.writeText(output);
    toast.success(t("copied"));
  }, [output, t]);

  const resetCode = useCallback(() => {
    setCode(DEFAULT_CODE);
    setOutput("");
    setError(null);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-48px)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b px-4 py-2 bg-background">
        <div className="flex items-center gap-3">
          <Code2 className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="text-lg font-semibold leading-tight">{t("title")}</h1>
            <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetCode}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {t("reset")}
          </Button>
          <Button
            size="sm"
            onClick={runCode}
            disabled={isRunning || cannotEvaluate}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            {t("run")}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* API Docs sidebar */}
        <div className="relative flex flex-col">
          <ApiDocsSidebar selectedItem={selectedApiItem} onSelectItem={setSelectedApiItem} />
          {selectedApiItem && (
            <ApiDetailsPopup item={selectedApiItem} onClose={() => setSelectedApiItem(null)} />
          )}
        </div>

        {/* Editor panel */}
        <div className="flex-1 flex flex-col border-r">
          <div className="h-10 px-4 border-b bg-muted/30 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t("editor")}</span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs gap-1 px-2"
                onClick={() => setCode(EXAMPLE_VIDEO)}
              >
                <Video className="h-3 w-3" />
                Video
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs gap-1 px-2"
                onClick={() => setCode(EXAMPLE_AUDIO)}
              >
                <Music className="h-3 w-3" />
                Audio
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs gap-1 px-2"
                onClick={() => setCode(EXAMPLE_IMAGE)}
              >
                <ImageIcon className="h-3 w-3" />
                Image
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs gap-1 px-2"
                onClick={() => setCode(EXAMPLE_CHAT)}
              >
                <MessageSquare className="h-3 w-3" />
                Chat
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs gap-1 px-2"
                onClick={() => setCode(EXAMPLE_OPENAI_CHAT)}
              >
                <Sparkles className="h-3 w-3" />
                OpenAI
              </Button>
            </div>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="typescript"
              value={code}
              onChange={(value) => setCode(value || "")}
              theme={theme === "dark" ? "vs-dark" : "light"}
              onMount={handleEditorMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
                padding: { top: 16, bottom: 16 },
              }}
            />
          </div>
        </div>

        {/* Preview panel */}
        <div className="flex-1 flex flex-col">
          <div className="h-10 px-4 border-b bg-muted/30 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t("preview")}</span>
            <div className="flex items-center gap-2">
              <Tabs value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
                <TabsList className="h-8">
                  <TabsTrigger value="json" className="text-xs gap-1 px-2 h-6">
                    <FileJson className="h-3 w-3" />
                    JSON
                  </TabsTrigger>
                  <TabsTrigger value="yaml" className="text-xs gap-1 px-2 h-6">
                    <FileText className="h-3 w-3" />
                    YAML
                  </TabsTrigger>
                  <TabsTrigger value="markdown" className="text-xs gap-1 px-2 h-6">
                    <FileText className="h-3 w-3" />
                    MD
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              {output && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={copyOutput}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            {error ? (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md m-4">
                <p className="text-sm text-destructive font-mono">{error}</p>
              </div>
            ) : output ? (
              <Editor
                height="100%"
                language={outputFormat === "json" ? "json" : outputFormat === "yaml" ? "yaml" : "markdown"}
                value={output}
                theme={theme === "dark" ? "vs-dark" : "light"}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: "off",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: "on",
                  padding: { top: 16, bottom: 16 },
                  folding: true,
                  renderLineHighlight: "none",
                  scrollbar: {
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8,
                  },
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                {cannotEvaluate ? (
                  <>
                    <Code2 className="h-12 w-12 mb-4 opacity-20" />
                    <p className="text-sm text-center px-4">{t("cannotEvaluate")}<br />{t("onlyPromptsChat", { library: "prompts.chat" })}</p>
                  </>
                ) : (
                  <>
                    <Play className="h-12 w-12 mb-4 opacity-20" />
                    <p className="text-sm">{t("runToPreview")}</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
