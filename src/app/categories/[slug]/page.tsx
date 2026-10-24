import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import config from "@/../prompts.config";
import { Button } from "@/components/ui/button";
import { PromptList } from "@/components/prompts/prompt-list";
import { SubscribeButton } from "@/components/categories/subscribe-button";
import { CategoryFilters } from "@/components/categories/category-filters";
import { McpServerPopup } from "@/components/mcp/mcp-server-popup";
import { JsonLd, breadcrumbSchema, collectionPageSchema } from "@/components/seo/structured-data";
import { buildPageMetadata, NOINDEX_ROBOTS, paginatedPath, toMetaDescription } from "@/lib/seo";
import { getPromptUrl } from "@/lib/urls";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string; q?: string }>;
}

const PROMPTS_PER_PAGE = 30;

const visiblePromptFilter = {
  isPrivate: false,
  isUnlisted: false,
  deletedAt: null,
};

export async function generateMetadata({ params, searchParams }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { page, q } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const category = await db.category.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      _count: { select: { prompts: { where: visiblePromptFilter } } },
    },
  });

  const count = category?._count.prompts ?? 0;
  if (!category || currentPage > Math.max(1, Math.ceil(count / PROMPTS_PER_PAGE))) {
    return { title: "Category Not Found", robots: NOINDEX_ROBOTS };
  }

  const t = await getTranslations("seo");
  const description = category.description
    ? t("category.description", { description: category.description.replace(/[.!?\s]*$/, "."), name: category.name, count })
    : t("category.fallbackDescription", { name: category.name, count });
  const title = t("category.title", { name: category.name });

  return buildPageMetadata({
    title: currentPage > 1 ? `${title} - ${t("page", { page: currentPage })}` : title,
    description: toMetaDescription(description),
    // Sorted views share the canonical of the default order; searches aren't indexed
    path: paginatedPath(`/categories/${slug}`, currentPage),
    noindex: !!q,
  });
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page, sort, q } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const sortOption = sort || "newest";
  const session = await auth();
  const t = await getTranslations();

  const category = await db.category.findUnique({
    where: { slug },
    include: {
      parent: {
        select: { name: true, slug: true },
      },
      _count: {
        select: { prompts: true, subscribers: true },
      },
    },
  });

  if (!category) {
    notFound();
  }

  const tSeo = await getTranslations("seo");

  // Check if user is subscribed
  const isSubscribed = session?.user
    ? await db.categorySubscription.findUnique({
        where: {
          userId_categoryId: {
            userId: session.user.id,
            categoryId: category.id,
          },
        },
      })
    : null;

  // Build where clause with optional search
  const whereClause = {
    categoryId: category.id,
    isPrivate: false,
    isUnlisted: false,
    deletedAt: null,
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { content: { contains: q, mode: "insensitive" as const } },
      ],
    }),
  };

  // Build orderBy based on sort option
  const getOrderBy = () => {
    switch (sortOption) {
      case "oldest":
        return { createdAt: "asc" as const };
      case "most_upvoted":
        return { votes: { _count: "desc" as const } };
      case "most_contributors":
        return { contributors: { _count: "desc" as const } };
      default:
        return { createdAt: "desc" as const };
    }
  };

  // Count total prompts for pagination
  const totalPrompts = await db.prompt.count({ where: whereClause });
  const totalPages = Math.ceil(totalPrompts / PROMPTS_PER_PAGE);

  // Pages past the end would be empty duplicates of the listing
  if (currentPage > 1 && currentPage > totalPages) {
    notFound();
  }

  // Fetch prompts in this category
  const promptsRaw = await db.prompt.findMany({
    where: whereClause,
    orderBy: getOrderBy(),
    skip: (currentPage - 1) * PROMPTS_PER_PAGE,
    take: PROMPTS_PER_PAGE,
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
      _count: {
        select: {
          votes: true,
          contributors: true,
          outgoingConnections: { where: { label: { not: "related" } } },
          incomingConnections: { where: { label: { not: "related" } } },
        },
      },
    },
  });

  const prompts = promptsRaw.map((p) => ({
    ...p,
    voteCount: p._count.votes,
    contributorCount: p._count.contributors,
  }));

  const categoryPath = `/categories/${category.slug}`;

  return (
    <div className="container py-6">
      <JsonLd
        data={[
          collectionPageSchema({
            name: tSeo("category.heading", { name: category.name }),
            description: category.description || tSeo("category.fallbackDescription", { name: category.name, count: totalPrompts }),
            path: paginatedPath(categoryPath, currentPage),
            items: prompts.map((prompt) => ({ name: prompt.title, path: getPromptUrl(prompt.id, prompt.slug) })),
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Categories", path: "/categories" },
            ...(category.parent
              ? [{ name: category.parent.name, path: `/categories/${category.parent.slug}` }]
              : []),
            { name: category.name, path: categoryPath },
          ]),
        ]}
      />
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
          <Link href="/categories">
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("categories.allCategories")}
          </Link>
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{tSeo("category.heading", { name: category.name })}</h1>
              {session?.user && (
                <SubscribeButton
                  categoryId={category.id}
                  categoryName={category.name}
                  initialSubscribed={!!isSubscribed}
                  pill
                />
              )}
            </div>
            {category.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {category.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span>{t("categories.promptCount", { count: totalPrompts })}</span>
              <span>•</span>
              <span>{t("categories.subscriberCount", { count: category._count.subscribers })}</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <CategoryFilters categorySlug={slug} />
            {config.features.mcp !== false && <McpServerPopup initialCategories={[slug]} showOfficialBranding={!config.homepage?.useCloneBranding} />}
          </div>
        </div>

        {/* Mobile filters */}
        <div className="flex md:hidden items-center gap-2 mt-4">
          <CategoryFilters categorySlug={slug} />
          {config.features.mcp !== false && <McpServerPopup initialCategories={[slug]} showOfficialBranding={!config.homepage?.useCloneBranding} />}
        </div>
      </div>

      {/* Prompts */}
      <PromptList prompts={prompts} currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
