import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getConfig } from "@/lib/config";
import { z } from "zod";

const voteSchema = z.object({
  value: z.number().refine((v) => v === 1 || v === -1, {
    message: "Vote value must be 1 (upvote) or -1 (downvote)",
  }),
});

// POST - Vote on a comment (upvote or downvote)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const config = await getConfig();
    if (config.features.comments === false) {
      return NextResponse.json(
        { error: "feature_disabled", message: "Comments are disabled" },
        { status: 403 }
      );
    }

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    const { id: promptId, commentId } = await params;
    const body = await request.json();

    const validation = voteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "validation_error", message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { value } = validation.data;

    // Check if comment exists
    const comment = await db.comment.findUnique({
      where: { id: commentId, deletedAt: null },
      select: { id: true, promptId: true },
    });

    if (!comment || comment.promptId !== promptId) {
      return NextResponse.json(
        { error: "not_found", message: "Comment not found" },
        { status: 404 }
      );
    }

    // Check if user already voted
    const existingVote = await db.commentVote.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId,
        },
      },
    });

    if (existingVote) {
      if (existingVote.value === value) {
        // Same vote - remove it (toggle off)
        await db.commentVote.delete({
          where: {
            userId_commentId: {
              userId: session.user.id,
              commentId,
            },
          },
        });
      } else {
        // Different vote - update it
        await db.commentVote.update({
          where: {
            userId_commentId: {
              userId: session.user.id,
              commentId,
            },
          },
          data: { value },
        });
      }
    } else {
      // No existing vote - create one
      await db.commentVote.create({
        data: {
          userId: session.user.id,
          commentId,
          value,
        },
      });
    }

    // Calculate and update cached score
    const votes = await db.commentVote.findMany({
      where: { commentId },
      select: { value: true },
    });
    const score = votes.reduce((sum: number, vote: { value: number }) => sum + vote.value, 0);

    // Update cached score in comment
    await db.comment.update({
      where: { id: commentId },
      data: { score },
    });

    // Get user's current vote
    const userVote = await db.commentVote.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId,
        },
      },
      select: { value: true },
    });

    return NextResponse.json({ 
      score, 
      userVote: userVote?.value ?? 0,
    });
  } catch (error) {
    console.error("Vote comment error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// DELETE - Remove vote from a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const config = await getConfig();
    if (config.features.comments === false) {
      return NextResponse.json(
        { error: "feature_disabled", message: "Comments are disabled" },
        { status: 403 }
      );
    }

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    const { commentId } = await params;

    // Delete vote
    await db.commentVote.deleteMany({
      where: {
        userId: session.user.id,
        commentId,
      },
    });

    // Calculate and update cached score
    const votes = await db.commentVote.findMany({
      where: { commentId },
      select: { value: true },
    });
    const score = votes.reduce((sum: number, vote: { value: number }) => sum + vote.value, 0);

    // Update cached score in comment
    await db.comment.update({
      where: { id: commentId },
      data: { score },
    });

    return NextResponse.json({ score, userVote: 0 });
  } catch (error) {
    console.error("Unvote comment error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Something went wrong" },
      { status: 500 }
    );
  }
}
