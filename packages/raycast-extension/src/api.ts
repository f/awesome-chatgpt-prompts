import { getPreferenceValues } from "@raycast/api";
import type { Prompt, PromptsResponse } from "./types";

interface PromptsChatPreferences {
  baseUrl?: string;
}

function getBaseUrl(): string {
  const { baseUrl } = getPreferenceValues<PromptsChatPreferences>();
  return baseUrl?.replace(/\/$/, "") || "https://prompts.chat";
}

export async function fetchPrompts(options: {
  page?: number;
  perPage?: number;
  type?: string;
  category?: string;
  tag?: string;
  sort?: string;
  q?: string;
}): Promise<PromptsResponse> {
  const baseUrl = getBaseUrl();
  const params = new URLSearchParams();

  if (options.page) params.set("page", options.page.toString());
  if (options.perPage) params.set("perPage", options.perPage.toString());
  if (options.type) params.set("type", options.type);
  if (options.category) params.set("category", options.category);
  if (options.tag) params.set("tag", options.tag);
  if (options.sort) params.set("sort", options.sort);
  if (options.q) params.set("q", options.q);

  const url = `${baseUrl}/api/prompts?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch prompts: ${response.statusText}`);
  }

  return response.json() as Promise<PromptsResponse>;
}

export async function fetchPromptBySlug(
  username: string,
  slug: string,
): Promise<Prompt | null> {
  const baseUrl = getBaseUrl();

  const response = await fetch(`${baseUrl}/api/prompts/${slug}`);

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch prompt: ${response.statusText}`);
  }

  return response.json() as Promise<Prompt>;
}

export async function searchPrompts(
  query: string,
  limit: number = 20,
): Promise<
  { id: string; title: string; slug: string; author: { username: string } }[]
> {
  if (query.length < 2) {
    return [];
  }

  const baseUrl = getBaseUrl();
  const params = new URLSearchParams({
    q: query,
    limit: limit.toString(),
  });

  const url = `${baseUrl}/api/prompts/search?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to search prompts: ${response.statusText}`);
  }

  const data = (await response.json()) as {
    prompts: {
      id: string;
      title: string;
      slug: string;
      author: { username: string };
    }[];
  };
  return data.prompts;
}

export function getPromptUrl(username: string, slug: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/${username}/${slug}`;
}

export function getWebsiteUrl(): string {
  return getBaseUrl();
}
