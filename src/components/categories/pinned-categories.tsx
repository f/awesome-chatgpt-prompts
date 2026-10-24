"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useFilterContext } from "@/components/prompts/filter-context";

interface PinnedCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

interface PinnedCategoriesProps {
  categories: PinnedCategory[];
  currentCategorySlug?: string;
}

export function PinnedCategories({ categories, currentCategorySlug }: PinnedCategoriesProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("categories");
  const { setFilterPending } = useFilterContext();

  if (categories.length === 0) {
    return null;
  }

  const handleCategoryClick = (categorySlug: string) => {
    setFilterPending(true);
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    
    if (currentCategorySlug === categorySlug) {
      params.delete("category");
    } else {
      params.set("category", categorySlug);
    }
    
    params.delete("page");
    
    router.push(`/prompts?${params.toString()}`);
  };

  const handleClearFilter = () => {
    setFilterPending(true);
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.delete("category");
    params.delete("page");
    router.push(`/prompts?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={handleClearFilter}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
          !currentCategorySlug
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-background hover:bg-accent border-border"
        )}
      >
        {t("allCategories")}
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryClick(category.slug)}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
            currentCategorySlug === category.slug
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background hover:bg-accent border-border"
          )}
        >
          {category.icon && <span>{category.icon}</span>}
          {category.name}
        </button>
      ))}
    </div>
  );
}
