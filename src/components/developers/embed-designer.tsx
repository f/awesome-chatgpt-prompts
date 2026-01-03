"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check, Code2, ExternalLink, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { EMBED_EXAMPLES } from "./embed-examples";

interface EmbedConfig {
  prompt: string;
  context: string;
  model: string;
  mode: string;
  thinking: boolean;
  reasoning: boolean;
  planning: boolean;
  fast: boolean;
  max: boolean;
  lightColor: string;
  darkColor: string;
  height: number;
  themeMode: "auto" | "light" | "dark";
  filetree: string;
  showFiletree: boolean;
  showDiff: boolean;
  diffFilename: string;
  diffOldText: string;
  diffNewText: string;
  flashButton: string;
  mcpTools: string;
  showMcpTools: boolean;
}

const MODELS = [
  { value: "GPT-5", label: "GPT-5" },
  { value: "GPT-4o", label: "GPT-4o" },
  { value: "o3", label: "o3" },
  { value: "o4-mini", label: "o4-mini" },
  { value: "Claude 4.5 Sonnet", label: "Claude 4.5 Sonnet" },
  { value: "Claude 4 Opus", label: "Claude 4 Opus" },
  { value: "Gemini 3", label: "Gemini 3" },
  { value: "Gemini 2.5 Pro", label: "Gemini 2.5 Pro" },
  { value: "Grok 4", label: "Grok 4" },
  { value: "DeepSeek R2", label: "DeepSeek R2" },
  { value: "Llama 4", label: "Llama 4" },
  { value: "custom", label: "Custom..." },
];

const COLOR_PRESETS = [
  { name: "Blue", light: "#3b82f6", dark: "#60a5fa" },
  { name: "Green", light: "#10b981", dark: "#34d399" },
  { name: "Orange", light: "#f97316", dark: "#fb923c" },
  { name: "Purple", light: "#8b5cf6", dark: "#a78bfa" },
  { name: "Pink", light: "#ec4899", dark: "#f472b6" },
  { name: "Red", light: "#ef4444", dark: "#f87171" },
];

const STORAGE_KEY = "embedDesignerConfig";

const defaultConfig: EmbedConfig = {
  prompt: "Hello! This is a sample prompt to show how the embed preview works.",
  context: "@assistant, #example",
  model: "GPT-5",
  mode: "chat",
  thinking: false,
  reasoning: false,
  planning: false,
  fast: false,
  max: false,
  lightColor: "#3b82f6",
  darkColor: "#60a5fa",
  height: 400,
  themeMode: "auto",
  filetree: "",
  showFiletree: false,
  showDiff: false,
  diffFilename: "",
  diffOldText: "",
  diffNewText: "",
  flashButton: "none",
  mcpTools: "",
  showMcpTools: false,
};

export function EmbedDesigner() {
  const t = useTranslations("developers");
  const [config, setConfig] = useState<EmbedConfig>(defaultConfig);
  const [customModel, setCustomModel] = useState("");
  const [copied, setCopied] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig({ ...defaultConfig, ...parsed });
        if (!MODELS.find(m => m.value === parsed.model)) {
          setCustomModel(parsed.model);
        }
      } catch (e) {
        console.error("Error loading saved config:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const updateConfig = useCallback((updates: Partial<EmbedConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const generatePreviewURL = useCallback(() => {
    const params = new URLSearchParams();
    if (config.prompt) params.set("prompt", config.prompt);
    if (config.context) params.set("context", config.context);
    if (config.model !== "GPT 4o") params.set("model", config.model === "custom" ? customModel : config.model);
    if (config.mode !== "chat") params.set("mode", config.mode);
    if (config.thinking) params.set("thinking", "true");
    if (config.reasoning) params.set("reasoning", "true");
    if (config.planning) params.set("planning", "true");
    if (config.fast) params.set("fast", "true");
    if (config.max) params.set("max", "true");
    params.set("lightColor", config.lightColor);
    params.set("darkColor", config.darkColor);
    params.set("themeMode", config.themeMode);
    if (config.showFiletree && config.filetree) params.set("filetree", config.filetree);
    if (config.showDiff) {
      params.set("showDiff", "true");
      if (config.diffFilename) params.set("diffFilename", config.diffFilename);
      if (config.flashButton !== "none") params.set("flashButton", config.flashButton);
      if (config.diffOldText) params.set("diffOldText", config.diffOldText.substring(0, 150));
      if (config.diffNewText) params.set("diffNewText", config.diffNewText.substring(0, 150));
    }
    if (config.showMcpTools && config.mcpTools) params.set("mcpTools", config.mcpTools);
    return `/embed?${params.toString()}`;
  }, [config, customModel]);

  const generateEmbedCode = useCallback(() => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}${generatePreviewURL()}`;
    return `<iframe 
  src="${url}"
  width="100%" 
  height="${config.height}"
  frameborder="0"
  style="border-radius: 12px; border: 1px solid #e5e7eb;">
</iframe>`;
  }, [config.height, generatePreviewURL]);

  const handleCopyEmbed = async () => {
    await navigator.clipboard.writeText(generateEmbedCode());
    setCopied(true);
    toast.success(t("embedCopied"));
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = (exampleValue: string) => {
    const example = EMBED_EXAMPLES.find(e => e.value === exampleValue);
    if (example) {
      updateConfig({
        ...defaultConfig,
        ...example.config,
      });
      setPreviewKey(prev => prev + 1);
      toast.success(`${example.label} loaded!`);
    }
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
    setCustomModel("");
    localStorage.removeItem(STORAGE_KEY);
    setPreviewKey(prev => prev + 1);
    toast.success(t("settingsCleared"));
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left Panel - Settings */}
      <div className="w-80 h-full flex flex-col border-r bg-muted/20 shrink-0 overflow-hidden">
        <div className="h-10 px-4 border-b bg-muted/30 flex items-center justify-between shrink-0">
          <span className="text-sm font-medium text-muted-foreground">{t("embedSettings")}</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={resetConfig} title={t("reset")}>
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-4">
            {/* Load Example */}
            <div className="space-y-1.5">
              <Label className="text-xs">{t("loadExample")}</Label>
              <Select onValueChange={loadExample}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder={t("chooseExample")} />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(new Set(EMBED_EXAMPLES.map(ex => ex.category))).map(category => (
                    <SelectGroup key={category}>
                      <SelectLabel className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{category}</SelectLabel>
                      {EMBED_EXAMPLES.filter(ex => ex.category === category).map(ex => (
                        <SelectItem key={ex.value} value={ex.value} className="text-xs">
                          {ex.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prompt Section */}
            <div className="space-y-3 pt-2 border-t">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prompt</h3>
              
              <div className="space-y-1.5">
                <Label className="text-xs">Context</Label>
                <Input
                  value={config.context}
                  onChange={e => updateConfig({ context: e.target.value })}
                  placeholder="file.py, @web, @codebase, #image"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Prompt Text</Label>
                <Textarea
                  value={config.prompt}
                  onChange={e => updateConfig({ prompt: e.target.value })}
                  placeholder="Enter your prompt..."
                  className="min-h-[100px] text-xs resize-none"
                />
              </div>
            </div>

            {/* AI Settings */}
            <div className="space-y-3 pt-2 border-t">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Settings</h3>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Model</Label>
                  <Select 
                    value={MODELS.find(m => m.value === config.model) ? config.model : "custom"} 
                    onValueChange={v => updateConfig({ model: v })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MODELS.map(m => (
                        <SelectItem key={m.value} value={m.value} className="text-xs">
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Mode</Label>
                  <Select value={config.mode} onValueChange={v => updateConfig({ mode: v })}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chat" className="text-xs">Chat</SelectItem>
                      <SelectItem value="code" className="text-xs">Code</SelectItem>
                      <SelectItem value="ask" className="text-xs">Ask</SelectItem>
                      <SelectItem value="plan" className="text-xs">Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {config.model === "custom" && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Custom Model</Label>
                  <Input
                    value={customModel}
                    onChange={e => setCustomModel(e.target.value)}
                    placeholder="Enter model name"
                    className="h-8 text-xs"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label className="text-xs">Thinking</Label>
                <Switch checked={config.thinking} onCheckedChange={v => updateConfig({ thinking: v })} />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Reasoning</Label>
                <Switch checked={config.reasoning} onCheckedChange={v => updateConfig({ reasoning: v })} />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Planning</Label>
                <Switch checked={config.planning} onCheckedChange={v => updateConfig({ planning: v })} />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Fast</Label>
                <Switch checked={config.fast} onCheckedChange={v => updateConfig({ fast: v })} />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Max</Label>
                <Switch checked={config.max} onCheckedChange={v => updateConfig({ max: v })} />
              </div>
            </div>

            {/* File Tree */}
            <div className="space-y-3 pt-2 border-t">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">File Tree</h3>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs">Show File Tree</Label>
                <Switch checked={config.showFiletree} onCheckedChange={v => updateConfig({ showFiletree: v })} />
              </div>

              {config.showFiletree && (
                <Textarea
                  value={config.filetree}
                  onChange={e => updateConfig({ filetree: e.target.value })}
                  placeholder={`src/\nsrc/components/\nsrc/components/Button.tsx`}
                  className="min-h-[80px] text-xs font-mono resize-none"
                />
              )}
            </div>

            {/* Diff View */}
            <div className="space-y-3 pt-2 border-t">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Diff View</h3>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs">Show Diff</Label>
                <Switch checked={config.showDiff} onCheckedChange={v => updateConfig({ showDiff: v })} />
              </div>

              {config.showDiff && (
                <>
                  <Input
                    value={config.diffFilename}
                    onChange={e => updateConfig({ diffFilename: e.target.value })}
                    placeholder="Filename"
                    className="h-8 text-xs"
                  />
                  <Textarea
                    value={config.diffOldText}
                    onChange={e => updateConfig({ diffOldText: e.target.value })}
                    placeholder="Old code..."
                    className="min-h-[60px] text-xs font-mono resize-none bg-red-50 dark:bg-red-950/20"
                  />
                  <Textarea
                    value={config.diffNewText}
                    onChange={e => updateConfig({ diffNewText: e.target.value })}
                    placeholder="New code..."
                    className="min-h-[60px] text-xs font-mono resize-none bg-green-50 dark:bg-green-950/20"
                  />
                  <div className="space-y-1.5">
                    <Label className="text-xs">Flash Button</Label>
                    <Select value={config.flashButton} onValueChange={v => updateConfig({ flashButton: v })}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="text-xs">None</SelectItem>
                        <SelectItem value="accept" className="text-xs">Accept</SelectItem>
                        <SelectItem value="reject" className="text-xs">Reject</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>

            {/* MCP Tools */}
            <div className="space-y-3 pt-2 border-t">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">MCP Tools</h3>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs">Show MCP Tools</Label>
                <Switch checked={config.showMcpTools} onCheckedChange={v => updateConfig({ showMcpTools: v })} />
              </div>

              {config.showMcpTools && (
                <Textarea
                  value={config.mcpTools}
                  onChange={e => updateConfig({ mcpTools: e.target.value })}
                  placeholder={`github:create_issue\ngithub:search_code\nfilesystem:read_file`}
                  className="min-h-[80px] text-xs font-mono resize-none"
                />
              )}
            </div>

            {/* Appearance */}
            <div className="space-y-3 pt-2 border-t">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Appearance</h3>
              
              <div className="space-y-1.5">
                <Label className="text-xs">Theme</Label>
                <div className="flex gap-1">
                  {(["auto", "light", "dark"] as const).map(mode => (
                    <Button
                      key={mode}
                      variant={config.themeMode === mode ? "default" : "outline"}
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={() => { updateConfig({ themeMode: mode }); setPreviewKey(k => k + 1); }}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Color Presets</Label>
                <div className="flex gap-1 flex-wrap">
                  {COLOR_PRESETS.map(preset => (
                    <button
                      key={preset.name}
                      className="w-6 h-6 rounded-full border-2 border-transparent hover:border-foreground/50 transition-colors"
                      style={{ backgroundColor: preset.light }}
                      onClick={() => { updateConfig({ lightColor: preset.light, darkColor: preset.dark }); setPreviewKey(k => k + 1); }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Light Color</Label>
                  <div className="flex gap-1">
                    <input
                      type="color"
                      value={config.lightColor}
                      onChange={e => { updateConfig({ lightColor: e.target.value }); setPreviewKey(k => k + 1); }}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <Input
                      value={config.lightColor}
                      onChange={e => updateConfig({ lightColor: e.target.value })}
                      onBlur={() => setPreviewKey(k => k + 1)}
                      className="h-8 text-xs flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Dark Color</Label>
                  <div className="flex gap-1">
                    <input
                      type="color"
                      value={config.darkColor}
                      onChange={e => { updateConfig({ darkColor: e.target.value }); setPreviewKey(k => k + 1); }}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <Input
                      value={config.darkColor}
                      onChange={e => updateConfig({ darkColor: e.target.value })}
                      onBlur={() => setPreviewKey(k => k + 1)}
                      className="h-8 text-xs flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <Label className="text-xs">Height</Label>
                  <span className="text-xs text-muted-foreground">{config.height}px</span>
                </div>
                <input
                  type="range"
                  value={config.height}
                  onChange={e => updateConfig({ height: parseInt(e.target.value) })}
                  min={200}
                  max={800}
                  step={10}
                  className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Preview & Code */}
      <div className="flex-1 h-full flex flex-col min-w-0 overflow-hidden">
        <div className="h-10 px-4 border-b bg-muted/30 flex items-center justify-between shrink-0">
          <span className="text-sm font-medium text-muted-foreground">{t("preview")}</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" asChild>
              <a href={generatePreviewURL()} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
                {t("openInNewTab")}
              </a>
            </Button>
            <Button variant="default" size="sm" className="h-7 gap-1.5 text-xs" onClick={handleCopyEmbed}>
              {copied ? <Check className="h-3 w-3" /> : <Code2 className="h-3 w-3" />}
              {t("copyEmbedCode")}
            </Button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 min-h-0 p-4 overflow-hidden bg-[repeating-conic-gradient(#80808010_0%_25%,transparent_0%_50%)] dark:bg-[repeating-conic-gradient(#40404020_0%_25%,transparent_0%_50%)] bg-[length:20px_20px] flex items-center justify-center">
          <div 
            className="w-full max-w-[800px] rounded-xl border shadow-lg overflow-hidden bg-background"
            style={{ height: config.height }}
          >
            <iframe
              key={previewKey}
              src={generatePreviewURL()}
              className="w-full h-full border-0"
              title="Embed Preview"
            />
          </div>
        </div>

        {/* Embed Code */}
        <div className="min-h-32 max-h-64 border-t shrink-0 flex flex-col resize-y overflow-hidden">
          <div className="h-8 px-4 border-b bg-muted/30 flex items-center justify-between shrink-0">
            <span className="text-xs font-medium text-muted-foreground">{t("embedCode")}</span>
            <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">HTML</span>
          </div>
          <div className="flex-1 overflow-auto bg-zinc-100 dark:bg-zinc-900">
            <pre className="p-3 text-xs font-mono leading-relaxed whitespace-pre-wrap break-all">
              <code className="text-zinc-700 dark:text-zinc-300">
                <span className="text-pink-600 dark:text-pink-400">&lt;iframe</span>{"\n"}
                {"  "}<span className="text-sky-600 dark:text-sky-400">src</span>=<span className="text-amber-600 dark:text-amber-300">&quot;{typeof window !== "undefined" ? window.location.origin : ""}{generatePreviewURL()}&quot;</span>{"\n"}
                {"  "}<span className="text-sky-600 dark:text-sky-400">width</span>=<span className="text-amber-600 dark:text-amber-300">&quot;100%&quot;</span>{"\n"}
                {"  "}<span className="text-sky-600 dark:text-sky-400">height</span>=<span className="text-amber-600 dark:text-amber-300">&quot;{config.height}&quot;</span>{"\n"}
                {"  "}<span className="text-sky-600 dark:text-sky-400">frameborder</span>=<span className="text-amber-600 dark:text-amber-300">&quot;0&quot;</span>{"\n"}
                {"  "}<span className="text-sky-600 dark:text-sky-400">style</span>=<span className="text-amber-600 dark:text-amber-300">&quot;border-radius: 12px; border: 1px solid #e5e7eb;&quot;</span><span className="text-pink-600 dark:text-pink-400">&gt;</span>{"\n"}
                <span className="text-pink-600 dark:text-pink-400">&lt;/iframe&gt;</span>
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
