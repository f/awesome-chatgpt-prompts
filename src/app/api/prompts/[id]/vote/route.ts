import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// POST - Upvote a prompt
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    const { id: promptId } = await params;

    // Check if prompt exists
    const prompt = await db.prompt.findUnique({
      where: { id: promptId },
    });

    if (!prompt) {
      return NextResponse.json(
        { error: "not_found", message: "Prompt not found" },
        { status: 404 }
      );
    }

    // Check if already voted
    const existing = await db.promptVote.findUnique({
      where: {
        userId_promptId: {
          userId: session.user.id,
          promptId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "already_voted", message: "You have already upvoted this prompt" },
        { status: 400 }
      );
    }

    // Create vote
    await db.promptVote.create({
      data: {
        userId: session.user.id,
        promptId,
      },
    });

    // Get updated vote count
    const voteCount = await db.promptVote.count({
      where: { promptId },
    });

    return NextResponse.json({ voted: true, voteCount });
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// DELETE - Remove upvote from a prompt
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    const { id: promptId } = await params;

    // Delete vote
    await db.promptVote.deleteMany({
      where: {
        userId: session.user.id,
        promptId,
      },
    });

    // Get updated vote count
    const voteCount = await db.promptVote.count({
      where: { promptId },
    });

    return NextResponse.json({ voted: false, voteCount });
  } catch (error) {
    console.error("Unvote error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Something went wrong" },
      { status: 500 }
    );
  }
}
