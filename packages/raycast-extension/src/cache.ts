import { LocalStorage } from "@raycast/api";
import type { Prompt } from "./types";
import { getWebsiteUrl } from "./api";

const PROMPTS_CACHE_KEY = "cached_prompts";
const CACHE_TIMESTAMP_KEY = "cached_prompts_timestamp";

export interface CachedPrompt {
  id: string;
  title: string;
  content: string;
  description?: string;
  type: string;
  author: {
    username: string;
    name?: string;
  };
  slug: string;
  category?: {
    name: string;
    slug: string;
  };
  tags: string[];
  voteCount: number;
}

export async function getCachedPrompts(): Promise<CachedPrompt[]> {
  const cached = await LocalStorage.getItem<string>(PROMPTS_CACHE_KEY);
  if (!cached) return [];
  try {
    return JSON.parse(cached) as CachedPrompt[];
  } catch {
    return [];
  }
}

export async function setCachedPrompts(prompts: CachedPrompt[]): Promise<void> {
  await LocalStorage.setItem(PROMPTS_CACHE_KEY, JSON.stringify(prompts));
  await LocalStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
}

export async function getCacheTimestamp(): Promise<number | null> {
  const timestamp = await LocalStorage.getItem<string>(CACHE_TIMESTAMP_KEY);
  return timestamp ? parseInt(timestamp, 10) : null;
}

export async function clearCache(): Promise<void> {
  await LocalStorage.removeItem(PROMPTS_CACHE_KEY);
  await LocalStorage.removeItem(CACHE_TIMESTAMP_KEY);
}

interface PromptsJsonResponse {
  count: number;
  prompts: Array<{
    id: string;
    title: string;
    slug: string;
    description: string | null;
    content: string;
    type: string;
    voteCount: number;
    category: {
      id: string;
      name: string;
      slug: string;
    } | null;
    author: {
      username: string;
      name: string | null;
    };
    tags: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  }>;
}

export async function downloadAllPrompts(): Promise<CachedPrompt[]> {
  const url = `${getWebsiteUrl()}/prompts.json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch prompts: ${response.statusText}`);
  }

  const data = (await response.json()) as PromptsJsonResponse;

  const prompts: CachedPrompt[] = data.prompts.map((item) => ({
    id: item.id,
    title: item.title,
    content: item.content,
    description: item.description || undefined,
    type: item.type,
    author: {
      username: item.author.username,
      name: item.author.name || undefined,
    },
    slug: item.slug,
    category: item.category
      ? { name: item.category.name, slug: item.category.slug }
      : undefined,
    tags: item.tags.map((t) => t.name),
    voteCount: item.voteCount,
  }));

  await setCachedPrompts(prompts);
  return prompts;
}

export function searchPrompts(
  prompts: CachedPrompt[],
  query: string,
): CachedPrompt[] {
  if (!query.trim()) return prompts;

  const lowerQuery = query.toLowerCase();
  return prompts.filter(
    (p) =>
      p.title.toLowerCase().includes(lowerQuery) ||
      p.content.toLowerCase().includes(lowerQuery) ||
      (p.description && p.description.toLowerCase().includes(lowerQuery)) ||
      p.author.username.toLowerCase().includes(lowerQuery) ||
      (p.author.name && p.author.name.toLowerCase().includes(lowerQuery)) ||
      (p.category && p.category.name.toLowerCase().includes(lowerQuery)) ||
      p.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
  );
}

export function convertToPrompt(cached: CachedPrompt): Prompt {
  return {
    id: cached.id,
    title: cached.title,
    content: cached.content,
    description: cached.description || null,
    type: cached.type as Prompt["type"],
    mediaUrl: null,
    author: {
      id: "local",
      username: cached.author.username,
      name: cached.author.name || null,
      avatar: null,
      verified: false,
    },
    slug: cached.slug,
    category: cached.category
      ? {
          id: "local",
          name: cached.category.name,
          slug: cached.category.slug,
          parent: null,
        }
      : null,
    tags: cached.tags.map((tag, i) => ({
      tag: { id: `tag-${i}`, name: tag, slug: tag.toLowerCase() },
    })),
    voteCount: cached.voteCount,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
