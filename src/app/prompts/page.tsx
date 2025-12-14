import { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfinitePromptList } from "@/components/prompts/infinite-prompt-list";
import { PromptFilters } from "@/components/prompts/prompt-filters";
import { FilterProvider } from "@/components/prompts/filter-context";
import { HFDataStudioDropdown } from "@/components/prompts/hf-data-studio-dropdown";
import { db } from "@/lib/db";
import { isAISearchEnabled, semanticSearch } from "@/lib/ai/embeddings";
import { isAIGenerationEnabled } from "@/lib/ai/generation";
import config from "@/../prompts.config";

export const metadata: Metadata = {
  title: "Prompts",
  description: "Browse and discover AI prompts",
};

interface PromptsPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    category?: string;
    tag?: string;
    sort?: string;
    page?: string;
    ai?: string;
  }>;
}

export default async function PromptsPage({ searchParams }: PromptsPageProps) {
  const t = await getTranslations("prompts");
  const tSearch = await getTranslations("search");
  const params = await searchParams;
  
  const perPage = 12;
  const aiSearchAvailable = await isAISearchEnabled();
  const aiGenerationAvailable = await isAIGenerationEnabled();
  const useAISearch = aiSearchAvailable && params.ai === "1" && params.q;

  let prompts: any[] = [];
  let total = 0;

  if (useAISearch && params.q) {
    // Use AI semantic search
    try {
      const aiResults = await semanticSearch(params.q, perPage);
      prompts = aiResults.map((p) => ({
        ...p,
        contributorCount: 0,
      }));
      total = aiResults.length;
    } catch {
      // Fallback to regular search on error
    }
  }
  
  // Regular search if AI search not used or failed
  if (!useAISearch || prompts.length === 0) {
    // Build where clause based on filters
    const where: Record<string, unknown> = {
      isPrivate: false,
      isUnlisted: false, // Exclude unlisted prompts
      deletedAt: null, // Exclude soft-deleted prompts
    };
    
    if (params.q) {
      where.OR = [
        { title: { contains: params.q, mode: "insensitive" } },
        { content: { contains: params.q, mode: "insensitive" } },
        { description: { contains: params.q, mode: "insensitive" } },
      ];
    }
    
    if (params.type) {
      where.type = params.type;
    }
    
    if (params.category) {
      where.categoryId = params.category;
    }
    
    if (params.tag) {
      where.tags = {
        some: {
          tag: {
            slug: params.tag,
          },
        },
      };
    }
    
    // Build order by clause
    const isUpvoteSort = params.sort === "upvotes";
    let orderBy: any = { createdAt: "desc" };
    if (params.sort === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (isUpvoteSort) {
      // Sort by vote count descending
      orderBy = { votes: { _count: "desc" } };
    }

    // Fetch initial prompts (first page)
    const [promptsRaw, totalCount] = await Promise.all([
      db.prompt.findMany({
        where,
        orderBy,
        skip: 0,
        take: perPage,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          contributors: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: { votes: true, contributors: true },
          },
        },
      }),
      db.prompt.count({ where }),
    ]);

    // Transform to include voteCount and contributorCount
    prompts = promptsRaw.map((p) => ({
      ...p,
      voteCount: p._count.votes,
      contributorCount: p._count.contributors,
      contributors: p.contributors,
    }));
    total = totalCount;
  }

  // Fetch categories for filter (with parent info for nesting)
  const categories = await db.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
    },
  });

  // Fetch tags for filter
  const tags = await db.tag.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="container py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-baseline gap-2">
          <h1 className="text-lg font-semibold">{t("title")}</h1>
          <span className="text-xs text-muted-foreground">{tSearch("found", { count: total })}</span>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {!config.homepage?.useCloneBranding && (
            <HFDataStudioDropdown aiGenerationEnabled={aiGenerationAvailable} />
          )}
          <Button size="sm" className="h-8 text-xs w-full sm:w-auto" asChild>
            <Link href="/prompts/new">
              <Plus className="h-3.5 w-3.5 mr-1" />
              {t("create")}
            </Link>
          </Button>
        </div>
      </div>

      <FilterProvider>
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-56 shrink-0">
            <PromptFilters
              categories={categories}
              tags={tags}
              currentFilters={params}
              aiSearchEnabled={aiSearchAvailable}
            />
          </aside>
          <main className="flex-1 min-w-0">
            <InfinitePromptList
              initialPrompts={prompts}
              initialTotal={total}
              filters={{
                q: params.q,
                type: params.type,
                category: params.category,
                tag: params.tag,
                sort: params.sort,
              }}
            />
          </main>
        </div>
      </FilterProvider>
    </div>
  );
}
