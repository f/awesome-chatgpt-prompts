import { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { unstable_cache } from "next/cache";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfinitePromptList } from "@/components/prompts/infinite-prompt-list";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Taste",
  description: "Browse and discover coding taste profiles",
};

// Query for tastes list (cached)
function getCachedTastes(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orderBy: any,
  perPage: number,
  searchQuery?: string
) {
  const cacheKey = JSON.stringify({ orderBy, perPage, searchQuery });
  
  return unstable_cache(
    async () => {
      const where: Record<string, unknown> = {
        type: "TASTE",
        isPrivate: false,
        isUnlisted: false,
        deletedAt: null,
      };

      if (searchQuery) {
        where.OR = [
          { title: { contains: searchQuery, mode: "insensitive" } },
          { content: { contains: searchQuery, mode: "insensitive" } },
          { description: { contains: searchQuery, mode: "insensitive" } },
        ];
      }

      const [tastesRaw, totalCount] = await Promise.all([
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
                verified: true,
              },
            },
            category: {
              include: {
                parent: {
                  select: { id: true, name: true, slug: true },
                },
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
              select: {
                votes: true,
                contributors: true,
                outgoingConnections: { where: { label: { not: "related" } } },
                incomingConnections: { where: { label: { not: "related" } } },
              },
            },
          },
        }),
        db.prompt.count({ where }),
      ]);

      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tastes: tastesRaw.map((p: any) => ({
          ...p,
          voteCount: p._count.votes,
          contributorCount: p._count.contributors,
          contributors: p.contributors,
        })),
        total: totalCount,
      };
    },
    ["taste", cacheKey],
    { tags: ["prompts"] }
  )();
}

interface TastesPageProps {
  searchParams: Promise<{
    q?: string;
    sort?: string;
  }>;
}

export default async function TastesPage({ searchParams }: TastesPageProps) {
  const t = await getTranslations("prompts");
  const tNav = await getTranslations("nav");
  const tSearch = await getTranslations("search");
  const params = await searchParams;
  
  const perPage = 24;

  // Build order by clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: any = { createdAt: "desc" };
  if (params.sort === "oldest") {
    orderBy = { createdAt: "asc" };
  } else if (params.sort === "upvotes") {
    orderBy = { votes: { _count: "desc" } };
  }

  const result = await getCachedTastes(orderBy, perPage, params.q);
  const tastes = result.tastes;
  const total = result.total;

  return (
    <div className="container py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-baseline gap-2">
          <h1 className="text-lg font-semibold">{tNav("taste")}</h1>
          <span className="text-xs text-muted-foreground">{tSearch("found", { count: total })}</span>
        </div>
        <Button size="sm" className="h-8 text-xs w-full sm:w-auto" asChild>
          <Link href="/prompts/new?type=TASTE">
            <Plus className="h-3.5 w-3.5 mr-1" />
            {t("createTaste")}
          </Link>
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6">
        {t("tastesDescription")}
      </p>

      <InfinitePromptList
        initialPrompts={tastes}
        initialTotal={total}
        filters={{
          q: params.q,
          type: "TASTE",
          sort: params.sort,
        }}
      />
    </div>
  );
}
