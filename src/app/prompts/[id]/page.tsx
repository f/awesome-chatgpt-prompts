import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { formatDistanceToNow } from "@/lib/date";
import { Calendar, Clock, Copy, Share2, Edit, History, GitPullRequest, Check, X, Users, ImageIcon, Video, FileText, Shield } from "lucide-react";
import { ShareDropdown } from "@/components/prompts/share-dropdown";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { InteractivePromptContent } from "@/components/prompts/interactive-prompt-content";
import { UpvoteButton } from "@/components/prompts/upvote-button";
import { AddVersionForm } from "@/components/prompts/add-version-form";
import { DeleteVersionButton } from "@/components/prompts/delete-version-button";
import { VersionCompareModal } from "@/components/prompts/version-compare-modal";
import { VersionCompareButton } from "@/components/prompts/version-compare-button";
import { FeaturePromptButton } from "@/components/prompts/feature-prompt-button";
import { UnlistPromptButton } from "@/components/prompts/unlist-prompt-button";
import { MediaPreview } from "@/components/prompts/media-preview";
import { ReportPromptDialog } from "@/components/prompts/report-prompt-dialog";

interface PromptPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PromptPageProps): Promise<Metadata> {
  const { id } = await params;
  const prompt = await db.prompt.findUnique({
    where: { id },
    select: { title: true, description: true },
  });

  if (!prompt) {
    return { title: "Prompt Not Found" };
  }

  return {
    title: prompt.title,
    description: prompt.description || `View the prompt: ${prompt.title}`,
  };
}

export default async function PromptPage({ params }: PromptPageProps) {
  const { id } = await params;
  const session = await auth();
  const t = await getTranslations("prompts");
  const locale = await getLocale();

  const prompt = await db.prompt.findFirst({
    where: { id, deletedAt: null },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
        },
      },
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
      versions: {
        orderBy: { version: "desc" },
        select: {
          id: true,
          version: true,
          content: true,
          changeNote: true,
          createdAt: true,
          author: {
            select: {
              name: true,
              username: true,
            },
          },
        },
      },
      _count: {
        select: { votes: true },
      },
      contributors: {
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  // Check if user has voted
  const userVote = session?.user
    ? await db.promptVote.findUnique({
        where: {
          userId_promptId: {
            userId: session.user.id,
            promptId: id,
          },
        },
      })
    : null;

  if (!prompt) {
    notFound();
  }

  // Check if user can view private prompt
  if (prompt.isPrivate && prompt.authorId !== session?.user?.id) {
    notFound();
  }

  // Check if user can view unlisted prompt (only owner and admins can see)
  if (prompt.isUnlisted && prompt.authorId !== session?.user?.id && session?.user?.role !== "ADMIN") {
    notFound();
  }

  const isOwner = session?.user?.id === prompt.authorId;
  const isAdmin = session?.user?.role === "ADMIN";
  const canEdit = isOwner || isAdmin;
  const voteCount = prompt._count?.votes ?? 0;
  const hasVoted = !!userVote;

  // Fetch change requests for this prompt
  const changeRequests = await db.changeRequest.findMany({
    where: { promptId: id },
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
    },
  });

  const pendingCount = changeRequests.filter((cr) => cr.status === "PENDING").length;
  const tChanges = await getTranslations("changeRequests");

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
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-3xl font-bold">{prompt.title}</h1>
            {prompt.isPrivate && (
              <Badge variant="secondary">{t("promptPrivate")}</Badge>
            )}
          </div>
          {prompt.description && (
            <p className="text-muted-foreground">{prompt.description}</p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto sm:shrink-0">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <History className="h-4 w-4" />
              <span>{prompt.versions.length > 0 ? prompt.versions[0].version : 1} {prompt.versions.length === 1 ? t("version") : t("versionsCount")}</span>
            </div>
            {prompt.contributors.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>{prompt.contributors.length + 1} {t("contributors")}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 sm:hidden">
            <UpvoteButton
              promptId={prompt.id}
              initialVoted={hasVoted}
              initialCount={voteCount}
              isLoggedIn={!!session?.user}
              showLabel
            />
            <ShareDropdown title={prompt.title} />
            {isOwner && (
              <Button variant="outline" size="icon" asChild>
                <Link href={`/prompts/${id}/edit`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <UpvoteButton
              promptId={prompt.id}
              initialVoted={hasVoted}
              initialCount={voteCount}
              isLoggedIn={!!session?.user}
              showLabel
            />
            <ShareDropdown title={prompt.title} />
            {isOwner && (
              <Button variant="outline" asChild>
                <Link href={`/prompts/${id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  {t("edit")}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="border-b mb-6 sm:hidden" />

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <Link href={`/@${prompt.author.username}`} title={`@${prompt.author.username}`}>
              <Avatar className="h-6 w-6 border-2 border-background">
                <AvatarImage src={prompt.author.avatar || undefined} />
                <AvatarFallback className="text-xs">{prompt.author.name?.charAt(0) || prompt.author.username.charAt(0)}</AvatarFallback>
              </Avatar>
            </Link>
            {prompt.contributors.map((contributor) => (
              <Link key={contributor.id} href={`/@${contributor.username}`} title={`@${contributor.username}`}>
                <Avatar className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={contributor.avatar || undefined} />
                  <AvatarFallback className="text-xs">{contributor.name?.charAt(0) || contributor.username.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
            ))}
          </div>
          {prompt.contributors.length > 0 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-default">
                  @{prompt.author.username} +{prompt.contributors.length}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="p-2">
                <div className="space-y-1">
                  <div className="text-xs font-medium mb-1.5">{t("promptContributors")}</div>
                  {prompt.contributors.map((contributor) => (
                    <Link
                      key={contributor.id}
                      href={`/@${contributor.username}`}
                      className="flex items-center gap-2 hover:underline rounded px-1 py-0.5 -mx-1"
                    >
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={contributor.avatar || undefined} />
                        <AvatarFallback className="text-[8px]">
                          {contributor.name?.charAt(0) || contributor.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">@{contributor.username}</span>
                    </Link>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <span>@{prompt.author.username}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>{formatDistanceToNow(prompt.createdAt, locale)}</span>
        </div>
        {prompt.category && (
          <Link href={`/categories/${prompt.category.slug}`}>
            <Badge variant="outline">{prompt.category.name}</Badge>
          </Link>
        )}
      </div>

      {/* Tags */}
      {prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {prompt.tags.map(({ tag }) => (
            <Link key={tag.id} href={`/tags/${tag.slug}`}>
              <Badge
                variant="secondary"
                style={{ backgroundColor: tag.color + "20", color: tag.color }}
              >
                {tag.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Content Tabs */}
      <Tabs defaultValue="content">
        <div className="flex flex-col gap-3 mb-4">
          {/* Propose changes button - on top on mobile */}
          {!isOwner && session?.user && (
            <div className="md:hidden">
              <Button asChild size="sm" className="w-full">
                <Link href={`/prompts/${id}/changes/new`}>
                  <GitPullRequest className="h-4 w-4 mr-1.5" />
                  {t("createChangeRequest")}
                </Link>
              </Button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="content">{t("promptContent")}</TabsTrigger>
              <TabsTrigger value="versions">
                <History className="h-4 w-4 mr-1" />
                {t("versions")}
              </TabsTrigger>
              {changeRequests.length > 0 && (
                <TabsTrigger value="changes" className="gap-1">
                  <GitPullRequest className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("changeRequests")}</span>
                  {pendingCount > 0 && (
                    <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1 text-xs">
                      {pendingCount}
                    </Badge>
                  )}
                </TabsTrigger>
              )}
            </TabsList>
            {/* Propose changes button - inline on desktop */}
            {!isOwner && session?.user && (
              <Button asChild size="sm" className="hidden md:inline-flex">
                <Link href={`/prompts/${id}/changes/new`}>
                  <GitPullRequest className="h-4 w-4 mr-1.5" />
                  {t("createChangeRequest")}
                </Link>
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="content" className="space-y-4 mt-0">
          {/* Media Preview (for image/video prompts) */}
          {prompt.mediaUrl && (
            <MediaPreview 
              mediaUrl={prompt.mediaUrl} 
              title={prompt.title} 
              type={prompt.type} 
            />
          )}

          {/* Prompt Text Content */}
          <div>
            {prompt.requiresMediaUpload && prompt.requiredMediaType && prompt.requiredMediaCount && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 mb-3">
                {prompt.requiredMediaType === "IMAGE" && <ImageIcon className="h-3.5 w-3.5" />}
                {prompt.requiredMediaType === "VIDEO" && <Video className="h-3.5 w-3.5" />}
                {prompt.requiredMediaType === "DOCUMENT" && <FileText className="h-3.5 w-3.5" />}
                <span className="text-xs font-medium">
                  {prompt.requiredMediaType === "IMAGE" 
                    ? t("requiresImage", { count: prompt.requiredMediaCount })
                    : prompt.requiredMediaType === "VIDEO"
                    ? t("requiresVideo", { count: prompt.requiredMediaCount })
                    : t("requiresDocument", { count: prompt.requiredMediaCount })}
                </span>
              </div>
            )}
            {prompt.type === "STRUCTURED" ? (
              <InteractivePromptContent 
                content={prompt.content} 
                isStructured={true}
                structuredFormat={(prompt.structuredFormat?.toLowerCase() as "json" | "yaml") || "json"}
                title={t("promptContent")}
              />
            ) : (
              <InteractivePromptContent content={prompt.content} title={t("promptContent")} />
            )}
          </div>
          {/* Report link */}
          {!isOwner && (
            <div className="flex justify-end pt-2">
              <ReportPromptDialog promptId={prompt.id} isLoggedIn={!!session?.user} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="versions" className="mt-0">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold">{t("versionHistory")}</h3>
              <div className="flex items-center gap-2">
                <VersionCompareModal 
                  versions={prompt.versions} 
                  currentContent={prompt.content}
                  promptType={prompt.type}
                  structuredFormat={prompt.structuredFormat}
                />
                {canEdit && (
                  <AddVersionForm promptId={prompt.id} currentContent={prompt.content} />
                )}
              </div>
            </div>
            {prompt.versions.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">{t("noVersions")}</p>
            ) : (
              <div className="divide-y border rounded-lg">
                {prompt.versions.map((version, index) => {
                  const isLatestVersion = index === 0;
                  return (
                    <div
                      key={version.id}
                      className="px-4 py-3 flex items-start gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">v{version.version}</span>
                          {isLatestVersion && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                              {t("currentVersion")}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(version.createdAt, locale)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            by @{version.author.username}
                          </span>
                        </div>
                        {version.changeNote && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {version.changeNote}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!isLatestVersion && (
                          <VersionCompareButton
                            versionContent={version.content}
                            versionNumber={version.version}
                            currentContent={prompt.content}
                            promptType={prompt.type}
                            structuredFormat={prompt.structuredFormat}
                          />
                        )}
                        {canEdit && !isLatestVersion && (
                          <DeleteVersionButton
                            promptId={prompt.id}
                            versionId={version.id}
                            versionNumber={version.version}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {changeRequests.length > 0 && (
          <TabsContent value="changes" className="mt-0">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold">{t("changeRequests")}</h3>
              </div>
              <div className="divide-y border rounded-lg">
                {changeRequests.map((cr) => {
                  const StatusIcon = statusIcons[cr.status];
                  const hasTitleChange = cr.proposedTitle && cr.proposedTitle !== cr.originalTitle;
                  return (
                    <Link 
                      key={cr.id} 
                      href={`/prompts/${id}/changes/${cr.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      <div className={`p-1.5 rounded-full shrink-0 ${
                        cr.status === "PENDING" 
                          ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" 
                          : cr.status === "APPROVED"
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : "bg-red-500/10 text-red-600 dark:text-red-400"
                      }`}>
                        <StatusIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">
                            {hasTitleChange ? (
                              <>
                                <span className="line-through text-muted-foreground">{cr.originalTitle}</span>
                                {" → "}
                                <span>{cr.proposedTitle}</span>
                              </>
                            ) : (
                              tChanges("contentChanges")
                            )}
                          </span>
                        </div>
                        {cr.reason && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {cr.reason}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={cr.author.avatar || undefined} />
                            <AvatarFallback className="text-[9px]">
                              {cr.author.name?.[0] || cr.author.username[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="hidden sm:inline">@{cr.author.username}</span>
                        </div>
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          {formatDistanceToNow(cr.createdAt, locale)}
                        </span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${statusColors[cr.status]}`}>
                          {tChanges(cr.status.toLowerCase())}
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Admin Area */}
      {isAdmin && (
        <div className="mt-8 p-4 rounded-lg border border-red-500/30 bg-red-500/5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-red-500" />
            <h3 className="text-sm font-semibold text-red-500">{t("adminArea")}</h3>
          </div>
          <div className="flex items-center gap-3">
            <FeaturePromptButton
              promptId={prompt.id}
              isFeatured={prompt.isFeatured}
            />
            <UnlistPromptButton
              promptId={prompt.id}
              isUnlisted={prompt.isUnlisted}
            />
            <Button variant="outline" size="sm" asChild>
              <Link href={`/prompts/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                {t("edit")}
              </Link>
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
