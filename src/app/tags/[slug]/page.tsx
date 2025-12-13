import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Tag } from "lucide-react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { PromptCard } from "@/components/prompts/prompt-card";

interface TagPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: TagPageProps) {
  const { slug } = await params;
  const tag = await db.tag.findUnique({
    where: { slug },
    select: { name: true },
  });

  if (!tag) return { title: "Tag Not Found" };

  return {
    title: `${tag.name} - Tags`,
    description: `Browse prompts tagged with ${tag.name}`,
  };
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const session = await auth();
  const t = await getTranslations("tags");
  const tPrompts = await getTranslations("prompts");

  const tag = await db.tag.findUnique({
    where: { slug },
  });

  if (!tag) {
    notFound();
  }

  const page = Math.max(1, parseInt(pageParam || "1"));
  const perPage = 12;

  // Build where clause
  const where = {
    tags: {
      some: { tagId: tag.id },
    },
    isUnlisted: false,
    deletedAt: null,
    OR: session?.user
      ? [{ isPrivate: false }, { authorId: session.user.id }]
      : [{ isPrivate: false }],
  };

  // Fetch prompts with this tag
  const [promptsRaw, total] = await Promise.all([
    db.prompt.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
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
    }),
    db.prompt.count({ where }),
  ]);

  const prompts = promptsRaw.map((p) => ({
    ...p,
    voteCount: p._count.votes,
    contributorCount: p._count.contributors,
  }));

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="container py-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href="/tags">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {t("allTags")}
          </Link>
        </Button>

        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: tag.color }}
          />
          <h1 className="text-xl font-semibold">{tag.name}</h1>
          <span className="text-sm text-muted-foreground">
            {total} {t("prompts")}
          </span>
        </div>
      </div>

      {/* Prompts Grid */}
      {prompts.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <Tag className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {tPrompts("noPrompts")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
            {prompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={page <= 1}
                asChild={page > 1}
              >
                {page > 1 ? (
                  <Link href={`/tags/${slug}?page=${page - 1}`}>
                    {tPrompts("previous")}
                  </Link>
                ) : (
                  <span>{tPrompts("previous")}</span>
                )}
              </Button>
              <span className="text-xs text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={page >= totalPages}
                asChild={page < totalPages}
              >
                {page < totalPages ? (
                  <Link href={`/tags/${slug}?page=${page + 1}`}>
                    {tPrompts("next")}
                  </Link>
                ) : (
                  <span>{tPrompts("next")}</span>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
