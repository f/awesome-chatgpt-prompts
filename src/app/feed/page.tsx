import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowRight, FolderOpen, Heart, Bookmark, UserPlus } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { PromptList } from "@/components/prompts/prompt-list";
import { annotatePromptsWithUserVotes } from "@/lib/prompt-votes";
import { cn } from "@/lib/utils";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const t = await getTranslations("feed");
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  const { filter = "created" } = await searchParams;
  const isAdmin = session.user.role === "ADMIN";

  const filterOptions = [
    { id: "liked", label: t("filterLikedByTeam"), icon: Heart },
    { id: "bookmarked", label: t("filterBookmarkedByTeam"), icon: Bookmark },
    { id: "created", label: t("filterCreatedByTeam"), icon: UserPlus },
  ];

  const whereClause: any = {
    isPrivate: false,
    isUnlisted: false,
    deletedAt: null,
    author: {
      role: "ADMIN",
    },
  };

  if (filter === "liked") {
    whereClause.votes = {
      some: {
        userId: session.user.id,
      },
    };
  } else if (filter === "bookmarked") {
    whereClause.bookmarks = {
      some: {
        userId: session.user.id,
      },
    };
  }

  // Fetch prompts based on filter
  const promptsRaw = await db.prompt.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    take: 50,
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
    voteCount: p._count?.votes ?? 0,
    contributorCount: p._count?.contributors ?? 0,
  }));
  const promptsWithVotes = await annotatePromptsWithUserVotes(prompts, session?.user?.id);

  const filterCards = [
    { label: t("filterLikedByTeam"), icon: Heart, active: filter === "liked" },
    { label: t("filterBookmarkedByTeam"), icon: Bookmark, active: filter === "bookmarked" },
    { label: t("filterCreatedByTeam"), icon: UserPlus, active: filter === "created" },
    { label: t("browseAll"), icon: ArrowRight, active: false, href: "/prompts" },
  ];

  return (
    <div className="container py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-lg font-semibold">{t("yourFeed")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("feedDescription")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filterCards.map((filterCard) =>
            filterCard.href ? (
              <Button
                key={filterCard.label}
                variant="outline"
                size="sm"
                asChild
                className="h-8 px-3 text-xs transition-all"
              >
                <Link href={filterCard.href}>
                  {filterCard.icon && <filterCard.icon className="mr-1.5 h-3.5 w-3.5" />}
                  {filterCard.label}
                </Link>
              </Button>
            ) : filterCard.active ? (
              <span
                key={filterCard.label}
                className={cn(
                  "h-8 px-3 text-xs transition-all inline-flex items-center rounded-md border font-medium",
                  "border-2 border-primary bg-background text-foreground"
                )}
              >
                {filterCard.icon && <filterCard.icon className="mr-1.5 h-3.5 w-3.5" />}
                {filterCard.label}
              </span>
            ) : (
              <span
                key={filterCard.label}
                className="inline-flex items-center h-8 px-3 text-xs rounded-md border border-border bg-background text-muted-foreground font-medium opacity-50"
              >
                {filterCard.icon && <filterCard.icon className="mr-1.5 h-3.5 w-3.5" />}
                {filterCard.label}
              </span>
            )
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {filterOptions.map((f) => {
          const Icon = f.icon;
          const isActive = filter === f.id;
          return (
            <Button
              key={f.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={cn("h-8 rounded-full", isActive && "shadow-sm")}
              asChild
            >
              <Link href={`?filter=${f.id}`}>
                <Icon className={cn("mr-2 h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                {f.label}
              </Link>
            </Button>
          );
        })}
      </div>

      {/* Feed */}
      {prompts.length > 0 ? (
        <PromptList prompts={promptsWithVotes} currentPage={1} totalPages={1} isAdmin={isAdmin} isLoggedIn={!!session?.user} />
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <FolderOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h2 className="font-medium mb-1">{t("noPromptsInFeed")}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {filter === "created" ? t("noAdminPromptsYet") : t("noPromptsMatchingFilter")}
          </p>
        </div>
      )}
    </div>
  );
}
