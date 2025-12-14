import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generatePromptEmbedding } from "@/lib/ai/embeddings";

const updatePromptSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  content: z.string().min(1).optional(),
  type: z.enum(["TEXT", "IMAGE", "VIDEO", "AUDIO", "STRUCTURED"]).optional(),
  structuredFormat: z.enum(["JSON", "YAML"]).optional().nullable(),
  categoryId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).optional(),
  contributorIds: z.array(z.string()).optional(),
  isPrivate: z.boolean().optional(),
  mediaUrl: z.string().url().optional().or(z.literal("")).nullable(),
  requiresMediaUpload: z.boolean().optional(),
  requiredMediaType: z.enum(["IMAGE", "VIDEO", "DOCUMENT"]).optional().nullable(),
  requiredMediaCount: z.number().int().min(1).max(10).optional().nullable(),
});

// Get single prompt
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    const prompt = await db.prompt.findUnique({
      where: { id },
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
        versions: {
          orderBy: { version: "desc" },
          take: 10,
        },
      },
    });

    if (!prompt || prompt.deletedAt) {
      return NextResponse.json(
        { error: "not_found", message: "Prompt not found" },
        { status: 404 }
      );
    }

    // Check if user can view private prompt
    if (prompt.isPrivate && prompt.authorId !== session?.user?.id) {
      return NextResponse.json(
        { error: "forbidden", message: "This prompt is private" },
        { status: 403 }
      );
    }

    return NextResponse.json(prompt);
  } catch (error) {
    console.error("Get prompt error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Update prompt
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    // Check if prompt exists and user owns it
    const existing = await db.prompt.findUnique({
      where: { id },
      select: { authorId: true, content: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "not_found", message: "Prompt not found" },
        { status: 404 }
      );
    }

    if (existing.authorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "forbidden", message: "You can only edit your own prompts" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = updatePromptSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "validation_error", message: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { tagIds, contributorIds, categoryId, mediaUrl, ...data } = parsed.data;

    // Convert empty strings to null for optional foreign keys
    const cleanedData = {
      ...data,
      ...(categoryId !== undefined && { categoryId: categoryId || null }),
      ...(mediaUrl !== undefined && { mediaUrl: mediaUrl || null }),
    };

    // Update prompt
    const prompt = await db.prompt.update({
      where: { id },
      data: {
        ...cleanedData,
        ...(tagIds && {
          tags: {
            deleteMany: {},
            create: tagIds.map((tagId) => ({ tagId })),
          },
        }),
        ...(contributorIds !== undefined && {
          contributors: {
            set: contributorIds.map((id) => ({ id })),
          },
        }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
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

    // Create new version if content changed
    if (data.content && data.content !== existing.content) {
      const latestVersion = await db.promptVersion.findFirst({
        where: { promptId: id },
        orderBy: { version: "desc" },
      });

      await db.promptVersion.create({
        data: {
          promptId: id,
          version: (latestVersion?.version || 0) + 1,
          content: data.content,
          changeNote: "Content updated",
          createdBy: session.user.id,
        },
      });
    }

    // Regenerate embedding if content, title, or description changed (non-blocking)
    // Only for public prompts - the function checks if aiSearch is enabled
    const contentChanged = data.content || data.title || data.description !== undefined;
    if (contentChanged && !prompt.isPrivate) {
      generatePromptEmbedding(id).catch((err) =>
        console.error("Failed to regenerate embedding for prompt:", id, err)
      );
    }

    return NextResponse.json(prompt);
  } catch (error) {
    console.error("Update prompt error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Soft delete prompt (admin only - CC0 prompts cannot be deleted by users)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    // Only admins can soft-delete prompts (CC0 content is public domain)
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "forbidden", message: "Prompts are released under CC0 and cannot be deleted. Contact an admin if there is an issue." },
        { status: 403 }
      );
    }

    // Check if prompt exists
    const existing = await db.prompt.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "not_found", message: "Prompt not found" },
        { status: 404 }
      );
    }

    if (existing.deletedAt) {
      return NextResponse.json(
        { error: "already_deleted", message: "Prompt is already deleted" },
        { status: 400 }
      );
    }

    // Soft delete by setting deletedAt timestamp
    await db.prompt.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: "Prompt soft deleted" });
  } catch (error) {
    console.error("Delete prompt error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Something went wrong" },
      { status: 500 }
    );
  }
}
