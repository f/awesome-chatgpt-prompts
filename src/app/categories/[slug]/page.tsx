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
import { McpServerPopup } from "@/components/mcp/mcp-server-popup";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

const PROMPTS_PER_PAGE = 30;

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await db.category.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!category) {
    return { title: "Category Not Found" };
  }

  return {
    title: category.name,
    description: category.description || `Browse prompts in ${category.name}`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const session = await auth();
  const t = await getTranslations();

  const category = await db.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { prompts: true, subscribers: true },
      },
    },
  });

  if (!category) {
    notFound();
  }

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

  // Count total prompts for pagination
  const totalPrompts = await db.prompt.count({
    where: {
      categoryId: category.id,
      isPrivate: false,
      isUnlisted: false,
      deletedAt: null,
    },
  });
  const totalPages = Math.ceil(totalPrompts / PROMPTS_PER_PAGE);

  // Fetch prompts in this category
  const promptsRaw = await db.prompt.findMany({
    where: {
      categoryId: category.id,
      isPrivate: false,
      isUnlisted: false,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
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
        select: { votes: true, contributors: true },
      },
    },
  });

  const prompts = promptsRaw.map((p) => ({
    ...p,
    voteCount: p._count.votes,
    contributorCount: p._count.contributors,
  }));

  return (
    <div className="container py-6">
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
              <h1 className="text-xl font-semibold">{category.name}</h1>
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
          {config.features.mcp !== false && <McpServerPopup initialCategories={[slug]} showOfficialBranding={!config.homepage?.useCloneBranding} />}
        </div>
      </div>

      {/* Prompts */}
      <PromptList prompts={prompts} currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
