"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useFilterContext } from "./filter-context";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { X, Sparkles, Search, SlidersHorizontal } from "lucide-react";
import { analyticsSearch } from "@/lib/analytics";

interface PromptFiltersProps {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
  }>;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
    color: string;
  }>;
  currentFilters: {
    q?: string;
    type?: string;
    category?: string;
    tag?: string;
    sort?: string;
    ai?: string;
  };
  aiSearchEnabled?: boolean;
}

const promptTypes = ["TEXT", "STRUCTURED", "IMAGE", "VIDEO", "AUDIO"];

export function PromptFilters({ categories, tags, currentFilters, aiSearchEnabled }: PromptFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const [tagSearch, setTagSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const { setFilterPending } = useFilterContext();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const filteredTags = useMemo(() => {
    if (!tagSearch.trim()) return tags;
    const search = tagSearch.toLowerCase();
    return tags.filter((tag) => tag.name.toLowerCase().includes(search));
  }, [tags, tagSearch]);

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/prompts?${params.toString()}`);
  };

  const clearFilters = () => {
    analyticsSearch.clearFilters();
    router.push("/prompts");
  };

  const hasFilters = currentFilters.q || currentFilters.type || currentFilters.category || currentFilters.tag || currentFilters.sort;

  const activeFilterCount = [currentFilters.type, currentFilters.category, currentFilters.tag, currentFilters.sort && currentFilters.sort !== "newest"].filter(Boolean).length;

  return (
    <div className="space-y-4 p-0 pt-4 border-t lg:pt-4 lg:p-4 lg:border lg:rounded-lg text-sm">
      {/* Mobile: Compact search with filter toggle */}
      <div className="lg:hidden space-y-3">
        {/* Search bar with AI toggle and filter toggle */}
        <div className="flex gap-1.5 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder={t("search.placeholder")}
              className="h-8 text-xs pl-8"
              defaultValue={currentFilters.q}
              onChange={(e) => {
                const value = e.target.value;
                setFilterPending(true);
                if (debounceRef.current) {
                  clearTimeout(debounceRef.current);
                }
                debounceRef.current = setTimeout(() => {
                  if (value) {
                    analyticsSearch.search(value, currentFilters.ai === "1");
                  }
                  updateFilter("q", value || null);
                }, 300);
              }}
            />
          </div>
          {aiSearchEnabled && (
            <div className="flex items-center gap-1 shrink-0">
              <Sparkles className="h-3 w-3 text-primary" />
              <Switch
                id="ai-search-mobile"
                checked={currentFilters.ai === "1"}
                onCheckedChange={(checked) => {
                  analyticsSearch.aiSearchToggle(checked);
                  updateFilter("ai", checked ? "1" : null);
                }}
              />
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 relative shrink-0"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Collapsible filters */}
        {showFilters && (
          <div className="space-y-4 pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="font-medium text-xs uppercase text-muted-foreground">{t("search.filters")}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-6 text-xs px-2 ${hasFilters ? "visible" : "invisible"}`} 
                onClick={clearFilters}
              >
                <X className="h-3 w-3 mr-1" />{t("search.clear")}
              </Button>
            </div>
            {/* Mobile filters content rendered below */}
          </div>
        )}
      </div>

      {/* Desktop: Full filters */}
      <div className="hidden lg:block space-y-4">
        <div className="flex items-center justify-between h-6">
          <span className="font-medium text-xs uppercase text-muted-foreground">{t("search.filters")}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-6 text-xs px-2 ${hasFilters ? "visible" : "invisible"}`} 
            onClick={clearFilters}
          >
            <X className="h-3 w-3 mr-1" />{t("search.clear")}
          </Button>
        </div>

        {/* Search */}
        <div className="space-y-1.5">
          <Label className="text-xs">{t("search.search")}</Label>
          <Input
            placeholder={t("search.placeholder")}
            className="h-8 text-sm"
            defaultValue={currentFilters.q}
            onChange={(e) => {
              const value = e.target.value;
              setFilterPending(true);
              if (debounceRef.current) {
                clearTimeout(debounceRef.current);
              }
              debounceRef.current = setTimeout(() => {
                if (value) {
                  analyticsSearch.search(value, currentFilters.ai === "1");
                }
                updateFilter("q", value || null);
              }, 300);
            }}
          />
        </div>

        {/* AI Search Toggle */}
        {aiSearchEnabled && (
          <div className="flex items-center justify-between py-1">
            <Label className="text-xs flex items-center gap-1.5 cursor-pointer" htmlFor="ai-search">
              <Sparkles className="h-3 w-3 text-primary" />
              {t("search.aiSearch")}
            </Label>
            <Switch
              id="ai-search"
              checked={currentFilters.ai === "1"}
              onCheckedChange={(checked) => {
                analyticsSearch.aiSearchToggle(checked);
                updateFilter("ai", checked ? "1" : null);
              }}
            />
          </div>
        )}
      </div>

      {/* Shared filters - shown on desktop always, on mobile when showFilters is true */}
      <div className={`space-y-4 ${showFilters ? "block" : "hidden"} lg:block`}>
      {/* Type filter */}
      <div className="space-y-1.5">
        <Label className="text-xs">{t("prompts.promptType")}</Label>
        <Select
          value={currentFilters.type || "all"}
          onValueChange={(value) => {
            if (value !== "all") {
              analyticsSearch.filter("type", value);
            }
            updateFilter("type", value === "all" ? null : value);
          }}
        >
          <SelectTrigger className="h-8 text-sm w-full">
            <SelectValue placeholder={t("common.all")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            {promptTypes.map((type) => (
              <SelectItem key={type} value={type}>{t(`prompts.types.${type.toLowerCase()}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs">{t("prompts.promptCategory")}</Label>
          <Select
            value={currentFilters.category || "all"}
            onValueChange={(value) => {
              if (value !== "all") {
                analyticsSearch.filter("category", value);
              }
              updateFilter("category", value === "all" ? null : value);
            }}
          >
            <SelectTrigger className="h-8 text-sm w-full">
              <SelectValue placeholder={t("common.all")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              {/* Parent categories */}
              {categories
                .filter((c) => c.id && !c.parentId)
                .map((parent) => (
                  <div key={parent.id}>
                    <SelectItem value={parent.id} className="font-medium">
                      {parent.name}
                    </SelectItem>
                    {/* Child categories */}
                    {categories
                      .filter((c) => c.parentId === parent.id)
                      .map((child) => (
                        <SelectItem key={child.id} value={child.id} className="pl-6 text-muted-foreground">
                          ↳ {child.name}
                        </SelectItem>
                      ))}
                  </div>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Sort */}
      <div className="space-y-1.5">
        <Label className="text-xs">{t("search.sortBy")}</Label>
        <Select
          value={currentFilters.sort || "newest"}
          onValueChange={(value) => {
            analyticsSearch.sort(value);
            updateFilter("sort", value === "newest" ? null : value);
          }}
        >
          <SelectTrigger className="h-8 text-sm w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t("search.newest")}</SelectItem>
            <SelectItem value="oldest">{t("search.oldest")}</SelectItem>
            <SelectItem value="upvotes">{t("search.mostUpvoted")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs">{t("prompts.promptTags")}</Label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder={t("search.searchTags")}
              className="h-7 text-xs pl-7"
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto">
            {filteredTags.filter((tag) => tag.id && tag.slug).map((tag) => (
              <button
                key={tag.id}
                className="px-2 py-0.5 text-[11px] rounded border transition-colors"
                style={
                  currentFilters.tag === tag.slug
                    ? { backgroundColor: tag.color, color: "white", borderColor: tag.color }
                    : { borderColor: tag.color + "40", color: tag.color }
                }
                onClick={() => {
                  if (currentFilters.tag !== tag.slug) {
                    analyticsSearch.filter("tag", tag.slug);
                  }
                  updateFilter("tag", currentFilters.tag === tag.slug ? null : tag.slug);
                }}
              >
                {tag.name}
              </button>
            ))}
            {filteredTags.length === 0 && tagSearch && (
              <span className="text-xs text-muted-foreground">{t("search.noResults")}</span>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
