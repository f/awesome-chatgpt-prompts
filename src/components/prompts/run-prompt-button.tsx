"use client";

import { useState } from "react";
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Platform {
  id: string;
  name: string;
  baseUrl: string;
  supportsQuerystring?: boolean;
  subOptions?: { name: string; baseUrl: string }[];
}

const platforms: Platform[] = [
  { id: "chatgpt", name: "ChatGPT", baseUrl: "https://chatgpt.com" },
  { id: "claude", name: "Claude", baseUrl: "https://claude.ai/new" },
  { id: "copilot", name: "Copilot", baseUrl: "https://copilot.microsoft.com", supportsQuerystring: false },
  { id: "deepseek", name: "DeepSeek", baseUrl: "https://chat.deepseek.com", supportsQuerystring: false },
  { id: "fal", name: "fal Sandbox", baseUrl: "https://fal.ai/sandbox" },
  { id: "gemini", name: "Gemini", baseUrl: "https://gemini.google.com/app", supportsQuerystring: false },
  { id: "github-copilot", name: "GitHub Copilot", baseUrl: "https://github.com/copilot" },
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
  { id: "llama", name: "Meta AI", baseUrl: "https://www.meta.ai" },
  { id: "mistral", name: "Le Chat", baseUrl: "https://chat.mistral.ai/chat" },
  { id: "perplexity", name: "Perplexity", baseUrl: "https://www.perplexity.ai" },
  { id: "phind", name: "Phind", baseUrl: "https://www.phind.com" },
  { id: "pi", name: "Pi", baseUrl: "https://pi.ai", supportsQuerystring: false },
  { id: "poe", name: "Poe", baseUrl: "https://poe.com", supportsQuerystring: false },
  { id: "you", name: "You.com", baseUrl: "https://you.com" },
];

function buildUrl(platformId: string, baseUrl: string, promptText: string): string {
  const encoded = encodeURIComponent(promptText);
  
  switch (platformId) {
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
    case "mistral":
      return `${baseUrl}?q=${encoded}`;
    case "perplexity":
      return `${baseUrl}/search?q=${encoded}`;
    case "phind":
      return `${baseUrl}/search?q=${encoded}`;
    case "poe":
      return `${baseUrl}/?q=${encoded}`;
    case "you":
      return `${baseUrl}/search?q=${encoded}`;
    default:
      return `${baseUrl}?q=${encoded}`;
  }
}

interface RunPromptButtonProps {
  content: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "icon";
  className?: string;
}

export function RunPromptButton({ 
  content, 
  variant = "outline", 
  size = "sm",
  className 
}: RunPromptButtonProps) {
  const t = useTranslations("prompts");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingPlatform, setPendingPlatform] = useState<{ name: string; baseUrl: string } | null>(null);

  const handleRun = (platform: Platform, baseUrl: string) => {
    if (platform.supportsQuerystring === false) {
      navigator.clipboard.writeText(content);
      setPendingPlatform({ name: platform.name, baseUrl });
      setDialogOpen(true);
    } else {
      const url = buildUrl(platform.id, baseUrl, content);
      window.open(url, "_blank");
    }
  };

  const handleOpenPlatform = () => {
    if (pendingPlatform) {
      window.open(pendingPlatform.baseUrl, "_blank");
      setDialogOpen(false);
      setPendingPlatform(null);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} className={className}>
            <Play className="h-4 w-4" />
            {size !== "icon" && <span className="ml-1.5">{t("run")}</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
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
    </>
  );
}
