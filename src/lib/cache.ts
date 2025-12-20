import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";

// Cache tags for prompts
export const CACHE_TAGS = {
  PROMPTS: "prompts",
  PROMPTS_LIST: "prompts-list",
  CATEGORIES: "categories",
  TAGS: "tags",
} as const;

// Revalidate prompts cache - call this when prompts are created, updated, deleted, or unlisted
export function revalidatePrompts() {
  revalidateTag(CACHE_TAGS.PROMPTS, "max");
  revalidateTag(CACHE_TAGS.PROMPTS_LIST, "max");
}

// Helper to create cached database queries with prompts tag
export function createCachedQuery<T, Args extends unknown[]>(
  queryFn: (...args: Args) => Promise<T>,
  keyParts: string[],
  tags: string[] = [CACHE_TAGS.PROMPTS],
  revalidateSeconds: number = 60
) {
  return unstable_cache(queryFn, keyParts, {
    tags,
    revalidate: revalidateSeconds,
  });
}
