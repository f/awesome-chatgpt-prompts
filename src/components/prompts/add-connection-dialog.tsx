"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Search, Link2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface SearchResult {
  id: string;
  title: string;
  author: {
    username: string;
  };
}

interface AddConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promptId: string;
  connectionType: "previous" | "next";
  onConnectionAdded: () => void;
}

export function AddConnectionDialog({
  open,
  onOpenChange,
  promptId,
  connectionType,
  onConnectionAdded,
}: AddConnectionDialogProps) {
  const t = useTranslations("connectedPrompts");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<SearchResult | null>(null);
  const [label, setLabel] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const searchPrompts = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/prompts/search?q=${encodeURIComponent(debouncedQuery)}&limit=10&ownerOnly=true`
        );
        if (res.ok) {
          const data = await res.json();
          // Filter out the current prompt
          setSearchResults(
            data.prompts.filter((p: SearchResult) => p.id !== promptId)
          );
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    };

    searchPrompts();
  }, [debouncedQuery, promptId]);

  const handleSubmit = async () => {
    if (!selectedPrompt || !label.trim()) {
      setError(t("fillAllFields"));
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // For "previous" connections, we create the connection FROM the selected prompt TO the current prompt
      // For "next" connections, we create the connection FROM the current prompt TO the selected prompt
      const sourceId = connectionType === "previous" ? selectedPrompt.id : promptId;
      const targetId = connectionType === "previous" ? promptId : selectedPrompt.id;

      const res = await fetch(`/api/prompts/${sourceId}/connections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetId: targetId,
          label: label.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t("connectionFailed"));
        return;
      }

      onConnectionAdded();
      handleClose();
    } catch {
      setError(t("connectionFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedPrompt(null);
    setLabel("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            {connectionType === "previous" ? t("addPreviousTitle") : t("addNextTitle")}
          </DialogTitle>
          <DialogDescription>
            {connectionType === "previous" ? t("addPreviousDescription") : t("addNextDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedPrompt ? (
            <div className="space-y-2">
              <Label>{t("searchPrompt")}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {isSearching && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
                  {searchResults.map((prompt) => (
                    <button
                      key={prompt.id}
                      className="w-full px-3 py-2 text-left hover:bg-accent transition-colors"
                      onClick={() => {
                        setSelectedPrompt(prompt);
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                    >
                      <p className="text-sm font-medium truncate">{prompt.title}</p>
                      <p className="text-xs text-muted-foreground">
                        @{prompt.author.username}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {debouncedQuery.length >= 2 &&
                !isSearching &&
                searchResults.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t("noResults")}
                  </p>
                )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>{t("selectedPrompt")}</Label>
                <div className="mt-1.5 p-3 rounded-lg border bg-muted/50 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{selectedPrompt.title}</p>
                    <p className="text-xs text-muted-foreground">
                      @{selectedPrompt.author.username}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPrompt(null)}
                  >
                    {t("change")}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="connection-label">{t("connectionLabel")}</Label>
                <Input
                  id="connection-label"
                  placeholder={t("labelPlaceholder")}
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="mt-1.5"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t("labelHint")}
                </p>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedPrompt || !label.trim() || isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {connectionType === "previous" ? t("addPrevious") : t("addNext")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
