import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";

export async function resolvePromptTagConnections(
  tagIds: string[] = [],
  tagNames: string[] = []
) {
  const connections: { tagId: string }[] = [];
  const seenTagIds = new Set<string>();

  for (const tagId of tagIds) {
    if (tagId && !seenTagIds.has(tagId)) {
      connections.push({ tagId });
      seenTagIds.add(tagId);
    }
  }

  const seenTagSlugs = new Set<string>();
  for (const rawName of tagNames) {
    const name = rawName.trim();
    const slug = slugify(name);

    if (!slug || seenTagSlugs.has(slug)) {
      continue;
    }

    seenTagSlugs.add(slug);
    const tag = await db.tag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });

    if (!seenTagIds.has(tag.id)) {
      connections.push({ tagId: tag.id });
      seenTagIds.add(tag.id);
    }
  }

  return connections;
}
