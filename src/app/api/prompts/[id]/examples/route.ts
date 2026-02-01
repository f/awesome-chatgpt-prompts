import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const addExampleSchema = z.object({
  mediaUrl: z.string().url(),
  comment: z.string().max(500).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: promptId } = await params;

  const prompt = await db.prompt.findUnique({
    where: { id: promptId },
    select: { id: true, type: true },
  });

  if (!prompt) {
    return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
  }

  // Only allow examples for IMAGE and VIDEO prompts
  if (prompt.type !== "IMAGE" && prompt.type !== "VIDEO") {
    return NextResponse.json({ error: "Examples not supported for this prompt type" }, { status: 400 });
  }

  const examples = await db.userPromptExample.findMany({
    where: { promptId },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  return NextResponse.json({ examples });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: promptId } = await params;

  try {
    const body = await req.json();
    const { mediaUrl, comment } = addExampleSchema.parse(body);

    const prompt = await db.prompt.findUnique({
      where: { id: promptId },
      select: { id: true, type: true, isPrivate: true, authorId: true },
    });

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    // Only allow examples for IMAGE and VIDEO prompts
    if (prompt.type !== "IMAGE" && prompt.type !== "VIDEO") {
      return NextResponse.json({ error: "Examples not supported for this prompt type" }, { status: 400 });
    }

    // Don't allow adding examples to private prompts (unless owner)
    if (prompt.isPrivate && prompt.authorId !== session.user.id) {
      return NextResponse.json({ error: "Cannot add example to private prompt" }, { status: 403 });
    }

    const example = await db.userPromptExample.create({
      data: {
        mediaUrl,
        comment: comment || null,
        promptId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ example });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.issues }, { status: 400 });
    }
    console.error("Failed to add example:", error);
    return NextResponse.json({ error: "Failed to add example" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: promptId } = await params;

  try {
    const { searchParams } = new URL(req.url);
    const exampleId = searchParams.get("exampleId");

    if (!exampleId) {
      return NextResponse.json({ error: "exampleId required" }, { status: 400 });
    }

    const example = await db.userPromptExample.findUnique({
      where: { id: exampleId },
      select: { id: true, userId: true, promptId: true },
    });

    if (!example) {
      return NextResponse.json({ error: "Example not found" }, { status: 404 });
    }

    if (example.promptId !== promptId) {
      return NextResponse.json({ error: "Example does not belong to this prompt" }, { status: 400 });
    }

    // Only allow owner or admin to delete
    const isAdmin = session.user.role === "ADMIN";
    if (example.userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await db.userPromptExample.delete({
      where: { id: exampleId },
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Failed to delete example:", error);
    return NextResponse.json({ error: "Failed to delete example" }, { status: 500 });
  }
}
