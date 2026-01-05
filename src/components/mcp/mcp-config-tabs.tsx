"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { analyticsMcp } from "@/lib/analytics";

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
  /** Show official prompts.chat branding (VS Code buttons, registry mention) */
  showOfficialBranding?: boolean;
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

function buildLocalEnv(apiKey?: string | null, queryParams?: string): Record<string, string> | undefined {
  const env: Record<string, string> = {};
  if (apiKey) env.PROMPTS_API_KEY = apiKey;
  if (queryParams) env.PROMPTS_QUERY = queryParams;
  return Object.keys(env).length > 0 ? env : undefined;
}

function getConfig(client: Client, mode: Mode, mcpUrl: string, apiKey?: string | null, queryParams?: string): string {
  const packageName = NPM_PACKAGE;
  const localEnv = buildLocalEnv(apiKey, queryParams);
  
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
              ...(localEnv && { env: localEnv }),
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
        const envPrefix = localEnv 
          ? Object.entries(localEnv).map(([k, v]) => `${k}="${v}"`).join(" ") + " "
          : "";
        return `${envPrefix}claude mcp add prompts.chat -- npx -y ${packageName}`;
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
                ...(localEnv && { env: localEnv }),
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
        let config = `[mcp_servers.prompts_chat]
command = "npx"
args = ["-y", "${packageName}"]`;
        if (localEnv) {
          config += "\n\n[mcp_servers.prompts_chat.env]";
          for (const [key, value] of Object.entries(localEnv)) {
            config += `\n${key} = "${value}"`;
          }
        }
        return config;
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
              ...(localEnv && { env: localEnv }),
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
        const envPrefix = localEnv 
          ? Object.entries(localEnv).map(([k, v]) => `${k}="${v}"`).join(" ") + " "
          : "";
        return `${envPrefix}gemini mcp add prompts.chat -- npx -y ${packageName}`;
      }

    default:
      return "";
  }
}

export function McpConfigTabs({ baseUrl, queryParams, className, mode, onModeChange, hideModeToggle, apiKey, showOfficialBranding = false }: McpConfigTabsProps) {
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
  const config = getConfig(selectedClient, selectedMode, mcpUrl, apiKey, queryParams);
  
  // Display config: show full key if revealed, otherwise show placeholder (queryParams always visible)
  const displayApiKey = apiKey 
    ? (showApiKey ? apiKey : "<click to reveal>")
    : null;
  const displayConfig = getConfig(selectedClient, selectedMode, mcpUrl, displayApiKey, queryParams);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(config);
    analyticsMcp.copyCommand(`${selectedClient}-${selectedMode}`);
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
          className={cn(
            "bg-muted rounded-md p-2 font-mono text-[11px] overflow-x-auto text-left",
            showOfficialBranding && (selectedClient === "vscode" || selectedClient === "cursor") && "max-h-24 overflow-y-auto"
          )}
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

      {/* Cursor Install Button - only for official branding */}
      {showOfficialBranding && selectedClient === "cursor" && (
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] gap-1.5 w-fit"
            onClick={() => {
              const cursorConfig: Record<string, unknown> = {
                command: "npx",
                args: ["-y", NPM_PACKAGE],
              };
              const localEnv = buildLocalEnv(apiKey, queryParams);
              if (localEnv) cursorConfig.env = localEnv;
              const configBase64 = btoa(JSON.stringify(cursorConfig));
              window.open(`cursor://anysphere.cursor-deeplink/mcp/install?name=${encodeURIComponent("prompts.chat")}&config=${configBase64}`, "_self");
            }}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" />
            </svg>
            Cursor
          </Button>
        </div>
      )}

      {/* VS Code Install Buttons - only for official branding */}
      {showOfficialBranding && selectedClient === "vscode" && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[11px] gap-1.5"
              onClick={() => window.open("vscode:mcp/by-name/io.github.f/prompts.chat-mcp", "_self")}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="#007ACC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              VS Code
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[11px] gap-1.5"
              onClick={() => window.open("vscode-insiders:mcp/by-name/io.github.f/prompts.chat-mcp", "_self")}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="#24bfa5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              Insiders
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            prompts.chat is in the official{" "}
            <a
              href="https://github.com/mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              GitHub MCP Registry
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
