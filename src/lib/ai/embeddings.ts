import OpenAI from "openai";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getConfig } from "@/lib/config";

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getOpenAIClient();
  
  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  
  return response.data[0].embedding;
}

export async function generatePromptEmbedding(promptId: string): Promise<void> {
  const config = await getConfig();
  if (!config.features.aiSearch) return;

  const prompt = await db.prompt.findUnique({
    where: { id: promptId },
    select: { title: true, description: true, content: true },
  });

  if (!prompt) return;

  // Combine title, description, and content for embedding
  const textToEmbed = [
    prompt.title,
    prompt.description || "",
    prompt.content,
  ].join("\n\n").trim();

  try {
    const embedding = await generateEmbedding(textToEmbed);
    
    await db.prompt.update({
      where: { id: promptId },
      data: { embedding },
    });
  } catch (error) {
    console.error(`Failed to generate embedding for prompt ${promptId}:`, error);
  }
}

export async function generateAllEmbeddings(): Promise<{ success: number; failed: number }> {
  const config = await getConfig();
  if (!config.features.aiSearch) {
    throw new Error("AI Search is not enabled");
  }

  const prompts = await db.prompt.findMany({
    where: { 
      embedding: { equals: Prisma.DbNull },
      isPrivate: false,
      deletedAt: null,
    },
    select: { id: true },
  });

  let success = 0;
  let failed = 0;

  for (const prompt of prompts) {
    try {
      await generatePromptEmbedding(prompt.id);
      success++;
    } catch {
      failed++;
    }
  }

  return { success, failed };
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export interface SemanticSearchResult {
  id: string;
  title: string;
  description: string | null;
  content: string;
  similarity: number;
  author: {
    id: string;
    name: string | null;
    username: string;
    avatar: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
      color: string;
    };
  }>;
  voteCount: number;
  type: string;
  structuredFormat: string | null;
  mediaUrl: string | null;
  isPrivate: boolean;
  createdAt: Date;
}

export async function semanticSearch(
  query: string,
  limit: number = 20
): Promise<SemanticSearchResult[]> {
  const config = await getConfig();
  if (!config.features.aiSearch) {
    throw new Error("AI Search is not enabled");
  }

  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);

  // Fetch all public prompts with embeddings (excluding soft-deleted)
  const prompts = await db.prompt.findMany({
    where: {
      isPrivate: false,
      deletedAt: null,
      embedding: { not: Prisma.DbNull },
    },
    select: {
      id: true,
      title: true,
      description: true,
      content: true,
      type: true,
      structuredFormat: true,
      mediaUrl: true,
      isPrivate: true,
      createdAt: true,
      embedding: true,
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
        select: { votes: true },
      },
    },
  });

  // Calculate similarity scores
  const scoredPrompts = prompts.map((prompt) => {
    const embedding = prompt.embedding as number[];
    const similarity = cosineSimilarity(queryEmbedding, embedding);
    return {
      ...prompt,
      similarity,
      voteCount: prompt._count.votes,
    };
  });

  // Sort by similarity and return top results
  scoredPrompts.sort((a, b) => b.similarity - a.similarity);

  return scoredPrompts.slice(0, limit).map(({ _count, embedding, ...rest }) => rest);
}

export async function isAISearchEnabled(): Promise<boolean> {
  const config = await getConfig();
  return config.features.aiSearch === true && !!process.env.OPENAI_API_KEY;
}
