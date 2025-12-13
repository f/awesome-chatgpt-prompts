import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { PromptList } from "@/components/prompts/prompt-list";
import { SubscribeButton } from "@/components/categories/subscribe-button";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
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

  // Fetch prompts in this category
  const promptsRaw = await db.prompt.findMany({
    where: {
      categoryId: category.id,
      isPrivate: false,
      isUnlisted: false,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    take: 30,
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
            <span>{category._count.prompts} prompts</span>
            <span>•</span>
            <span>{category._count.subscribers} subscribers</span>
          </div>
        </div>
      </div>

      {/* Prompts */}
      <PromptList prompts={prompts} currentPage={1} totalPages={1} />
    </div>
  );
}
