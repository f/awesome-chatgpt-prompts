export interface Author {
  id: string;
  name: string | null;
  username: string;
  avatar: string | null;
  verified: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface PromptTag {
  tag: Tag;
}

export interface Prompt {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "SKILL";
  mediaUrl: string | null;
  createdAt: string;
  updatedAt: string;
  author: Author;
  category: Category | null;
  tags: PromptTag[];
  voteCount: number;
  viewCount?: number;
  isFeatured?: boolean;
}

export interface PromptsResponse {
  prompts: Prompt[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface SearchPromptsResponse {
  prompts: {
    id: string;
    title: string;
    slug: string;
    author: {
      username: string;
    };
  }[];
}

// Preferences are auto-generated from package.json - import from @raycast/api
// import { getPreferenceValues } from "@raycast/api";
// const preferences = getPreferenceValues<Preferences>();
