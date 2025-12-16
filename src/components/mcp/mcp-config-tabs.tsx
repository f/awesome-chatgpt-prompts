"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Client = "cursor" | "claude-code" | "vscode" | "codex" | "windsurf" | "gemini";
type Mode = "remote" | "local";

interface McpConfigTabsProps {
  baseUrl?: string;
  /** URL parameters to append (e.g., users, categories, tags) */
  queryParams?: string;
  className?: string;
  /** External mode control */
  mode?: "remote" | "local";
  onModeChange?: (mode: "remote" | "local") => void;
  /** Hide the mode toggle (when controlled externally) */
  hideModeToggle?: boolean;
  /** API key for authenticated access */
  apiKey?: string | null;
}

const CLIENT_LABELS: Record<Client, string> = {
  cursor: "Cursor",
  "claude-code": "Claude",
  vscode: "VS Code",
  codex: "Codex",
  windsurf: "Windsurf",
  gemini: "Gemini",
};

const NPM_PACKAGE = "@fkadev/prompts.chat-mcp";

function getConfig(client: Client, mode: Mode, mcpUrl: string, apiKey?: string | null): string {
  const packageName = NPM_PACKAGE;
  
  switch (client) {
    case "cursor":
      if (mode === "remote") {
        const config: Record<string, unknown> = {
          mcpServers: {
            "prompts.chat": {
              url: mcpUrl,
              ...(apiKey && { headers: { "PROMPTS_API_KEY": apiKey } }),
            },
          },
        };
        return JSON.stringify(config, null, 2);
      } else {
        const config: Record<string, unknown> = {
          mcpServers: {
            "prompts.chat": {
              command: "npx",
              args: ["-y", packageName],
              ...(apiKey && { env: { "PROMPTS_API_KEY": apiKey } }),
            },
          },
        };
        return JSON.stringify(config, null, 2);
      }

    case "claude-code":
      if (mode === "remote") {
        if (apiKey) {
          return `claude mcp add --transport http prompts.chat ${mcpUrl} --header "PROMPTS_API_KEY: ${apiKey}"`;
        }
        return `claude mcp add --transport http prompts.chat ${mcpUrl}`;
      } else {
        if (apiKey) {
          return `PROMPTS_API_KEY=${apiKey} claude mcp add prompts.chat -- npx -y ${packageName}`;
        }
        return `claude mcp add prompts.chat -- npx -y ${packageName}`;
      }

    case "vscode":
      if (mode === "remote") {
        const config: Record<string, unknown> = {
          mcp: {
            servers: {
              "prompts.chat": {
                type: "http",
                url: mcpUrl,
                ...(apiKey && { headers: { "PROMPTS_API_KEY": apiKey } }),
              },
            },
          },
        };
        return JSON.stringify(config, null, 2);
      } else {
        const config: Record<string, unknown> = {
          mcp: {
            servers: {
              "prompts.chat": {
                type: "stdio",
                command: "npx",
                args: ["-y", packageName],
                ...(apiKey && { env: { "PROMPTS_API_KEY": apiKey } }),
              },
            },
          },
        };
        return JSON.stringify(config, null, 2);
      }

    case "codex":
      if (mode === "remote") {
        if (apiKey) {
          return `[mcp_servers.prompts_chat]
url = "${mcpUrl}"

[mcp_servers.prompts_chat.headers]
PROMPTS_API_KEY = "${apiKey}"`;
        }
        return `[mcp_servers.prompts_chat]
url = "${mcpUrl}"`;
      } else {
        if (apiKey) {
          return `[mcp_servers.prompts_chat]
command = "npx"
args = ["-y", "${packageName}"]

[mcp_servers.prompts_chat.env]
PROMPTS_API_KEY = "${apiKey}"`;
        }
        return `[mcp_servers.prompts_chat]
command = "npx"
args = ["-y", "${packageName}"]`;
      }

    case "windsurf":
      if (mode === "remote") {
        const config: Record<string, unknown> = {
          mcpServers: {
            "prompts.chat": {
              serverUrl: mcpUrl,
              ...(apiKey && { headers: { "PROMPTS_API_KEY": apiKey } }),
            },
          },
        };
        return JSON.stringify(config, null, 2);
      } else {
        const config: Record<string, unknown> = {
          mcpServers: {
            "prompts.chat": {
              command: "npx",
              args: ["-y", packageName],
              ...(apiKey && { env: { "PROMPTS_API_KEY": apiKey } }),
            },
          },
        };
        return JSON.stringify(config, null, 2);
      }

    case "gemini":
      if (mode === "remote") {
        if (apiKey) {
          return `PROMPTS_API_KEY=${apiKey} gemini mcp add prompts.chat --transport sse ${mcpUrl}`;
        }
        return `gemini mcp add prompts.chat --transport sse ${mcpUrl}`;
      } else {
        if (apiKey) {
          return `PROMPTS_API_KEY=${apiKey} gemini mcp add prompts.chat -- npx -y ${packageName}`;
        }
        return `gemini mcp add prompts.chat -- npx -y ${packageName}`;
      }

    default:
      return "";
  }
}

export function McpConfigTabs({ baseUrl, queryParams, className, mode, onModeChange, hideModeToggle, apiKey }: McpConfigTabsProps) {
  const [selectedClient, setSelectedClient] = useState<Client>("vscode");
  const [internalMode, setInternalMode] = useState<Mode>("remote");
  const [copied, setCopied] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  
  const selectedMode = mode ?? internalMode;
  const handleModeChange = (newMode: Mode) => {
    if (onModeChange) {
      onModeChange(newMode);
    } else {
      setInternalMode(newMode);
    }
  };

  const base = baseUrl || (typeof window !== "undefined" ? window.location.origin : "https://prompts.chat");
  const mcpUrl = queryParams ? `${base}/api/mcp?${queryParams}` : `${base}/api/mcp`;
  
  // Full config with actual API key (for copying)
  const config = getConfig(selectedClient, selectedMode, mcpUrl, apiKey);
  
  // Display config: show full key if revealed, otherwise show placeholder
  const displayApiKey = apiKey 
    ? (showApiKey ? apiKey : "<click to reveal>")
    : null;
  const displayConfig = getConfig(selectedClient, selectedMode, mcpUrl, displayApiKey);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(config);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clients: Client[] = ["vscode", "windsurf", "cursor", "claude-code", "codex", "gemini"];

  return (
    <div className={cn("space-y-2", className)}>
      {/* Client Tabs */}
      <div className="flex gap-0.5 overflow-x-auto">
        {clients.map((client) => (
          <button
            key={client}
            onClick={() => setSelectedClient(client)}
            className={cn(
              "px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap",
              selectedClient === client
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {CLIENT_LABELS[client]}
          </button>
        ))}
      </div>

      {/* Mode Toggle - only show if not hidden */}
      {!hideModeToggle && (
        <div className="flex gap-0.5">
          <button
            onClick={() => handleModeChange("remote")}
            className={cn(
              "px-2 py-1 text-[11px] font-medium rounded transition-colors",
              selectedMode === "remote"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Remote
          </button>
          <button
            onClick={() => handleModeChange("local")}
            className={cn(
              "px-2 py-1 text-[11px] font-medium rounded transition-colors",
              selectedMode === "local"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Local
          </button>
        </div>
      )}

      {/* Config Display */}
      <div className="relative">
        <div 
          dir="ltr" 
          className="bg-muted rounded-md p-2 font-mono text-[11px] overflow-x-auto text-left"
        >
          <pre className="whitespace-pre">
            {apiKey && !showApiKey ? (
              <>
                {displayConfig.split("<click to reveal>").map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span 
                        onClick={() => setShowApiKey(true)}
                        className="text-primary underline cursor-pointer hover:text-primary/80"
                      >
                        {"<click to reveal>"}
                      </span>
                    )}
                  </span>
                ))}
              </>
            ) : (
              displayConfig
            )}
          </pre>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-1 right-1 h-6 w-6 p-0"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
    </div>
  );
}
