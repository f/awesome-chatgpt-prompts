import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Bell, FolderOpen, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PromptList } from "@/components/prompts/prompt-list";

export default async function FeedPage() {
  const t = await getTranslations("feed");
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  // Get user's subscribed categories
  const subscriptions = await db.categorySubscription.findMany({
    where: { userId: session.user.id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  const subscribedCategoryIds = subscriptions.map((s) => s.categoryId);

  // Fetch prompts from subscribed categories
  const promptsRaw = subscribedCategoryIds.length > 0
    ? await db.prompt.findMany({
        where: {
          isPrivate: false,
          isUnlisted: false,
          deletedAt: null,
          categoryId: { in: subscribedCategoryIds },
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
      })
    : [];

  const prompts = promptsRaw.map((p) => ({
    ...p,
    voteCount: p._count?.votes ?? 0,
    contributorCount: p._count?.contributors ?? 0,
  }));

  // Get all categories for subscription
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { prompts: true },
      },
    },
  });

  return (
    <div className="container py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-lg font-semibold">{t("yourFeed")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("feedDescription")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/prompts">
              {t("browseAll")}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/discover">
              <Sparkles className="mr-1.5 h-4 w-4" />
              {t("discover")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Subscribed Categories */}
      {subscriptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {subscriptions.map(({ category }) => (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <Badge variant="secondary" className="gap-1">
                <Bell className="h-3 w-3" />
                {category.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Feed */}
      {prompts.length > 0 ? (
        <PromptList prompts={prompts} currentPage={1} totalPages={1} />
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <FolderOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h2 className="font-medium mb-1">{t("noPromptsInFeed")}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {t("subscribeToCategories")}
          </p>

          {/* Category suggestions */}
          <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
            {categories.slice(0, 6).map((category) => (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                  {category.name}
                  <span className="ml-1 text-muted-foreground">({category._count.prompts})</span>
                </Badge>
              </Link>
            ))}
          </div>

          <div className="mt-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/categories">{t("viewAllCategories")}</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
