import { PrismaClient, PromptType, StructuredFormat, RequiredMediaType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PROMPTS_JSON_URL = "https://prompts.chat/prompts.json";

interface RemotePrompt {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  type: string;
  structuredFormat: string | null;
  mediaUrl: string | null;
  viewCount: number;
  voteCount: number;
  commentCount: number;
  isFeatured: boolean;
  featuredAt: string | null;
  requiresMediaUpload: boolean;
  requiredMediaType: string | null;
  requiredMediaCount: number | null;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
  } | null;
  author: {
    username: string;
    name: string | null;
    avatar: string | null;
    identifier: string;
    verified: boolean;
  };
  contributors: Array<{
    username: string;
    name: string | null;
    avatar: string | null;
    identifier: string;
    verified: boolean;
  }>;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
    color: string;
  }>;
}

interface RemotePromptsResponse {
  count: number;
  prompts: RemotePrompt[];
}

async function fetchPrompts(): Promise<RemotePromptsResponse> {
  console.log(`📡 Fetching prompts from ${PROMPTS_JSON_URL}...`);
  const response = await fetch(PROMPTS_JSON_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch prompts: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  console.log(`✅ Fetched ${data.count} prompts`);
  return data;
}

async function main() {
  console.log("🌱 Seeding database from prompts.chat...");

  // Create admin user for assigning prompts
  const password = await bcrypt.hash("password123", 12);
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@prompts.chat" },
    update: {},
    create: {
      email: "admin@prompts.chat",
      username: "admin",
      name: "Admin User",
      password: password,
      role: "ADMIN",
      locale: "en",
    },
  });

  console.log("✅ Created admin user");

  // Fetch prompts from remote JSON
  const { prompts: remotePrompts } = await fetchPrompts();

  // Extract unique categories from remote prompts
  const categoryMap = new Map<string, { name: string; slug: string; icon: string | null }>();
  for (const prompt of remotePrompts) {
    if (prompt.category) {
      categoryMap.set(prompt.category.slug, {
        name: prompt.category.name,
        slug: prompt.category.slug,
        icon: prompt.category.icon,
      });
    }
  }

  // Create categories
  console.log(`📁 Creating ${categoryMap.size} categories...`);
  const categoryIdMap = new Map<string, string>();
  let categoryOrder = 1;
  for (const [slug, cat] of categoryMap) {
    const category = await prisma.category.upsert({
      where: { slug },
      update: { name: cat.name, icon: cat.icon },
      create: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        order: categoryOrder++,
      },
    });
    categoryIdMap.set(slug, category.id);
  }
  console.log(`✅ Created ${categoryMap.size} categories`);

  // Extract unique tags from remote prompts
  const tagMap = new Map<string, { name: string; slug: string; color: string }>();
  for (const prompt of remotePrompts) {
    for (const tag of prompt.tags) {
      tagMap.set(tag.slug, {
        name: tag.name,
        slug: tag.slug,
        color: tag.color,
      });
    }
  }

  // Create tags
  console.log(`🏷️  Creating ${tagMap.size} tags...`);
  const tagIdMap = new Map<string, string>();
  for (const [slug, tag] of tagMap) {
    const createdTag = await prisma.tag.upsert({
      where: { slug },
      update: { name: tag.name, color: tag.color },
      create: {
        name: tag.name,
        slug: tag.slug,
        color: tag.color,
      },
    });
    tagIdMap.set(slug, createdTag.id);
  }
  console.log(`✅ Created ${tagMap.size} tags`);

  // Extract unique authors from remote prompts and create users
  const authorMap = new Map<string, { username: string; name: string | null; avatar: string | null; verified: boolean }>();
  for (const prompt of remotePrompts) {
    if (!authorMap.has(prompt.author.username)) {
      authorMap.set(prompt.author.username, {
        username: prompt.author.username,
        name: prompt.author.name,
        avatar: prompt.author.avatar,
        verified: prompt.author.verified,
      });
    }
  }

  // Create users for authors
  console.log(`👤 Creating ${authorMap.size} users...`);
  const userIdMap = new Map<string, string>();
  for (const [username, author] of authorMap) {
    // Skip creating if it's the admin
    if (username === "admin") {
      userIdMap.set(username, admin.id);
      continue;
    }
    
    const user = await prisma.user.upsert({
      where: { username },
      update: { name: author.name, avatar: author.avatar },
      create: {
        email: `${username}@prompts.chat`,
        username: author.username,
        name: author.name,
        avatar: author.avatar,
        password: password,
        role: "USER",
        locale: "en",
      },
    });
    userIdMap.set(username, user.id);
  }
  console.log(`✅ Created ${authorMap.size} users`);

  // Create prompts
  console.log(`📝 Creating ${remotePrompts.length} prompts...`);
  let promptsCreated = 0;
  let promptsSkipped = 0;

  for (const remotePrompt of remotePrompts) {
    const authorId = userIdMap.get(remotePrompt.author.username);
    if (!authorId) {
      console.warn(`⚠️  Skipping prompt "${remotePrompt.title}" - author not found`);
      promptsSkipped++;
      continue;
    }

    const categoryId = remotePrompt.category ? categoryIdMap.get(remotePrompt.category.slug) : null;

    // Map prompt type
    const typeMap: Record<string, PromptType> = {
      TEXT: "TEXT",
      IMAGE: "IMAGE",
      VIDEO: "VIDEO",
      AUDIO: "AUDIO",
      STRUCTURED: "STRUCTURED",
      SKILL: "SKILL",
    };
    const promptType = typeMap[remotePrompt.type] || "TEXT";

    // Map structured format
    const formatMap: Record<string, StructuredFormat> = {
      JSON: "JSON",
      YAML: "YAML",
    };
    const structuredFormat = remotePrompt.structuredFormat ? formatMap[remotePrompt.structuredFormat] : null;

    // Check if prompt already exists
    const existingPrompt = await prisma.prompt.findFirst({
      where: { slug: remotePrompt.slug },
    });

    if (existingPrompt) {
      promptsSkipped++;
      continue;
    }

    try {
      const prompt = await prisma.prompt.create({
        data: {
          title: remotePrompt.title,
          slug: remotePrompt.slug,
          description: remotePrompt.description,
          content: remotePrompt.content,
          type: promptType,
          structuredFormat: structuredFormat,
          mediaUrl: remotePrompt.mediaUrl,
          viewCount: remotePrompt.viewCount,
          isFeatured: remotePrompt.isFeatured,
          featuredAt: remotePrompt.featuredAt ? new Date(remotePrompt.featuredAt) : null,
          requiresMediaUpload: remotePrompt.requiresMediaUpload,
          requiredMediaType: remotePrompt.requiredMediaType as RequiredMediaType | null,
          requiredMediaCount: remotePrompt.requiredMediaCount,
          authorId: authorId,
          categoryId: categoryId,
          tags: {
            create: remotePrompt.tags
              .filter(tag => tagIdMap.has(tag.slug))
              .map(tag => ({ tagId: tagIdMap.get(tag.slug)! })),
          },
        },
      });

      // Create initial version
      await prisma.promptVersion.create({
        data: {
          promptId: prompt.id,
          version: 1,
          content: remotePrompt.content,
          changeNote: "Initial version",
          createdBy: authorId,
        },
      });

      promptsCreated++;
    } catch (error) {
      console.warn(`⚠️  Failed to create prompt "${remotePrompt.title}":`, error);
      promptsSkipped++;
    }
  }

  console.log(`✅ Created ${promptsCreated} prompts (${promptsSkipped} skipped)`);
  console.log("\n🎉 Seeding complete!");
  console.log("\n📋 Test credentials (password: password123):");
  console.log("   Admin: admin@prompts.chat");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
