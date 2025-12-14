import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { triggerWebhooks } from "@/lib/webhook";
import { generatePromptEmbedding } from "@/lib/ai/embeddings";

const promptSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  content: z.string().min(1),
  type: z.enum(["TEXT", "IMAGE", "VIDEO", "AUDIO", "STRUCTURED"]),
  structuredFormat: z.enum(["JSON", "YAML"]).optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()),
  contributorIds: z.array(z.string()).optional(),
  isPrivate: z.boolean(),
  mediaUrl: z.string().url().optional().or(z.literal("")),
  requiresMediaUpload: z.boolean().optional(),
  requiredMediaType: z.enum(["IMAGE", "VIDEO", "DOCUMENT"]).optional(),
  requiredMediaCount: z.number().int().min(1).max(10).optional(),
});

// Create prompt
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = promptSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "validation_error", message: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { title, description, content, type, structuredFormat, categoryId, tagIds, contributorIds, isPrivate, mediaUrl, requiresMediaUpload, requiredMediaType, requiredMediaCount } = parsed.data;

    // Create prompt with tags
    const prompt = await db.prompt.create({
      data: {
        title,
        description: description || null,
        content,
        type,
        structuredFormat: type === "STRUCTURED" ? structuredFormat : null,
        isPrivate,
        mediaUrl: mediaUrl || null,
        requiresMediaUpload: requiresMediaUpload || false,
        requiredMediaType: requiresMediaUpload ? requiredMediaType : null,
        requiredMediaCount: requiresMediaUpload ? requiredMediaCount : null,
        authorId: session.user.id,
        categoryId: categoryId || null,
        tags: {
          create: tagIds.map((tagId) => ({
            tagId,
          })),
        },
        ...(contributorIds && contributorIds.length > 0 && {
          contributors: {
            connect: contributorIds.map((id) => ({ id })),
          },
        }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Create initial version
    await db.promptVersion.create({
      data: {
        promptId: prompt.id,
        version: 1,
        content,
        changeNote: "Initial version",
        createdBy: session.user.id,
      },
    });

    // Trigger webhooks for new prompt (non-blocking)
    if (!isPrivate) {
      triggerWebhooks("PROMPT_CREATED", {
        id: prompt.id,
        title: prompt.title,
        description: prompt.description,
        content: prompt.content,
        type: prompt.type,
        mediaUrl: prompt.mediaUrl,
        isPrivate: prompt.isPrivate,
        author: prompt.author,
        category: prompt.category,
        tags: prompt.tags,
      });
    }

    // Generate embedding for AI search (non-blocking)
    // Only for public prompts - the function checks if aiSearch is enabled
    if (!isPrivate) {
      generatePromptEmbedding(prompt.id).catch((err) =>
        console.error("Failed to generate embedding for prompt:", prompt.id, err)
      );
    }

    return NextResponse.json(prompt);
  } catch (error) {
    console.error("Create prompt error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// List prompts (for API access)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("perPage") || "12");
    const type = searchParams.get("type");
    const categoryId = searchParams.get("category");
    const tag = searchParams.get("tag");
    const sort = searchParams.get("sort");
    const q = searchParams.get("q");

    const where: Record<string, unknown> = {
      isPrivate: false,
      isUnlisted: false, // Exclude unlisted prompts from public API
      deletedAt: null, // Exclude soft-deleted prompts
    };

    if (type) {
      where.type = type;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (tag) {
      where.tags = {
        some: {
          tag: { slug: tag },
        },
      };
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    // Build order by clause
    let orderBy: any = { createdAt: "desc" };
    if (sort === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (sort === "upvotes") {
      orderBy = { votes: { _count: "desc" } };
    }

    const [promptsRaw, total] = await Promise.all([
      db.prompt.findMany({
        where,
        orderBy,
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
          contributors: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: { votes: true, contributors: true },
          },
        },
      }),
      db.prompt.count({ where }),
    ]);

    // Transform to include voteCount and contributorCount
    const prompts = promptsRaw.map((p) => ({
      ...p,
      voteCount: p._count.votes,
      contributorCount: p._count.contributors,
      contributors: p.contributors,
    }));

    return NextResponse.json({
      prompts,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    });
  } catch (error) {
    console.error("List prompts error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Something went wrong" },
      { status: 500 }
    );
  }
}
