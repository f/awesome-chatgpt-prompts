import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { formatDistanceToNow } from "@/lib/date";
import { ArrowLeft, History, GitPullRequest, Clock, Check, X } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VersionCompareModal } from "@/components/prompts/version-compare-modal";
import { VersionCompareButton } from "@/components/prompts/version-compare-button";
import { AddVersionForm } from "@/components/prompts/add-version-form";
import { DeleteVersionButton } from "@/components/prompts/delete-version-button";
import { VersionDiffInline } from "@/components/prompts/version-diff-inline";

interface VersionsPageProps {
  params: Promise<{ id: string }>;
}

function extractPromptId(idParam: string): string {
  let param = idParam;
  if (param.endsWith(".prompt.md")) {
    param = param.slice(0, -".prompt.md".length);
  }
  const underscoreIndex = param.indexOf("_");
  if (underscoreIndex !== -1) {
    return param.substring(0, underscoreIndex);
  }
  return param;
}

export default async function VersionsPage({ params }: VersionsPageProps) {
  const { id: idParam } = await params;
  const id = extractPromptId(idParam);
  const session = await auth();
  const t = await getTranslations("prompts");
  const tVersions = await getTranslations("versionHistory");
  const tChanges = await getTranslations("changeRequests");
  const locale = await getLocale();

  const prompt = await db.prompt.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      authorId: true,
      type: true,
      structuredFormat: true,
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
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
      },
    },
  });

  if (!prompt) {
    notFound();
  }

  const isOwner = session?.user?.id === prompt.authorId;
  const isAdmin = session?.user?.role === "ADMIN";
  const canEdit = isOwner || isAdmin;

  // Fetch pending change requests
  const changeRequests = await db.changeRequest.findMany({
    where: { promptId: id, status: "PENDING" },
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

  return (
    <div className="container max-w-3xl py-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href={`/prompts/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {prompt.title}
          </Link>
        </Button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold">{tVersions("title")}</h1>
            <Badge variant="secondary">
              {prompt.versions.length > 0 ? prompt.versions[0].version : 1} {prompt.versions.length === 1 ? tVersions("versionSingular") : tVersions("versionPlural")}
            </Badge>
          </div>
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
      </div>

      {/* Open Change Requests */}
      {changeRequests.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
            <GitPullRequest className="h-4 w-4 inline mr-1.5" />
            {tVersions("openChangeRequests")} ({changeRequests.length})
          </h2>
          <div className="divide-y border rounded-lg">
            {changeRequests.map((cr) => (
              <Link
                key={cr.id}
                href={`/prompts/${id}/changes/${cr.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                <div className="p-1.5 rounded-full shrink-0 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">
                    {cr.proposedTitle && cr.proposedTitle !== cr.originalTitle
                      ? cr.proposedTitle
                      : tChanges("contentChanges")}
                  </span>
                  {cr.reason && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{cr.reason}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={cr.author.avatar || ""} />
                    <AvatarFallback className="text-[9px]">
                      {cr.author.name?.[0] || cr.author.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">@{cr.author.username}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Version Timeline */}
      {prompt.versions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <History className="h-8 w-8 mx-auto mb-3 opacity-50" />
          <p>{t("noVersions")}</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-8 bottom-4 w-px bg-border" />

          <div className="space-y-0">
            {/* Current version marker */}
            <div className="relative flex items-start gap-4 pb-6">
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-4 w-4" />
              </div>
              <div className="flex-1 pt-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{t("currentVersion")}</span>
                  <Badge variant="secondary" className="text-xs">v{(prompt.versions[0]?.version || 0) + 1}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{tVersions("liveVersion")}</p>
              </div>
            </div>

            {/* Version entries */}
            {prompt.versions.map((version, index) => {
              const previousVersion = prompt.versions[index + 1];
              const isLatest = index === 0;

              return (
                <div key={version.id} className="relative flex items-start gap-4 pb-6">
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-border bg-background text-muted-foreground">
                    <span className="text-xs font-bold">{version.version}</span>
                  </div>
                  <div className="flex-1 border rounded-lg overflow-hidden">
                    {/* Version header */}
                    <div className="px-4 py-3 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={version.author.avatar || ""} />
                            <AvatarFallback className="text-[9px]">
                              {version.author.name?.[0] || version.author.username[0]}
                            </AvatarFallback>
                          </Avatar>
                          <Link
                            href={`/@${version.author.username}`}
                            className="text-sm font-medium hover:underline"
                          >
                            @{version.author.username}
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(version.createdAt, locale)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {!isLatest && (
                            <VersionCompareButton
                              versionContent={version.content}
                              versionNumber={version.version}
                              currentContent={prompt.content}
                              promptType={prompt.type}
                              structuredFormat={prompt.structuredFormat}
                            />
                          )}
                          {canEdit && !isLatest && (
                            <DeleteVersionButton
                              promptId={prompt.id}
                              versionId={version.id}
                              versionNumber={version.version}
                            />
                          )}
                        </div>
                      </div>
                      {version.changeNote && (
                        <p className="text-sm mt-1">{version.changeNote}</p>
                      )}
                    </div>

                    {/* Inline diff to previous version */}
                    {previousVersion && (
                      <VersionDiffInline
                        originalContent={previousVersion.content}
                        modifiedContent={version.content}
                      />
                    )}
                    {!previousVersion && (
                      <div className="px-4 py-2 text-xs text-muted-foreground bg-muted/10">
                        {tVersions("initialVersion")}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
