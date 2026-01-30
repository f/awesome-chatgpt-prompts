"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Play, Code2, FileJson, FileText, Video, Music, Image as ImageIcon, MessageSquare, Terminal, AlertCircle, XCircle, ChevronDown, ChevronUp, ChevronRight, Dices, Loader2, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { RunPromptButton } from "@/components/prompts/run-prompt-button";

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
import { TYPE_OPTIONS } from "@/data/method-options";

// Import separated components
import { ApiDocsSidebar } from "./api-docs-sidebar";
import { ApiDetailsPopup } from "./api-details-popup";
import { toYaml } from "./utils";
import { type OutputFormat } from "./types";

import { useRouter } from "next/navigation";

// Import examples as raw text
import {
  EXAMPLE_VIDEO,
  EXAMPLE_AUDIO,
  EXAMPLE_IMAGE,
  EXAMPLE_CHAT,
} from "./examples";

export function PromptIde() {
  const t = useTranslations("ide");
  const { theme } = useTheme();
  const { data: session } = useSession();
  
  // Load saved code from localStorage or use default
  const [code, setCode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('promptBuilderCode');
      if (saved) return saved;
    }
    return EXAMPLE_IMAGE;
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState<string>("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("markdown");
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedApiItem, setSelectedApiItem] = useState<ApiItem | null>(null);
  const [lastValidOutput, setLastValidOutput] = useState<string>("");
  const [consoleErrors, setConsoleErrors] = useState<Array<{ type: 'error' | 'warning' | 'info'; message: string; line?: number; column?: number }>>([]); 
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [consoleHeight, setConsoleHeight] = useState(128); // min height
  const monacoRef = useRef<unknown>(null);
  const editorRef = useRef<unknown>(null);
  const previewEditorRef = useRef<unknown>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const previewDecorationsRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isResizingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);
  
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

  // Get TypeScript diagnostics from Monaco
  const getTypeErrors = useCallback(() => {
    if (!monacoRef.current || !editorRef.current) return [];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const monaco = monacoRef.current as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any  
    const editor = editorRef.current as any;
    const model = editor.getModel();
    if (!model) return [];
    
    const markers = monaco.editor.getModelMarkers({ resource: model.uri });
    return markers
      .filter((m: { severity: number }) => m.severity >= 4) // Error severity
      .map((m: { message: string; startLineNumber: number; startColumn: number; severity: number }) => {
        let message = m.message;
        
        // Try to extract type name(s) and add valid options from TYPE_OPTIONS
        // Handles both single types and union types like 'MusicGenre | AudioGenre'
        const typeMatch = message.match(/parameter of type '([^']+)'/);
        if (typeMatch) {
          const typeStr = typeMatch[1];
          // Split by | for union types and extract individual type names
          const typeNames = typeStr.split('|').map(t => t.trim());
          const allOptions: string[] = [];
          
          for (const typeName of typeNames) {
            const options = TYPE_OPTIONS[typeName];
            if (options) {
              allOptions.push(...options);
            }
          }
          
          // Deduplicate and show all options
          const uniqueOptions = [...new Set(allOptions)];
          if (uniqueOptions.length > 0) {
            message += `\n  Valid: ${uniqueOptions.map(o => `'${o}'`).join(', ')}`;
          }
        }
        
        return {
          type: m.severity === 8 ? 'error' : 'warning' as const,
          message,
          line: m.startLineNumber,
          column: m.startColumn,
        };
      });
  }, []);

  const runCode = useCallback((showErrors = true) => {
    // A03: Require authentication before executing code
    if (!session?.user) {
      setError("Authentication required to run code");
      setConsoleErrors([{ type: 'error', message: 'You must be logged in to execute code. Please sign in to use the IDE.' }]);
      return;
    }
    
    setIsRunning(true);
    
    // Get type errors first
    const typeErrors = getTypeErrors();
    
    // Capture console output
    const consoleLogs: Array<{ type: 'info' | 'warning' | 'error'; message: string }> = [];
    const mockConsole = {
      log: (...args: unknown[]) => {
        consoleLogs.push({ type: 'info', message: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') });
      },
      info: (...args: unknown[]) => {
        consoleLogs.push({ type: 'info', message: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') });
      },
      warn: (...args: unknown[]) => {
        consoleLogs.push({ type: 'warning', message: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') });
      },
      error: (...args: unknown[]) => {
        consoleLogs.push({ type: 'error', message: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') });
      },
    };
    
    try {
      // Transform code: strip imports and handle the module-style code
      let transformedCode = code
        // Remove all import statements (prompts.chat imports are provided via function params)
        .replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
        .replace(/^import\s+['"][^'"]+['"];?\s*$/gm, '') // side-effect imports
        // Remove other export statements but keep the content
        .replace(/^export\s+(?!default)/gm, '')
        .trim();
      
      // Handle "export default" - find it and convert to return (handles multiline objects)
      const exportDefaultMatch = transformedCode.match(/^export\s+default\s+/m);
      if (exportDefaultMatch) {
        const idx = transformedCode.indexOf(exportDefaultMatch[0]);
        transformedCode = transformedCode.substring(0, idx) + 'return ' + transformedCode.substring(idx + exportDefaultMatch[0].length);
      }
      
      // Find the last expression (standalone identifier or expression) and return it
      const lines = transformedCode.split('\n');
      const lastLine = lines[lines.length - 1].trim();
      
      // Skip if code already has a return statement (from export default transformation)
      const hasReturn = transformedCode.includes('return ');
      if (!hasReturn) {
        // If the last line is a simple identifier or expression (not a statement), wrap it in return
        if (lastLine && !lastLine.endsWith(';') && !lastLine.startsWith('//') && !lastLine.startsWith('/*') && !lastLine.startsWith('}')) {
          lines[lines.length - 1] = `return ${lastLine}`;
          transformedCode = lines.join('\n');
        } else if (lastLine.endsWith(';') && !lastLine.includes('=') && !lastLine.startsWith('const ') && !lastLine.startsWith('let ') && !lastLine.startsWith('var ') && !lastLine.startsWith('}')) {
          // Last line is an expression statement like "prompt;" - convert to return
          lines[lines.length - 1] = `return ${lastLine.slice(0, -1)}`;
          transformedCode = lines.join('\n');
        }
      }
      
      // Wrap the code to capture the result
      const wrappedCode = `
        ${transformedCode}
      `;

      // Execute the code with the actual prompts.chat library and mock console
      const fn = new Function(
        'builder', 'fromPrompt', 'templates', 
        'video', 'audio', 'image', 'chat', 'chatPresets',
        'variables', 'similarity', 'quality', 'parser',
        'console',
        wrappedCode
      );
      const result = fn(
        builder, fromPrompt, templates,
        video, audio, image, chat, chatPresets,
        variables, similarity, quality, parser,
        mockConsole
      );

      // Success - format output and update last valid output
      setError(null);
      if (showErrors) {
        setConsoleErrors([...typeErrors, ...consoleLogs]); // Show type errors + console output
      }
      
      // Check if result is the new { json, yaml, markdown } export format
      const isExportFormat = result && typeof result === 'object' && 
        ('json' in result || 'yaml' in result || 'markdown' in result);
      
      if (isExportFormat) {
        // Use the appropriate format based on selected output format
        const exportResult = result as { json?: unknown; yaml?: unknown; markdown?: unknown };
        let outputValue: unknown;
        let formattedOutput: string;
        
        switch (outputFormat) {
          case "json":
            outputValue = exportResult.json ?? exportResult.yaml ?? exportResult.markdown;
            formattedOutput = typeof outputValue === 'string' ? outputValue : JSON.stringify(outputValue, null, 2);
            break;
          case "yaml":
            outputValue = exportResult.yaml ?? exportResult.json ?? exportResult.markdown;
            formattedOutput = typeof outputValue === 'string' ? outputValue : toYaml(outputValue);
            break;
          case "markdown":
            outputValue = exportResult.markdown ?? exportResult.json ?? exportResult.yaml;
            formattedOutput = typeof outputValue === 'string' ? outputValue : JSON.stringify(outputValue, null, 2);
            break;
        }
        
        setOutput(formattedOutput);
        setLastValidOutput(formattedOutput);
      } else {
        // Legacy format - use old logic
        formatOutput(result);
        // Save as last valid output
        if (result) {
          try {
            switch (outputFormat) {
              case "json":
                setLastValidOutput(JSON.stringify(result, null, 2));
                break;
              case "yaml":
                setLastValidOutput(toYaml(result));
                break;
              case "markdown":
                if (typeof result === 'string') {
                  setLastValidOutput(result);
                } else if (typeof result === 'object' && result !== null) {
                  if ('content' in result) {
                    setLastValidOutput((result as { content: string }).content);
                  } else if ('prompt' in result) {
                    setLastValidOutput((result as { prompt: string }).prompt);
                  } else if ('systemPrompt' in result) {
                    setLastValidOutput((result as { systemPrompt: string }).systemPrompt);
                  } else {
                    setLastValidOutput(JSON.stringify(result, null, 2));
                  }
                } else {
                  setLastValidOutput(String(result));
                }
                break;
            }
          } catch {
            // Ignore formatting errors for lastValidOutput
          }
        }
      }
    } catch (err) {
      // Runtime error - keep last valid output, show error in console
      const runtimeError = {
        type: 'error' as const,
        message: err instanceof Error ? err.message : "An error occurred",
      };
      setError(runtimeError.message);
      if (showErrors) {
        setConsoleErrors([...typeErrors, ...consoleLogs, runtimeError]); // Include console output before error
        setIsConsoleOpen(true); // Auto-open console on error
      }
      // Don't clear output - keep last valid output visible
    } finally {
      setIsRunning(false);
    }
  }, [code, outputFormat, getTypeErrors]);

  
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

  // Auto-run code with debounce when code changes
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      if (!cannotEvaluate) {
        runCode(true);
      }
    }, 500); // 500ms debounce
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [code, cannotEvaluate]);

  // Re-run when output format changes
  useEffect(() => {
    if (output || error) {
      runCode(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outputFormat]);

  // Save code to localStorage on change
  useEffect(() => {
    localStorage.setItem('promptBuilderCode', code);
  }, [code]);

  const handleEditorMount = useCallback((_editor: unknown, monaco: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m = monaco as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editor = _editor as any;
    
    // Store refs for later use
    monacoRef.current = monaco;
    editorRef.current = _editor;
    
    // Helper to get quoted string at position
    const getQuotedStringAtPosition = (lineContent: string, column: number) => {
      const col = column - 1; // 0-indexed
      
      // Check if we're inside quotes
      let quoteChar = null;
      let quoteStart = -1;
      
      // Look backwards for opening quote
      for (let i = col - 1; i >= 0; i--) {
        if (lineContent[i] === '"' || lineContent[i] === "'") {
          quoteChar = lineContent[i];
          quoteStart = i;
          break;
        }
      }
      if (quoteStart === -1) return null;
      
      // Look forwards for closing quote
      let quoteEnd = -1;
      for (let i = col; i < lineContent.length; i++) {
        if (lineContent[i] === quoteChar) {
          quoteEnd = i;
          break;
        }
      }
      if (quoteEnd === -1) return null;
      
      // Verify the click is actually between the quotes
      if (col < quoteStart || col > quoteEnd) return null;
      
      return lineContent.substring(quoteStart + 1, quoteEnd);
    };
    
    // Add click handler to code editor to highlight in preview
    editor.onMouseDown((e: { target: { position?: { lineNumber: number; column: number } } }) => {
      if (e.target.position) {
        const model = editor.getModel();
        if (!model) return;
        
        const lineContent = model.getLineContent(e.target.position.lineNumber);
        const quotedString = getQuotedStringAtPosition(lineContent, e.target.position.column);
        
        if (quotedString && quotedString.length >= 2) {
          // Clear previous decorations in preview
          if (previewDecorationsRef.current) {
            previewDecorationsRef.current.clear();
          }
          
          // Highlight in preview editor
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const previewEditor = previewEditorRef.current as any;
          if (previewEditor) {
            const previewModel = previewEditor.getModel();
            if (previewModel) {
              const escapedText = quotedString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const previewMatches = previewModel.findMatches(escapedText, true, false, true, null, true);
              if (previewMatches.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const decorations = previewMatches.map((match: any) => ({
                  range: match.range,
                  options: {
                    className: 'wordHighlight',
                    inlineClassName: 'bg-yellow-300/50 dark:bg-yellow-500/30 rounded',
                  }
                }));
                previewDecorationsRef.current = previewEditor.createDecorationsCollection(decorations);
              }
            }
          }
        }
      }
    });
    
    // Listen for marker changes (type errors)
    m.editor.onDidChangeMarkers?.(() => {
      const typeErrors = getTypeErrors();
      setConsoleErrors(prev => {
        // Keep runtime errors, update type errors
        const runtimeErrors = prev.filter(e => !e.line);
        return [...typeErrors, ...runtimeErrors];
      });
    });
    
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

    // Add keyboard shortcut to trigger suggestions (Option+Space / Alt+Space)
    editor?.addAction?.({
      id: 'trigger-suggestions',
      label: 'Trigger Suggestions',
      keybindings: [
        m.KeyMod.Alt | m.KeyCode.Space,
      ],
      run: () => {
        editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
      }
    });
  }, [getTypeErrors]);

  const copyOutput = useCallback(() => {
    navigator.clipboard.writeText(output);
    toast.success(t("copied"));
  }, [output, t]);

  const router = useRouter();

  const createPrompt = useCallback(() => {
    const promptContent = output || lastValidOutput;
    if (!promptContent) {
      toast.error("Run the code first to generate a prompt");
      return;
    }
    
    // Detect output type based on the code's import
    let promptType: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" = "TEXT";
    if (code.includes("video()")) promptType = "VIDEO";
    else if (code.includes("audio()")) promptType = "AUDIO";
    else if (code.includes("image()")) promptType = "IMAGE";
    
    // Detect format based on current outputFormat
    let format: "JSON" | "YAML" | undefined;
    if (outputFormat === "json") format = "JSON";
    else if (outputFormat === "yaml") format = "YAML";
    
    // Store data in sessionStorage to avoid query string size limits
    const builderData = {
      content: promptContent,
      type: promptType,
      format,
    };
    sessionStorage.setItem("promptBuilderData", JSON.stringify(builderData));
    
    router.push("/prompts/new?from=builder");
  }, [output, lastValidOutput, router, code, outputFormat]);

  // Add @ts-ignore comments before lines with type errors
  const ignoreTypeErrors = useCallback(() => {
    if (!monacoRef.current || !editorRef.current) return;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const monaco = monacoRef.current as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editor = editorRef.current as any;
    const model = editor.getModel();
    if (!model) return;
    
    const markers = monaco.editor.getModelMarkers({ resource: model.uri });
    const typeErrors = markers.filter((m: { severity: number; message: string }) => 
      m.severity >= 4 && m.message.includes("is not assignable to")
    );
    
    if (typeErrors.length === 0) return;
    
    const lines = code.split('\n');
    
    // Get unique error line numbers, sorted from bottom to top
    const errorLineNums: number[] = typeErrors.map((e: { startLineNumber: number }) => e.startLineNumber);
    const uniqueLines = [...new Set(errorLineNums)].sort((a, b) => b - a);
    
    // Insert @ts-ignore before each error line (from bottom to preserve line numbers)
    for (const lineNum of uniqueLines) {
      const lineIndex = lineNum - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        // Check if previous line already has @ts-ignore
        if (lineIndex > 0 && lines[lineIndex - 1].includes('@ts-ignore')) continue;
        
        // Get indentation of the error line
        const indent = lines[lineIndex].match(/^(\s*)/)?.[1] || '';
        lines.splice(lineIndex, 0, `${indent}// @ts-ignore`);
      }
    }
    
    setCode(lines.join('\n'));
  }, [code]);
  
  const generateExample = useCallback(async () => {
    if (!session?.user) {
      toast.error(t("loginToGenerate"));
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await fetch("/api/prompt-builder/generate-example", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 429) {
          toast.error(t("rateLimitExceeded", { seconds: data.resetIn }));
        } else {
          toast.error(data.error || t("generateFailed"));
        }
        return;
      }
      
      if (data.code) {
        setCode(data.code);
        toast.success(t("exampleGenerated"));
      }
    } catch {
      toast.error(t("generateFailed"));
    } finally {
      setIsGenerating(false);
    }
  }, [session, t]);

  // Console resize handlers
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = consoleHeight;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  }, [consoleHeight]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const delta = startYRef.current - e.clientY;
      const newHeight = Math.max(128, Math.min(500, startHeightRef.current + delta));
      setConsoleHeight(newHeight);
    };

    const handleMouseUp = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* API Docs sidebar */}
        <div className="relative flex flex-col">
          <ApiDocsSidebar selectedItem={selectedApiItem} onSelectItem={setSelectedApiItem} />
          {selectedApiItem && (
            <ApiDetailsPopup item={selectedApiItem} onClose={() => setSelectedApiItem(null)} />
          )}
        </div>

        {/* Editor panel */}
        <div className="flex-1 flex flex-col border-r min-w-0 min-h-0 overflow-hidden">
          <div className="h-10 px-4 border-b bg-muted/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">{t("editor")}</span>
              <span className="text-[10px] text-muted-foreground/60 bg-muted px-1.5 py-0.5 rounded">⌥ + Space</span>
            </div>
            <div className="flex items-center gap-1">
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
                onClick={() => setCode(EXAMPLE_CHAT)}
              >
                <MessageSquare className="h-3 w-3" />
                Chat
              </Button>
              <div className="w-px h-4 bg-border mx-1" />
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs gap-1 px-2"
                onClick={generateExample}
                disabled={isGenerating || !session?.user}
                title={!session?.user ? t("loginToGenerate") : t("generateRandom")}
              >
                {isGenerating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Dices className="h-3 w-3" />
                )}
                {t("random")}
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
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <div className="h-10 px-4 border-b bg-muted/30 flex items-center justify-between shrink-0">
            <span className="text-sm font-medium text-muted-foreground">{t("preview")}</span>
            <div className="flex items-center gap-2">
              <Tabs value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
                <TabsList className="h-8">
                  <TabsTrigger value="markdown" className="text-xs gap-1 px-2 h-6">
                    <FileText className="h-3 w-3" />
                    MD
                  </TabsTrigger>
                  <TabsTrigger value="json" className="text-xs gap-1 px-2 h-6">
                    <FileJson className="h-3 w-3" />
                    JSON
                  </TabsTrigger>
                  <TabsTrigger value="yaml" className="text-xs gap-1 px-2 h-6">
                    <FileText className="h-3 w-3" />
                    YAML
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              {(output || lastValidOutput) && (
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
            {(output || lastValidOutput) ? (
              <Editor
                height="100%"
                language={outputFormat === "json" ? "json" : outputFormat === "yaml" ? "yaml" : "markdown"}
                value={output || lastValidOutput}
                theme={theme === "dark" ? "vs-dark" : "light"}
                onMount={(previewEditor, monaco) => {
                  // Store preview editor ref for cross-editor highlighting
                  previewEditorRef.current = previewEditor;
                  
                  // Helper to find quoted string containing a word at a position
                  const getQuotedStringAtMatch = (model: unknown, range: { startLineNumber: number; startColumn: number; endColumn: number }) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const mdl = model as any;
                    const lineContent = mdl.getLineContent(range.startLineNumber);
                    const matchStart = range.startColumn - 1;
                    
                    // Look backwards for opening quote
                    let quoteChar = null;
                    let quoteStart = -1;
                    for (let i = matchStart - 1; i >= 0; i--) {
                      if (lineContent[i] === '"' || lineContent[i] === "'") {
                        quoteChar = lineContent[i];
                        quoteStart = i;
                        break;
                      }
                    }
                    if (quoteStart === -1) return null;
                    
                    // Look forwards for closing quote
                    let quoteEnd = -1;
                    for (let i = matchStart; i < lineContent.length; i++) {
                      if (lineContent[i] === quoteChar) {
                        quoteEnd = i;
                        break;
                      }
                    }
                    if (quoteEnd === -1) return null;
                    
                    // Return the content inside quotes (without quotes)
                    return {
                      content: lineContent.substring(quoteStart + 1, quoteEnd),
                      range: {
                        startLineNumber: range.startLineNumber,
                        startColumn: quoteStart + 2, // +1 for 1-indexed, +1 to skip quote
                        endLineNumber: range.startLineNumber,
                        endColumn: quoteEnd + 1, // +1 for 1-indexed
                      }
                    };
                  };
                  
                  // Add click handler to navigate to keyword in code editor
                  previewEditor.onMouseDown((e) => {
                    if (e.target.position) {
                      const model = previewEditor.getModel();
                      if (!model) return;
                      
                      // Get the word at click position
                      const wordInfo = model.getWordAtPosition(e.target.position);
                      if (!wordInfo) return;
                      
                      const word = wordInfo.word;
                      if (!word || word.length < 2) return;
                      
                      // Clear previous decorations
                      if (previewDecorationsRef.current) {
                        previewDecorationsRef.current.clear();
                      }
                      
                      // Search in code editor (full word match with regex)
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const codeEditor = editorRef.current as any;
                      if (!codeEditor) return;
                      
                      const codeModel = codeEditor.getModel();
                      if (!codeModel) return;
                      
                      // Find first occurrence with full word match
                      const matches = codeModel.findMatches(`\\b${word}\\b`, true, true, true, null, true);
                      if (matches.length === 0) return;
                      
                      const firstMatch = matches[0];
                      
                      // Check if the match is inside quotes
                      const quotedString = getQuotedStringAtMatch(codeModel, firstMatch.range);
                      
                      let searchText = word;
                      let selectionRange = firstMatch.range;
                      
                      if (quotedString) {
                        // Use the full quoted content for highlighting
                        searchText = quotedString.content;
                        selectionRange = quotedString.range;
                      }
                      
                      // Select in code editor
                      codeEditor.setSelection(selectionRange);
                      codeEditor.revealLineInCenter(selectionRange.startLineNumber);
                      codeEditor.focus();
                      
                      // Highlight in preview editor - escape special regex chars
                      const escapedText = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                      const previewMatches = model.findMatches(escapedText, true, false, true, null, true);
                      if (previewMatches.length > 0) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const decorations = previewMatches.map((m: any) => ({
                          range: m.range,
                          options: {
                            className: 'wordHighlight',
                            inlineClassName: 'bg-yellow-300/50 dark:bg-yellow-500/30 rounded',
                          }
                        }));
                        previewDecorationsRef.current = previewEditor.createDecorationsCollection(decorations);
                      }
                    }
                  });
                }}
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

          {/* Action buttons above console */}
          <div className="border-t bg-background px-4 py-2 flex items-center justify-between shrink-0">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-2"
            >
              <a href="https://github.com/f/prompts.chat/blob/main/packages/prompts.chat/API.md" target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4" />
                Docs
              </a>
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={createPrompt}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {t("createPrompt")}
              </Button>
              <RunPromptButton
                content={output || lastValidOutput}
                size="sm"
                variant="default"
              />
            </div>
          </div>

          {/* Console panel - inside preview section */}
          <div className="border-t bg-background shrink-0">
            {/* Resize handle */}
            {isConsoleOpen && (
              <div
                onMouseDown={handleResizeStart}
                className="h-1 cursor-ns-resize hover:bg-primary/50 transition-colors"
              />
            )}
            <div className="h-8 px-4 flex items-center justify-between">
              <button
                onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                className="flex items-center gap-2 hover:bg-muted/50 transition-colors rounded px-1 -ml-1"
              >
                <Terminal className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Console</span>
                {consoleErrors.length > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    consoleErrors.some(e => e.type === 'error') 
                      ? 'bg-destructive/20 text-destructive' 
                      : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {consoleErrors.length}
                  </span>
                )}
                {isConsoleOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {consoleErrors.some(e => e.type === 'error' && e.line) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 text-xs px-2"
                  onClick={ignoreTypeErrors}
                >
                  {t("ignoreTypeErrors")}
                </Button>
              )}
            </div>
            {isConsoleOpen && (
              <div style={{ height: consoleHeight }} className="overflow-auto bg-muted/50 dark:bg-zinc-900 font-mono text-xs">
                {consoleErrors.length === 0 ? (
                  <div className="p-3 text-muted-foreground">No output</div>
                ) : (
                  <div className="p-2 space-y-1">
                    {consoleErrors.map((err, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-2 p-1.5 rounded ${
                          err.type === 'error' 
                            ? 'text-red-600 dark:text-red-400 bg-red-500/10' 
                            : err.type === 'warning'
                            ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10'
                            : 'text-foreground bg-transparent'
                        }`}
                      >
                        {err.type === 'error' ? (
                          <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        ) : err.type === 'warning' ? (
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                        )}
                        <span className="flex-1 whitespace-pre-wrap">
                          {err.line && <span className="text-muted-foreground">[{err.line}:{err.column}] </span>}
                          {err.message}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
