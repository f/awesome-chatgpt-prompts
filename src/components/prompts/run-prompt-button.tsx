"use client";

import { useState, useCallback } from "react";
import { Play, ExternalLink, Zap, Clipboard } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { analyticsPrompt } from "@/lib/analytics";
import { useIsMobile } from "@/hooks/use-mobile";

interface Platform {
  id: string;
  name: string;
  baseUrl: string;
  supportsQuerystring?: boolean;
  isDeeplink?: boolean;
  subOptions?: { name: string; baseUrl: string }[];
}

// Featured IDE platforms with deeplinks (shown on top)
const idePlatforms: Platform[] = [
  { id: "windsurf", name: "Windsurf", baseUrl: "windsurf://", isDeeplink: true, supportsQuerystring: false },
  { id: "vscode", name: "VS Code", baseUrl: "vscode://", isDeeplink: true, supportsQuerystring: false },
  { id: "vscode-insiders", name: "VS Code Insiders", baseUrl: "vscode-insiders://", isDeeplink: true, supportsQuerystring: false },
  { id: "cursor", name: "Cursor", baseUrl: "cursor://anysphere.cursor-deeplink/prompt", isDeeplink: true },
];

// Web-based AI platforms
const platforms: Platform[] = [
  { id: "ai2sql", name: "AI2SQL", baseUrl: "https://builder.ai2sql.io/dashboard/builder-all-lp?tab=generate" },
  { id: "bolt", name: "Bolt", baseUrl: "https://bolt.new" },
  { id: "chatgpt", name: "ChatGPT", baseUrl: "https://chatgpt.com" },
  { id: "claude", name: "Claude", baseUrl: "https://claude.ai/new" },
  { id: "copilot", name: "Copilot", baseUrl: "https://copilot.microsoft.com", supportsQuerystring: false },
  { id: "deepseek", name: "DeepSeek", baseUrl: "https://chat.deepseek.com", supportsQuerystring: false },
  { id: "fal", name: "fal Sandbox", baseUrl: "https://fal.ai/sandbox" },
  { id: "gemini", name: "Gemini", baseUrl: "https://gemini.google.com/app", supportsQuerystring: false },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    baseUrl: "https://github.com/copilot",
    subOptions: [
      { name: "Copilot Chat", baseUrl: "https://github.com/copilot" },
      { name: "Copilot Agents", baseUrl: "https://github.com/copilot/agents" },
    ],
  },
  {
    id: "grok",
    name: "Grok",
    baseUrl: "https://grok.com/chat?reasoningMode=none",
    subOptions: [
      { name: "Grok", baseUrl: "https://grok.com/chat?reasoningMode=none" },
      { name: "Grok Deep Search", baseUrl: "https://grok.com/chat?reasoningMode=deepsearch" },
      { name: "Grok Think", baseUrl: "https://grok.com/chat?reasoningMode=think" },
    ],
  },
  { id: "huggingface", name: "HuggingChat", baseUrl: "https://huggingface.co/chat" },
  { id: "lovable", name: "Lovable", baseUrl: "https://lovable.dev" },
  { id: "llama", name: "Meta AI", baseUrl: "https://www.meta.ai" },
  { id: "mistral", name: "Le Chat", baseUrl: "https://chat.mistral.ai/chat" },
  { id: "perplexity", name: "Perplexity", baseUrl: "https://www.perplexity.ai" },
  { id: "phind", name: "Phind", baseUrl: "https://www.phind.com" },
  { id: "pi", name: "Pi", baseUrl: "https://pi.ai", supportsQuerystring: false },
  { id: "poe", name: "Poe", baseUrl: "https://poe.com", supportsQuerystring: false },
  { id: "v0", name: "v0", baseUrl: "https://v0.dev/chat" },
  { id: "you", name: "You.com", baseUrl: "https://you.com" },
];

function buildUrl(platformId: string, baseUrl: string, promptText: string): string {
  const encoded = encodeURIComponent(promptText);
  
  switch (platformId) {
    // IDE deeplinks
    case "cursor":
      return `${baseUrl}?text=${encoded}`;
    // Web platforms
    case "ai2sql":
      return `${baseUrl}&prompt=${encoded}`;
    case "bolt":
      return `${baseUrl}?prompt=${encoded}`;
    case "chatgpt":
      return `${baseUrl}/?q=${encoded}`;
    case "claude":
      return `${baseUrl}?q=${encoded}`;
    case "copilot":
      return `${baseUrl}/?q=${encoded}`;
    case "deepseek":
      return `${baseUrl}/?q=${encoded}`;
    case "github-copilot":
      return `${baseUrl}?prompt=${encoded}`;
    case "grok":
      return `${baseUrl}&q=${encoded}`;
    case "fal":
      return `${baseUrl}?prompt=${encoded}`;
    case "huggingface":
      return `${baseUrl}/?prompt=${encoded}`;
    case "lovable":
      return `${baseUrl}/?autosubmit=true#prompt=${encoded}`;
    case "mistral":
      return `${baseUrl}?q=${encoded}`;
    case "perplexity":
      return `${baseUrl}/search?q=${encoded}`;
    case "phind":
      return `${baseUrl}/search?q=${encoded}`;
    case "poe":
      return `${baseUrl}/?q=${encoded}`;
    case "v0":
      return `${baseUrl}?q=${encoded}`;
    case "you":
      return `${baseUrl}/search?q=${encoded}`;
    default:
      return `${baseUrl}?q=${encoded}`;
  }
}

interface UnfilledVariable {
  name: string;
  defaultValue: string;
}

interface RunPromptButtonProps {
  content: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "icon";
  className?: string;
  unfilledVariables?: UnfilledVariable[];
  onVariablesFilled?: (values: Record<string, string>) => void;
  getContentWithVariables?: (values: Record<string, string>) => string;
  promptId?: string;
}

export function RunPromptButton({ 
  content, 
  variant = "outline", 
  size = "sm",
  className,
  unfilledVariables = [],
  onVariablesFilled,
  getContentWithVariables,
  promptId
}: RunPromptButtonProps) {
  const t = useTranslations("prompts");
  const tCommon = useTranslations("common");
  const isMobile = useIsMobile();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [variableDialogOpen, setVariableDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pendingPlatform, setPendingPlatform] = useState<{ id: string; name: string; baseUrl: string; supportsQuerystring?: boolean } | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  // Initialize variable values when dialog opens
  const openVariableDialog = useCallback((platform: Platform, baseUrl: string) => {
    const initial: Record<string, string> = {};
    for (const v of unfilledVariables) {
      initial[v.name] = v.defaultValue;
    }
    setVariableValues(initial);
    setPendingPlatform({ id: platform.id, name: platform.name, baseUrl, supportsQuerystring: platform.supportsQuerystring });
    setVariableDialogOpen(true);
  }, [unfilledVariables]);

  const handleVariableSubmit = useCallback(() => {
    if (onVariablesFilled) {
      onVariablesFilled(variableValues);
    }
    setVariableDialogOpen(false);
    
    if (pendingPlatform) {
      const finalContent = getContentWithVariables 
        ? getContentWithVariables(variableValues) 
        : content;
      
      if (pendingPlatform.supportsQuerystring === false) {
        navigator.clipboard.writeText(finalContent);
        setDialogOpen(true);
      } else {
        const url = buildUrl(pendingPlatform.id, pendingPlatform.baseUrl, finalContent);
        window.open(url, "_blank");
        setPendingPlatform(null);
      }
      analyticsPrompt.run(promptId, pendingPlatform.name);
    }
  }, [variableValues, onVariablesFilled, pendingPlatform, getContentWithVariables, content, promptId]);

  const handleRun = (platform: Platform, baseUrl: string) => {
    // Check if there are unfilled variables (empty values)
    const hasUnfilled = unfilledVariables.some(v => !v.defaultValue || v.defaultValue.trim() === "");
    
    if (hasUnfilled) {
      // Show variable fill dialog first (for both query string and copy flows)
      openVariableDialog(platform, baseUrl);
      return;
    }
    
    if (platform.supportsQuerystring === false) {
      navigator.clipboard.writeText(content);
      setPendingPlatform({ id: platform.id, name: platform.name, baseUrl, supportsQuerystring: platform.supportsQuerystring });
      setDialogOpen(true);
      analyticsPrompt.run(promptId, platform.name);
    } else {
      const url = buildUrl(platform.id, baseUrl, content);
      window.open(url, "_blank");
      analyticsPrompt.run(promptId, platform.name);
    }
  };

  const handleOpenPlatform = () => {
    if (pendingPlatform) {
      window.open(pendingPlatform.baseUrl, "_blank");
      setDialogOpen(false);
      setPendingPlatform(null);
    }
  };

  const handleRunAndClose = (platform: Platform, baseUrl: string) => {
    setSheetOpen(false);
    handleRun(platform, baseUrl);
  };

  // Shared platform list content for mobile sheet
  const platformListContent = (
    <>
      {/* IDE Platforms with deeplinks (featured on top) */}
      {idePlatforms.map((platform) => (
        <button
          key={platform.id}
          onClick={() => handleRunAndClose(platform, platform.baseUrl)}
          className="flex items-center gap-3 font-medium w-full px-3 py-3 text-base hover:bg-accent rounded-md text-left"
        >
          {platform.supportsQuerystring === false ? (
            <Clipboard className="h-4 w-4 text-blue-500" />
          ) : (
            <Zap className="h-4 w-4 text-blue-500" />
          )}
          {platform.name}
        </button>
      ))}
      <div className="h-px bg-border my-2" />
      {/* Web-based AI platforms */}
      {platforms.map((platform) =>
        platform.subOptions ? (
          <div key={platform.id} className="space-y-1">
            <div className="flex items-center gap-3 px-3 py-2 text-base text-muted-foreground">
              <Zap className="h-4 w-4 text-green-500" />
              {platform.name}
            </div>
            <div className="pl-6 space-y-1">
              {platform.subOptions.map((option) => (
                <button
                  key={option.baseUrl}
                  onClick={() => handleRunAndClose(platform, option.baseUrl)}
                  className="flex items-center gap-3 w-full px-3 py-3 text-base hover:bg-accent rounded-md text-left"
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button
            key={platform.id}
            onClick={() => handleRunAndClose(platform, platform.baseUrl)}
            className="flex items-center gap-3 w-full px-3 py-3 text-base hover:bg-accent rounded-md text-left"
          >
            {platform.supportsQuerystring === false ? (
              <Clipboard className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Zap className="h-4 w-4 text-green-500" />
            )}
            {platform.name}
          </button>
        )
      )}
    </>
  );

  return (
    <>
      {/* Mobile: Bottom Sheet */}
      {isMobile ? (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant={variant} size={size} className={className}>
              <Play className="h-4 w-4" />
              {size !== "icon" && <span className="ml-1.5">{t("run")}</span>}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[70vh]">
            <SheetHeader>
              <SheetTitle>{t("run")}</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto flex-1 py-2">
              {platformListContent}
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        /* Desktop: Dropdown */
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={variant} size={size} className={className}>
              <Play className="h-4 w-4" />
              {size !== "icon" && <span className="ml-1.5">{t("run")}</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 max-h-80 overflow-y-auto">
            {/* IDE Platforms with deeplinks (featured on top) */}
            {idePlatforms.map((platform) => (
              <DropdownMenuItem
                key={platform.id}
                onClick={() => handleRun(platform, platform.baseUrl)}
                className="flex items-center gap-2 font-medium"
              >
                {platform.supportsQuerystring === false ? (
                  <Clipboard className="h-3 w-3 text-blue-500" />
                ) : (
                  <Zap className="h-3 w-3 text-blue-500" />
                )}
                {platform.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            {/* Web-based AI platforms */}
            {platforms.map((platform) =>
              platform.subOptions ? (
                <DropdownMenuSub key={platform.id}>
                  <DropdownMenuSubTrigger className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-green-500" />
                    {platform.name}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {platform.subOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.baseUrl}
                        onClick={() => handleRun(platform, option.baseUrl)}
                      >
                        {option.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ) : (
                <DropdownMenuItem
                  key={platform.id}
                  onClick={() => handleRun(platform, platform.baseUrl)}
                  className="flex items-center gap-2"
                >
                  {platform.supportsQuerystring === false ? (
                    <Clipboard className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <Zap className="h-3 w-3 text-green-500" />
                  )}
                  {platform.name}
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("promptCopied")}</DialogTitle>
            <DialogDescription>
              {t("promptCopiedDescription", { platform: pendingPlatform?.name ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleOpenPlatform}>
              <ExternalLink className="h-4 w-4 mr-2" />
              {t("openPlatform", { platform: pendingPlatform?.name ?? "" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Variable Fill Dialog */}
      <Dialog open={variableDialogOpen} onOpenChange={setVariableDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{tCommon("fillVariables")}</DialogTitle>
            <DialogDescription>
              {tCommon("fillVariablesDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {unfilledVariables.map((variable) => (
              <div key={variable.name} className="space-y-2">
                <label htmlFor={`run-var-${variable.name}`} className="text-sm font-medium">
                  {variable.name}
                </label>
                <input
                  id={`run-var-${variable.name}`}
                  type="text"
                  value={variableValues[variable.name] || ""}
                  onChange={(e) => setVariableValues(prev => ({ ...prev, [variable.name]: e.target.value }))}
                  placeholder={variable.defaultValue || variable.name}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVariableDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleVariableSubmit}>
              <Play className="h-4 w-4 mr-2" />
              {t("run")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
