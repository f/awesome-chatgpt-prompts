"use client";

import { Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
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
  subOptions?: { name: string; baseUrl: string }[];
}

const platforms: Platform[] = [
  { id: "chatgpt", name: "ChatGPT", baseUrl: "https://chat.openai.com" },
  { id: "claude", name: "Claude", baseUrl: "https://claude.ai/new" },
  { id: "gemini", name: "Gemini", baseUrl: "https://gemini.google.com" },
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
  { id: "llama", name: "Meta AI", baseUrl: "https://meta.ai" },
  { id: "mistral", name: "Mistral", baseUrl: "https://chat.mistral.ai/chat" },
  { id: "perplexity", name: "Perplexity", baseUrl: "https://perplexity.ai" },
];

function buildUrl(platformId: string, baseUrl: string, promptText: string): string {
  const encoded = encodeURIComponent(promptText);
  
  switch (platformId) {
    case "github-copilot":
      return `${baseUrl}?prompt=${encoded}`;
    case "chatgpt":
      return `${baseUrl}?prompt=${encoded}`;
    case "grok":
      return `${baseUrl}&q=${encoded}`;
    case "claude":
      return `${baseUrl}?q=${encoded}`;
    case "perplexity":
      return `${baseUrl}/search?q=${encoded}`;
    case "mistral":
      return `${baseUrl}?q=${encoded}`;
    default:
      return `${baseUrl}?prompt=${encoded}`;
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

  const handleRun = (platformId: string, baseUrl: string) => {
    const url = buildUrl(platformId, baseUrl, content);
    window.open(url, "_blank");
  };

  return (
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
              <DropdownMenuSubTrigger>{platform.name}</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {platform.subOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.baseUrl}
                    onClick={() => handleRun(platform.id, option.baseUrl)}
                  >
                    {option.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ) : (
            <DropdownMenuItem
              key={platform.id}
              onClick={() => handleRun(platform.id, platform.baseUrl)}
            >
              {platform.name}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
