import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { formatDistanceToNow } from "@/lib/date";
import { Calendar, ArrowBigUp, FileText, Settings, GitPullRequest, Clock, Check, X, Pin, BadgeCheck, Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { PromptList } from "@/components/prompts/prompt-list";
import { PromptCard, type PromptCardProps } from "@/components/prompts/prompt-card";

interface UserProfilePageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ page?: string; tab?: string }>;
}

export async function generateMetadata({ params }: UserProfilePageProps): Promise<Metadata> {
  const { username: rawUsername } = await params;
  const decodedUsername = decodeURIComponent(rawUsername);
  
  // Only support /@username format
  if (!decodedUsername.startsWith("@")) {
    return { title: "User Not Found" };
  }
  
  const username = decodedUsername.slice(1);
    
  const user = await db.user.findUnique({
    where: { username },
    select: { name: true, username: true },
  });

  if (!user) {
    return { title: "User Not Found" };
  }

  return {
    title: `${user.name || user.username} (@${user.username})`,
    description: `View ${user.name || user.username}'s prompts`,
  };
}

export default async function UserProfilePage({ params, searchParams }: UserProfilePageProps) {
  const { username: rawUsername } = await params;
  const { page: pageParam, tab } = await searchParams;
  const session = await auth();
  const t = await getTranslations("user");
  const tChanges = await getTranslations("changeRequests");
  const tPrompts = await getTranslations("prompts");
  const locale = await getLocale();

  // Decode URL-encoded @ symbol
  const decodedUsername = decodeURIComponent(rawUsername);
  
  // Only support /@username format - reject URLs without @
  if (!decodedUsername.startsWith("@")) {
    notFound();
  }
  
  const username = decodedUsername.slice(1);

  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      avatar: true,
      role: true,
      verified: true,
      createdAt: true,
      _count: {
        select: {
          prompts: true,
          contributions: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const page = parseInt(pageParam || "1");
  const perPage = 12;
  const isOwner = session?.user?.id === user.id;
  const isUnclaimed = user.email?.endsWith("@unclaimed.prompts.chat") ?? false;

  // Build where clause - show private prompts only if owner (unlisted prompts are visible on profiles)
  const where = {
    authorId: user.id,
    deletedAt: null,
    ...(isOwner ? {} : { isPrivate: false }),
  };

  // Common prompt include for both queries
  const promptInclude = {
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
  };

  // Fetch prompts, pinned prompts, contributions, and counts
  const [promptsRaw, total, totalUpvotes, pinnedPromptsRaw, contributionsRaw] = await Promise.all([
    db.prompt.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: promptInclude,
    }),
    db.prompt.count({ where }),
    db.promptVote.count({
      where: {
        prompt: {
          authorId: user.id,
        },
      },
    }),
    db.pinnedPrompt.findMany({
      where: { userId: user.id },
      orderBy: { order: "asc" },
      include: {
        prompt: {
          include: promptInclude,
        },
      },
    }),
    // Fetch contributions (prompts where user is contributor but not author)
    db.prompt.findMany({
      where: {
        contributors: {
          some: { id: user.id },
        },
        authorId: { not: user.id },
        isPrivate: false,
      },
      orderBy: { updatedAt: "desc" },
      include: promptInclude,
    }),
  ]);

  // Transform to include voteCount and contributorCount
  const prompts = promptsRaw.map((p) => ({
    ...p,
    voteCount: p._count?.votes ?? 0,
    contributorCount: p._count?.contributors ?? 0,
  }));

  // Transform contributions
  const contributions = contributionsRaw.map((p) => ({
    ...p,
    voteCount: p._count?.votes ?? 0,
    contributorCount: p._count?.contributors ?? 0,
  }));

  // Transform pinned prompts - filter out private prompts for non-owners (unlisted are visible)
  const pinnedPrompts = pinnedPromptsRaw
    .filter((pp) => isOwner || !pp.prompt.isPrivate)
    .map((pp) => ({
      ...pp.prompt,
      voteCount: pp.prompt._count?.votes ?? 0,
      contributorCount: pp.prompt._count?.contributors ?? 0,
    }));

  // Get set of pinned prompt IDs for easy lookup
  const pinnedIds = new Set<string>(pinnedPrompts.map((p: { id: string }) => p.id));

  const totalPages = Math.ceil(total / perPage);

  // Fetch change requests for this user
  // 1. Change requests the user submitted (all statuses for owner, approved only for others)
  // 2. Change requests received on user's prompts (approved ones)
  const [submittedChangeRequests, receivedChangeRequests] = await Promise.all([
    // CRs user submitted
    db.changeRequest.findMany({
      where: {
        authorId: user.id,
        // Non-owners only see approved CRs
        ...(isOwner ? {} : { status: "APPROVED" }),
      },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        prompt: {
          select: {
            id: true,
            title: true,
            author: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
    }),
    // CRs received on user's prompts (all statuses for owner, approved only for others)
    db.changeRequest.findMany({
      where: {
        prompt: {
          authorId: user.id,
        },
        ...(isOwner ? {} : { status: "APPROVED" }),
        authorId: { not: user.id }, // Exclude self-submitted
      },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        prompt: {
          select: {
            id: true,
            title: true,
            author: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
    }),
  ]);

  // Combine and sort by date, marking the type
  const allChangeRequests = [
    ...submittedChangeRequests.map((cr) => ({ ...cr, type: "submitted" as const })),
    ...receivedChangeRequests.map((cr) => ({ ...cr, type: "received" as const })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const pendingCount = submittedChangeRequests.filter((cr) => cr.status === "PENDING").length +
    receivedChangeRequests.filter((cr) => cr.status === "PENDING").length;
  const defaultTab = tab === "changes" ? "changes" : tab === "contributions" ? "contributions" : "prompts";

  const statusColors = {
    PENDING: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    APPROVED: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    REJECTED: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  };

  const statusIcons = {
    PENDING: Clock,
    APPROVED: Check,
    REJECTED: X,
  };

  return (
    <div className="container py-6">
      {/* Profile Header */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Avatar + Name row */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 md:h-20 md:w-20 shrink-0">
            <AvatarImage src={user.avatar || undefined} />
            <AvatarFallback className="text-xl md:text-2xl">
              {user.name?.charAt(0) || user.username.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold truncate">{user.name || user.username}</h1>
              {user.verified && (
                <BadgeCheck className="h-5 w-5 text-blue-500 shrink-0" />
              )}
              {user.role === "ADMIN" && (
                <Badge variant="default" className="text-xs shrink-0">Admin</Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm flex items-center gap-2 flex-wrap">
              @{user.username}
              {isUnclaimed && (
                <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30 bg-amber-500/10">
                  {t("unclaimedUser")}
                </Badge>
              )}
            </p>
          </div>
          {/* Edit button - desktop only */}
          {isOwner && (
            <Button variant="outline" size="sm" asChild className="hidden md:inline-flex shrink-0">
              <Link href="/settings">
                <Settings className="h-4 w-4 mr-1.5" />
                {t("editProfile")}
              </Link>
            </Button>
          )}
        </div>

        {/* Stats - stacked on mobile, inline on desktop */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6 text-sm">
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{user._count.prompts}</span>
            <span className="text-muted-foreground">{t("prompts").toLowerCase()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ArrowBigUp className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{totalUpvotes}</span>
            <span className="text-muted-foreground">{t("upvotesReceived")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{user._count.contributions}</span>
            <span className="text-muted-foreground">{t("contributionsCount")}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{t("joined")} {formatDistanceToNow(user.createdAt, locale)}</span>
          </div>
        </div>

        {/* Edit button - below stats on mobile */}
        {isOwner && (
          <div className="md:hidden">
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/settings">
                <Settings className="h-4 w-4 mr-1.5" />
                {t("editProfile")}
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Tabs for Prompts and Change Requests */}
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="prompts" className="gap-2">
            <FileText className="h-4 w-4" />
            {t("prompts")}
          </TabsTrigger>
          <TabsTrigger value="contributions" className="gap-2">
            <Users className="h-4 w-4" />
            {t("contributions")}
            {contributions.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-xs">
                {contributions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="changes" className="gap-2">
            <GitPullRequest className="h-4 w-4" />
            {tChanges("title")}
            {isOwner && pendingCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1 text-xs">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prompts">
          {/* Pinned Prompts Section */}
          {pinnedPrompts.length > 0 && (
            <div className="mb-6 pb-6 border-b">
              <div className="flex items-center gap-2 mb-3">
                <Pin className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-medium">{tPrompts("pinnedPrompts")}</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pinnedPrompts.map((prompt: PromptCardProps["prompt"]) => (
                  <PromptCard key={prompt.id} prompt={prompt} showPinButton={isOwner} isPinned={isOwner} />
                ))}
              </div>
            </div>
          )}

          {prompts.length === 0 && pinnedPrompts.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/30">
              <p className="text-muted-foreground">{isOwner ? t("noPromptsOwner") : t("noPrompts")}</p>
              {isOwner && (
                <Button asChild className="mt-4" size="sm">
                  <Link href="/prompts/new">{t("createFirstPrompt")}</Link>
                </Button>
              )}
            </div>
          ) : prompts.length > 0 ? (
            <>
              {pinnedPrompts.length > 0 && (
                <h3 className="text-sm font-medium mb-3">{t("allPrompts")}</h3>
              )}
              <PromptList
                prompts={prompts}
                currentPage={page}
                totalPages={totalPages}
                pinnedIds={pinnedIds}
                showPinButton={isOwner}
              />
            </>
          ) : null}
        </TabsContent>

        <TabsContent value="contributions">
          {contributions.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/30">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{isOwner ? t("noContributionsOwner") : t("noContributions")}</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {contributions.map((prompt: PromptCardProps["prompt"]) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="changes">
          {allChangeRequests.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/30">
              <GitPullRequest className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{tChanges("noRequests")}</p>
            </div>
          ) : (
            <div className="divide-y border rounded-lg">
              {allChangeRequests.map((cr) => {
                const StatusIcon = statusIcons[cr.status as keyof typeof statusIcons];
                return (
                  <Link 
                    key={cr.id} 
                    href={`/prompts/${cr.prompt.id}/changes/${cr.id}`}
                    className="flex items-center justify-between px-3 py-2 hover:bg-accent/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{cr.prompt.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {cr.type === "submitted" 
                          ? tChanges("submittedTo", { author: cr.prompt.author?.name || cr.prompt.author?.username })
                          : tChanges("receivedFrom", { author: cr.author.name || cr.author.username })
                        }
                        {" · "}
                        {formatDistanceToNow(cr.createdAt, locale)}
                      </p>
                    </div>
                    <Badge className={`ml-2 shrink-0 ${statusColors[cr.status as keyof typeof statusColors]}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {tChanges(cr.status.toLowerCase())}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
