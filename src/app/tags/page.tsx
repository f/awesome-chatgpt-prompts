import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { unstable_cache } from "next/cache";
import { Tag } from "lucide-react";
import { db } from "@/lib/db";

// Cached tags query
const getTags = unstable_cache(
  async () => {
    return db.tag.findMany({
      include: {
        _count: {
          select: {
            prompts: {
              where: {
                prompt: {
                  isPrivate: false,
                  isUnlisted: false,
                  deletedAt: null,
                },
              },
            },
          },
        },
      },
      orderBy: {
        prompts: {
          _count: "desc",
        },
      },
    });
  },
  ["tags-page"],
  { tags: ["tags"] }
);

export default async function TagsPage() {
  const t = await getTranslations("tags");

  // Fetch all tags with prompt counts, ordered by popularity (cached)
  const tags = await getTags();

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      {tags.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <Tag className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{t("noTags")}</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              prefetch={false}
              className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors hover:border-foreground/30"
              style={{ 
                backgroundColor: tag.color + "10",
                borderColor: tag.color + "30",
              }}
            >
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: tag.color }}
              />
              <span className="text-sm font-medium group-hover:underline">
                {tag.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {tag._count.prompts}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
