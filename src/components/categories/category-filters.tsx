"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SORT_OPTIONS = ["newest", "oldest", "most_upvoted", "most_contributors"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

interface CategoryFiltersProps {
  categorySlug: string;
}

export function CategoryFilters({ categorySlug }: CategoryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("categories");

  const currentSort = (searchParams?.get("sort") as SortOption) || "newest";
  const currentSearch = searchParams?.get("q") || "";

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset to page 1 when filters change
    params.delete("page");
    router.push(`/categories/${categorySlug}?${params.toString()}`);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      updateParams("q", e.currentTarget.value);
    }
  };

  const handleSearchBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.currentTarget.value !== currentSearch) {
      updateParams("q", e.currentTarget.value);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-1 md:flex-none">
      <div className="relative flex-1 md:flex-none">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t("searchPlaceholder")}
          defaultValue={currentSearch}
          onKeyDown={handleSearchKeyDown}
          onBlur={handleSearchBlur}
          className="pl-8 h-8 w-full md:w-[180px] text-sm"
        />
      </div>
      <Select value={currentSort} onValueChange={(value) => updateParams("sort", value)}>
        <SelectTrigger size="sm" className="h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {t(`sort.${option}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
