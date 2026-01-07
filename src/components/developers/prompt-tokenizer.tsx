"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Editor, { type Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Copy, 
  Check, 
  Trash2, 
  HardDrive,
  AlertTriangle,
  DollarSign,
  Hash,
  FileText,
  Type,
  Zap,
  Settings2,
  Highlighter
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Default settings
const DEFAULT_CONTEXT_WINDOW = 128000;
const DEFAULT_INPUT_PRICE = 2.50;
const DEFAULT_OUTPUT_PRICE = 10.00;

const SETTINGS_STORAGE_KEY = "promptTokenizerSettings";

interface TokenStats {
  tokens: number;
  characters: number;
  words: number;
  lines: number;
  sentences: number;
}

interface TokenizerSettings {
  contextWindow: number;
  inputPrice: number;
  outputPrice: number;
}

interface SavedAnalysis {
  id: string;
  text: string;
  stats: TokenStats;
  createdAt: number;
}

const STORAGE_KEY = "promptTokenizerHistory";
const MAX_HISTORY = 30;

// Model-agnostic token estimation (~4 chars per token average)
function estimateTokens(text: string): number {
  if (!text) return 0;
  const charCount = text.length;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  // Average across common tokenizers: ~4 chars per token, with word boundary adjustments
  return Math.ceil(charCount / 4 + wordCount * 0.1);
}

function calculateStats(text: string): TokenStats {
  const characters = text.length;
  const words = text.split(/\s+/).filter(Boolean).length;
  const lines = text.split(/\n/).length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const tokens = estimateTokens(text);
  
  return { tokens, characters, words, lines, sentences };
}

function loadSettings(): TokenizerSettings {
  if (typeof window === "undefined") return { contextWindow: DEFAULT_CONTEXT_WINDOW, inputPrice: DEFAULT_INPUT_PRICE, outputPrice: DEFAULT_OUTPUT_PRICE };
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        contextWindow: parsed.contextWindow ?? DEFAULT_CONTEXT_WINDOW,
        inputPrice: parsed.inputPrice ?? DEFAULT_INPUT_PRICE,
        outputPrice: parsed.outputPrice ?? DEFAULT_OUTPUT_PRICE,
      };
    }
  } catch {}
  return { contextWindow: DEFAULT_CONTEXT_WINDOW, inputPrice: DEFAULT_INPUT_PRICE, outputPrice: DEFAULT_OUTPUT_PRICE };
}

function saveSettings(settings: TokenizerSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

function loadHistory(): SavedAnalysis[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: SavedAnalysis[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

function formatPrice(price: number): string {
  if (price < 0.01) return `$${price.toFixed(4)}`;
  if (price < 1) return `$${price.toFixed(3)}`;
  return `$${price.toFixed(2)}`;
}

// Approximate tokenization for visualization (simulates BPE-like splitting)
function tokenizeForVisualization(text: string): { start: number; end: number }[] {
  if (!text) return [];
  
  const tokens: { start: number; end: number }[] = [];
  let pos = 0;
  
  while (pos < text.length) {
    // Skip whitespace as its own token
    if (/\s/.test(text[pos])) {
      const start = pos;
      while (pos < text.length && /\s/.test(text[pos])) {
        pos++;
      }
      tokens.push({ start, end: pos });
      continue;
    }
    
    // Handle punctuation as single tokens
    if (/[^\w\s]/.test(text[pos])) {
      tokens.push({ start: pos, end: pos + 1 });
      pos++;
      continue;
    }
    
    // Handle words - split into ~4 char chunks to simulate subword tokenization
    const wordStart = pos;
    while (pos < text.length && /\w/.test(text[pos])) {
      pos++;
    }
    const word = text.slice(wordStart, pos);
    
    // Split longer words into subword tokens (~4 chars each)
    if (word.length <= 4) {
      tokens.push({ start: wordStart, end: pos });
    } else {
      let subPos = wordStart;
      while (subPos < pos) {
        const chunkSize = Math.min(4, pos - subPos);
        tokens.push({ start: subPos, end: subPos + chunkSize });
        subPos += chunkSize;
      }
    }
  }
  
  return tokens;
}

export function PromptTokenizer() {
  const t = useTranslations("developers");
  const { theme } = useTheme();
  const [text, setText] = useState("");
  const [history, setHistory] = useState<SavedAnalysis[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [highlightTokens, setHighlightTokens] = useState(false);
  
  // Monaco editor refs
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationsRef = useRef<editor.IEditorDecorationsCollection | null>(null);
  
  // User-configurable settings
  const [contextWindow, setContextWindow] = useState(DEFAULT_CONTEXT_WINDOW);
  const [inputPrice, setInputPrice] = useState(DEFAULT_INPUT_PRICE);
  const [outputPrice, setOutputPrice] = useState(DEFAULT_OUTPUT_PRICE);

  const stats = useMemo(() => calculateStats(text), [text]);

  const contextUsage = useMemo(() => 
    contextWindow > 0 ? (stats.tokens / contextWindow) * 100 : 0,
    [stats.tokens, contextWindow]
  );

  const estimatedInputCost = useMemo(() => 
    (stats.tokens / 1000000) * inputPrice,
    [stats.tokens, inputPrice]
  );

  const estimatedOutputCost = useMemo(() => 
    (stats.tokens / 1000000) * outputPrice,
    [stats.tokens, outputPrice]
  );

  // Load history and settings on mount
  useEffect(() => {
    setHistory(loadHistory());
    const settings = loadSettings();
    setContextWindow(settings.contextWindow);
    setInputPrice(settings.inputPrice);
    setOutputPrice(settings.outputPrice);
  }, []);

  // Save settings when they change
  useEffect(() => {
    saveSettings({ contextWindow, inputPrice, outputPrice });
  }, [contextWindow, inputPrice, outputPrice]);

  // Apply token highlighting decorations
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    
    // Clear existing decorations
    if (decorationsRef.current) {
      decorationsRef.current.clear();
    }
    
    if (!highlightTokens || !text) return;
    
    const tokens = tokenizeForVisualization(text);
    const model = editor.getModel();
    if (!model) return;
    
    // Create decorations with alternating colors
    const decorations: editor.IModelDeltaDecoration[] = tokens
      .filter(token => !/^\s+$/.test(text.slice(token.start, token.end))) // Skip whitespace-only tokens
      .map((token, index) => {
        const startPos = model.getPositionAt(token.start);
        const endPos = model.getPositionAt(token.end);
        
        return {
          range: new monaco.Range(
            startPos.lineNumber,
            startPos.column,
            endPos.lineNumber,
            endPos.column
          ),
          options: {
            inlineClassName: index % 2 === 0 ? "token-highlight-even" : "token-highlight-odd",
          },
        };
      });
    
    decorationsRef.current = editor.createDecorationsCollection(decorations);
  }, [text, highlightTokens]);

  const handleEditorMount = useCallback((editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Add custom CSS for token highlighting
    const styleId = "token-highlight-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .token-highlight-even {
          background-color: rgba(59, 130, 246, 0.25);
          border-radius: 2px;
        }
        .token-highlight-odd {
          background-color: rgba(168, 85, 247, 0.25);
          border-radius: 2px;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const addToHistory = useCallback(() => {
    if (!text.trim()) return;
    
    const newItem: SavedAnalysis = {
      id: Date.now().toString(),
      text: text.slice(0, 500), // Store truncated for history
      stats,
      createdAt: Date.now(),
    };
    const newHistory = [newItem, ...history].slice(0, MAX_HISTORY);
    setHistory(newHistory);
    saveHistory(newHistory);
    setSelectedId(newItem.id);
    toast.success(t("tokenizer.saved"));
  }, [text, stats, history, t]);

  const deleteFromHistory = useCallback((id: string) => {
    const newHistory = history.filter((item) => item.id !== id);
    setHistory(newHistory);
    saveHistory(newHistory);
    if (selectedId === id) {
      setSelectedId(null);
    }
  }, [history, selectedId]);

  const loadFromHistory = useCallback((item: SavedAnalysis) => {
    setText(item.text);
    setSelectedId(item.id);
  }, []);

  const handleCopy = async () => {
    const report = `Token Analysis Report
Tokens: ${stats.tokens.toLocaleString()}
Characters: ${stats.characters.toLocaleString()}
Words: ${stats.words.toLocaleString()}
Lines: ${stats.lines.toLocaleString()}
Context Usage: ${contextUsage.toFixed(2)}% of ${formatNumber(contextWindow)}
Estimated Input Cost: ${formatPrice(estimatedInputCost)}
Estimated Output Cost: ${formatPrice(estimatedOutputCost)}`;
    
    await navigator.clipboard.writeText(report);
    setCopied(true);
    toast.success(t("copied"));
    setTimeout(() => setCopied(false), 2000);
  };

  const clearText = () => {
    setText("");
    setSelectedId(null);
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* History Sidebar */}
      <div className="w-56 h-full flex flex-col border-r bg-muted/20 shrink-0">
        <div className="p-3 border-b">
          <h3 className="text-sm font-medium">{t("history")}</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <HardDrive className="h-3 w-3" />
            {t("storedOnDevice")}
          </p>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {history.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                {t("noHistory")}
              </p>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "group relative p-2 rounded-md cursor-pointer text-xs hover:bg-muted transition-colors",
                    selectedId === item.id && "bg-muted"
                  )}
                  onClick={() => loadFromHistory(item)}
                >
                  <p className="font-medium truncate pr-6">{item.text.slice(0, 30)}...</p>
                  <p className="text-muted-foreground mt-0.5">
                    {item.stats.tokens.toLocaleString()} tokens
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFromHistory(item.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Editor Panel */}
      <div className="flex-1 h-full flex flex-col min-w-0 overflow-hidden">
        <div className="h-10 px-4 border-b bg-muted/30 flex items-center justify-between shrink-0">
          <span className="text-sm font-medium text-muted-foreground">{t("tokenizer.inputText")}</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Highlighter className="h-3.5 w-3.5 text-muted-foreground" />
              <Label htmlFor="highlight-toggle" className="text-xs text-muted-foreground cursor-pointer">
                {t("tokenizer.highlightTokens")}
              </Label>
              <Switch
                id="highlight-toggle"
                checked={highlightTokens}
                onCheckedChange={setHighlightTokens}
                className="scale-75"
              />
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearText}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 min-h-0 overflow-hidden">
          <Editor
            height="100%"
            language="markdown"
            value={text}
            onChange={(value) => setText(value ?? "")}
            onMount={handleEditorMount}
            theme={theme === "dark" ? "vs-dark" : "light"}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: "on",
              wordWrap: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 8, bottom: 8 },
              renderLineHighlight: "none",
              placeholder: t("tokenizer.placeholder"),
            }}
          />
        </div>

        <div className="h-10 px-4 border-t bg-background flex items-center justify-between shrink-0">
          <div className="text-xs text-muted-foreground">
            {text.length.toLocaleString()} characters
          </div>
          <Button
            onClick={addToHistory}
            disabled={!text.trim()}
            size="sm"
            variant="outline"
            className="h-7 gap-1.5"
          >
            <HardDrive className="h-3.5 w-3.5" />
            {t("tokenizer.saveToHistory")}
          </Button>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="w-80 h-full flex flex-col border-l bg-muted/20 shrink-0 overflow-hidden">
        <div className="h-10 px-4 border-b bg-muted/30 flex items-center justify-between shrink-0">
          <span className="text-sm font-medium text-muted-foreground">{t("tokenizer.analysis")}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-6 w-6"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Token Count - Primary */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Hash className="h-3.5 w-3.5" />
                {t("tokenizer.tokens")}
              </div>
              <div className="text-3xl font-bold tabular-nums">
                {stats.tokens.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                ≈ {(stats.characters / stats.tokens || 0).toFixed(1)} chars/token
              </div>
            </div>

            {/* Settings */}
            <div className="p-3 rounded-lg border bg-background space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium">
                <Settings2 className="h-3.5 w-3.5" />
                {t("tokenizer.settings")}
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-[10px] text-muted-foreground">{t("tokenizer.contextWindowSize")}</Label>
                <Input
                  type="number"
                  value={contextWindow}
                  onChange={(e) => setContextWindow(Math.max(1, parseInt(e.target.value) || 0))}
                  className="h-7 text-xs"
                  min={1}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-muted-foreground">{t("tokenizer.inputPricePerMillion")}</Label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={inputPrice}
                      onChange={(e) => setInputPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="h-7 text-xs pl-5"
                      min={0}
                      step={0.01}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-muted-foreground">{t("tokenizer.outputPricePerMillion")}</Label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={outputPrice}
                      onChange={(e) => setOutputPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="h-7 text-xs pl-5"
                      min={0}
                      step={0.01}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Context Window Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("tokenizer.contextUsage")}</span>
                <span className={cn(
                  "font-medium",
                  contextUsage > 90 && "text-red-500",
                  contextUsage > 75 && contextUsage <= 90 && "text-yellow-500"
                )}>
                  {contextUsage.toFixed(2)}%
                </span>
              </div>
              <Progress 
                value={Math.min(contextUsage, 100)} 
                className={cn(
                  "h-2",
                  contextUsage > 90 && "[&>div]:bg-red-500",
                  contextUsage > 75 && contextUsage <= 90 && "[&>div]:bg-yellow-500"
                )}
              />
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{formatNumber(stats.tokens)}</span>
                <span>{formatNumber(contextWindow)}</span>
              </div>
              {contextUsage > 90 && (
                <div className="flex items-center gap-1.5 text-xs text-red-500 mt-1">
                  <AlertTriangle className="h-3 w-3" />
                  {t("tokenizer.nearLimit")}
                </div>
              )}
            </div>

            {/* Cost Estimation */}
            <div className="p-3 rounded-lg border bg-background">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <DollarSign className="h-3.5 w-3.5" />
                {t("tokenizer.estimatedCost")}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-lg font-semibold tabular-nums">
                    {formatPrice(estimatedInputCost)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">Input</div>
                </div>
                <div>
                  <div className="text-lg font-semibold tabular-nums">
                    {formatPrice(estimatedOutputCost)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">Output (if same)</div>
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground mt-2 pt-2 border-t">
                ${inputPrice}/1M in • ${outputPrice}/1M out
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("tokenizer.textStats")}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded border bg-background">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Type className="h-3 w-3" />
                    Characters
                  </div>
                  <div className="text-sm font-medium tabular-nums">
                    {stats.characters.toLocaleString()}
                  </div>
                </div>
                <div className="p-2 rounded border bg-background">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    Words
                  </div>
                  <div className="text-sm font-medium tabular-nums">
                    {stats.words.toLocaleString()}
                  </div>
                </div>
                <div className="p-2 rounded border bg-background">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Zap className="h-3 w-3" />
                    Lines
                  </div>
                  <div className="text-sm font-medium tabular-nums">
                    {stats.lines.toLocaleString()}
                  </div>
                </div>
                <div className="p-2 rounded border bg-background">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    Sentences
                  </div>
                  <div className="text-sm font-medium tabular-nums">
                    {stats.sentences.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Note */}
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {t("tokenizer.estimationNote")}
            </p>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
