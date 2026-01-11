import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const PROMPTS_URL = 'https://prompts.chat/prompts.json';
const CACHE_DIR = join(homedir(), '.prompts-chat');
const CACHE_FILE = join(CACHE_DIR, 'prompts.json');

export interface Prompt {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'SKILL';
  mediaUrl: string | null;
  voteCount: number;
  viewCount: number;
  author: {
    username: string;
    name: string | null;
    avatar: string | null;
    verified: boolean;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
}

interface CachedData {
  prompts: Prompt[];
  fetchedAt: number;
}

let cachedPrompts: Prompt[] | null = null;

function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function loadFromCache(): Prompt[] | null {
  try {
    if (existsSync(CACHE_FILE)) {
      const data = JSON.parse(readFileSync(CACHE_FILE, 'utf-8')) as CachedData;
      return data.prompts;
    }
  } catch {
    // Ignore cache read errors
  }
  return null;
}

function saveToCache(prompts: Prompt[]) {
  try {
    ensureCacheDir();
    const data: CachedData = { prompts, fetchedAt: Date.now() };
    writeFileSync(CACHE_FILE, JSON.stringify(data));
  } catch {
    // Ignore cache write errors
  }
}

export async function loadPrompts(): Promise<Prompt[]> {
  // Return cached prompts if already loaded
  if (cachedPrompts) {
    return cachedPrompts;
  }

  // Try to fetch fresh data
  try {
    const response = await fetch(PROMPTS_URL);
    if (response.ok) {
      const data = await response.json();
      cachedPrompts = data.prompts as Prompt[];
      saveToCache(cachedPrompts);
      return cachedPrompts;
    }
  } catch {
    // Network error, try cache
  }

  // Fall back to local cache
  const cached = loadFromCache();
  if (cached) {
    cachedPrompts = cached;
    return cachedPrompts;
  }

  throw new Error('No prompts available. Please check your internet connection.');
}

export function getCategories(prompts: Prompt[]): Category[] {
  const categoryMap = new Map<string, Category>();
  
  for (const prompt of prompts) {
    if (prompt.category) {
      const existing = categoryMap.get(prompt.category.slug);
      if (existing) {
        existing.count++;
      } else {
        categoryMap.set(prompt.category.slug, {
          id: prompt.category.id,
          name: prompt.category.name,
          slug: prompt.category.slug,
          count: 1,
        });
      }
    }
  }
  
  return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function filterPrompts(prompts: Prompt[], options: {
  q?: string;
  category?: string;
  page?: number;
  perPage?: number;
}): { prompts: Prompt[]; total: number; page: number; perPage: number; totalPages: number } {
  let filtered = prompts;
  
  // Filter by search query
  if (options.q) {
    const query = options.q.toLowerCase();
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.content.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query) ||
      p.author.username.toLowerCase().includes(query) ||
      p.author.name?.toLowerCase().includes(query) ||
      p.tags.some(t => t.name.toLowerCase().includes(query) || t.slug.toLowerCase().includes(query))
    );
  }
  
  // Filter by category
  if (options.category) {
    filtered = filtered.filter(p => p.category?.slug === options.category);
  }
  
  const total = filtered.length;
  const page = options.page || 1;
  const perPage = options.perPage || 20;
  const totalPages = Math.ceil(total / perPage);
  
  // Paginate
  const start = (page - 1) * perPage;
  const paged = filtered.slice(start, start + perPage);
  
  return { prompts: paged, total, page, perPage, totalPages };
}

export function getPrompt(prompts: Prompt[], id: string): Prompt | undefined {
  return prompts.find(p => p.id === id || p.slug === id || `${p.id}_${p.slug}` === id);
}
