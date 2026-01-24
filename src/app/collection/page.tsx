import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Bookmark, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { PromptList } from "@/components/prompts/prompt-list";

export default async function CollectionPage() {
  const t = await getTranslations("collection");
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const collectionsRaw = await db.collection.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      prompt: {
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
      },
    },
  });

  const prompts = collectionsRaw
    .filter((c) => c.prompt && !c.prompt.deletedAt)
    .map((c) => ({
      ...c.prompt,
      voteCount: c.prompt._count?.votes ?? 0,
      contributorCount: c.prompt._count?.contributors ?? 0,
    }));

  return (
    <div className="container py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-lg font-semibold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/prompts">
              {t("browsePrompts")}
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

      {prompts.length > 0 ? (
        <PromptList prompts={prompts} currentPage={1} totalPages={1} />
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <Bookmark className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h2 className="font-medium mb-1">{t("emptyTitle")}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {t("emptyDescription")}
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/prompts">{t("browsePrompts")}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
