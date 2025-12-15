"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { analyticsMcp } from "@/lib/analytics";

// MCP Logo component
function McpIcon({ className }: { className?: string }) {
  return (
    <img
      src="/mcp.svg"
      alt="MCP"
      className={className}
    />
  );
}

export { McpIcon };

interface McpServerPopupProps {
  /** Pre-filled users (usernames) */
  initialUsers?: string[];
  /** Pre-filled categories (slugs) */
  initialCategories?: string[];
  /** Pre-filled tags (slugs) */
  initialTags?: string[];
  /** Base URL override */
  baseUrl?: string;
}

export function McpServerPopup({
  initialUsers = [],
  initialCategories = [],
  initialTags = [],
  baseUrl,
}: McpServerPopupProps) {
  const t = useTranslations("mcp");
  const [copied, setCopied] = useState(false);
  const [users, setUsers] = useState<string[]>(initialUsers);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [userInput, setUserInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  // Build the MCP URL
  const mcpUrl = useMemo(() => {
    const base = baseUrl || (typeof window !== "undefined" ? window.location.origin : "https://prompts.chat");
    const params = new URLSearchParams();
    
    if (users.length > 0) {
      params.set("users", users.join(","));
    }
    if (categories.length > 0) {
      params.set("categories", categories.join(","));
    }
    if (tags.length > 0) {
      params.set("tags", tags.join(","));
    }

    const queryString = params.toString();
    return `${base}/api/mcp${queryString ? `?${queryString}` : ""}`;
  }, [baseUrl, users, categories, tags]);

  // Generate the JSON config
  const configJson = useMemo(() => {
    return JSON.stringify(
      {
        mcpServers: {
          "prompts-chat": {
            url: mcpUrl,
          },
        },
      },
      null,
      2
    );
  }, [mcpUrl]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(configJson);
    analyticsMcp.copyCommand("config_json");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addUser = () => {
    const value = userInput.trim().replace(/^@/, "");
    if (value && !users.includes(value)) {
      setUsers([...users, value]);
      setUserInput("");
    }
  };

  const addCategory = () => {
    const value = categoryInput.trim().toLowerCase();
    if (value && !categories.includes(value)) {
      setCategories([...categories, value]);
      setCategoryInput("");
    }
  };

  const addTag = () => {
    const value = tagInput.trim().toLowerCase();
    if (value && !tags.includes(value)) {
      setTags([...tags, value]);
      setTagInput("");
    }
  };

  const removeUser = (user: string) => setUsers(users.filter((u) => u !== user));
  const removeCategory = (cat: string) => setCategories(categories.filter((c) => c !== cat));
  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  return (
    <Popover modal>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <McpIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{t("button")}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[calc(100vw-2rem)] sm:w-[420px] p-4" sideOffset={8} collisionPadding={16}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <McpIcon className="h-4 w-4" />
              {t("title")}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  {t("copied")}
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  {t("copy")}
                </>
              )}
            </Button>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground">
            {t("description")}
          </p>

          {/* Config JSON */}
          <div dir="ltr" className="bg-muted rounded-md p-3 font-mono text-xs overflow-x-auto text-left">
            <pre className="whitespace-pre">{configJson}</pre>
          </div>

          {/* Filters */}
          <div className="space-y-3 border-t pt-3">
            <p className="text-xs text-muted-foreground">{t("customizeFilters")}</p>

            {/* Users */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium">{t("users")}</label>
              <div className="flex gap-1.5">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addUser()}
                  placeholder={t("userPlaceholder")}
                  className="h-7 text-xs flex-1"
                />
                <Button size="sm" variant="outline" className="h-7 px-2" onClick={addUser}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              {users.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {users.map((user) => (
                    <Badge key={user} variant="secondary" className="text-xs gap-1 pr-1">
                      @{user}
                      <button onClick={() => removeUser(user)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium">{t("categories")}</label>
              <div className="flex gap-1.5">
                <Input
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCategory()}
                  placeholder={t("categoryPlaceholder")}
                  className="h-7 text-xs flex-1"
                />
                <Button size="sm" variant="outline" className="h-7 px-2" onClick={addCategory}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {categories.map((cat) => (
                    <Badge key={cat} variant="secondary" className="text-xs gap-1 pr-1">
                      {cat}
                      <button onClick={() => removeCategory(cat)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium">{t("tags")}</label>
              <div className="flex gap-1.5">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTag()}
                  placeholder={t("tagPlaceholder")}
                  className="h-7 text-xs flex-1"
                />
                <Button size="sm" variant="outline" className="h-7 px-2" onClick={addTag}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs gap-1 pr-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
