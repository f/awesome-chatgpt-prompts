import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const MAX_PINNED_PROMPTS = 3;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: promptId } = await params;

    // Check if prompt exists and belongs to user
    const prompt = await db.prompt.findUnique({
      where: { id: promptId },
      select: { authorId: true, isPrivate: true },
    });

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    if (prompt.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only pin your own prompts" },
        { status: 403 }
      );
    }

    // Check if already pinned
    const existingPin = await db.pinnedPrompt.findUnique({
      where: {
        userId_promptId: {
          userId: session.user.id,
          promptId,
        },
      },
    });

    if (existingPin) {
      return NextResponse.json({ error: "Prompt already pinned" }, { status: 400 });
    }

    // Check pin limit
    const pinnedCount = await db.pinnedPrompt.count({
      where: { userId: session.user.id },
    });

    if (pinnedCount >= MAX_PINNED_PROMPTS) {
      return NextResponse.json(
        { error: `You can only pin up to ${MAX_PINNED_PROMPTS} prompts` },
        { status: 400 }
      );
    }

    // Get next order number
    const maxOrder = await db.pinnedPrompt.aggregate({
      where: { userId: session.user.id },
      _max: { order: true },
    });

    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    // Create pin
    await db.pinnedPrompt.create({
      data: {
        userId: session.user.id,
        promptId,
        order: nextOrder,
      },
    });

    return NextResponse.json({ success: true, pinned: true });
  } catch (error) {
    console.error("Failed to pin prompt:", error);
    return NextResponse.json({ error: "Failed to pin prompt" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: promptId } = await params;

    // Delete the pin
    await db.pinnedPrompt.deleteMany({
      where: {
        userId: session.user.id,
        promptId,
      },
    });

    return NextResponse.json({ success: true, pinned: false });
  } catch (error) {
    console.error("Failed to unpin prompt:", error);
    return NextResponse.json({ error: "Failed to unpin prompt" }, { status: 500 });
  }
}
