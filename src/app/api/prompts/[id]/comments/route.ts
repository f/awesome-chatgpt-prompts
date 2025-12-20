import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getConfig } from "@/lib/config";
import { z } from "zod";

const createCommentSchema = z.object({
  content: z.string().min(1).max(10000),
  parentId: z.string().optional(),
});

// GET - Get all comments for a prompt
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const config = await getConfig();
    if (config.features.comments === false) {
      return NextResponse.json(
        { error: "feature_disabled", message: "Comments are disabled" },
        { status: 403 }
      );
    }

    const { id: promptId } = await params;
    const session = await auth();

    // Check if prompt exists
    const prompt = await db.prompt.findUnique({
      where: { id: promptId, deletedAt: null },
      select: { id: true, isPrivate: true, authorId: true },
    });

    if (!prompt) {
      return NextResponse.json(
        { error: "not_found", message: "Prompt not found" },
        { status: 404 }
      );
    }

    // Check if user can view private prompt
    if (prompt.isPrivate && prompt.authorId !== session?.user?.id) {
      return NextResponse.json(
        { error: "not_found", message: "Prompt not found" },
        { status: 404 }
      );
    }

    const isAdmin = session?.user?.role === "ADMIN";
    const userId = session?.user?.id;

    // Get all comments with cached score and user's vote
    const comments = await db.comment.findMany({
      where: { 
        promptId,
        deletedAt: null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            role: true,
          },
        },
        votes: session?.user ? {
          where: { userId: session.user.id },
          select: { value: true },
        } : false,
        _count: {
          select: { replies: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Transform and filter comments
    // Shadow-ban: flagged comments only visible to admins and the comment author
    const transformedComments = comments
      .filter((comment: typeof comments[number]) => {
        // Admins see all comments
        if (isAdmin) return true;
        // Non-flagged comments visible to everyone
        if (!comment.flagged) return true;
        // Flagged comments only visible to their author (shadow-ban)
        return comment.authorId === userId;
      })
      .map((comment: typeof comments[number]) => {
        const userVote = session?.user && comment.votes && Array.isArray(comment.votes) && comment.votes.length > 0
          ? (comment.votes[0] as { value: number }).value
          : 0;
      
        return {
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          parentId: comment.parentId,
          // Only admins see the flagged status
          flagged: isAdmin ? comment.flagged : false,
          author: comment.author,
          score: comment.score,
          userVote,
          replyCount: comment._count.replies,
        };
      });

    return NextResponse.json({ comments: transformedComments });
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// POST - Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: promptId } = await params;
    const body = await request.json();
    
    const validation = createCommentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "validation_error", message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { content, parentId } = validation.data;

    // Check if prompt exists
    const prompt = await db.prompt.findUnique({
      where: { id: promptId, deletedAt: null },
      select: { id: true, isPrivate: true, authorId: true },
    });

    if (!prompt) {
      return NextResponse.json(
        { error: "not_found", message: "Prompt not found" },
        { status: 404 }
      );
    }

    // Check if user can view private prompt
    if (prompt.isPrivate && prompt.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "not_found", message: "Prompt not found" },
        { status: 404 }
      );
    }

    // If replying to a comment, verify parent exists and belongs to same prompt
    if (parentId) {
      const parentComment = await db.comment.findUnique({
        where: { id: parentId, deletedAt: null },
        select: { id: true, promptId: true },
      });

      if (!parentComment || parentComment.promptId !== promptId) {
        return NextResponse.json(
          { error: "invalid_parent", message: "Parent comment not found" },
          { status: 400 }
        );
      }
    }

    // Create comment
    const comment = await db.comment.create({
      data: {
        content,
        promptId,
        authorId: session.user.id,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    // Create notification for prompt owner (if not commenting on own prompt)
    if (prompt.authorId !== session.user.id) {
      await db.notification.create({
        data: {
          type: "COMMENT",
          userId: prompt.authorId,
          actorId: session.user.id,
          promptId,
          commentId: comment.id,
        },
      });
    }

    // If replying to a comment, also notify the parent comment author
    if (parentId) {
      const parentComment = await db.comment.findUnique({
        where: { id: parentId },
        select: { authorId: true },
      });
      
      // Notify parent comment author (if not replying to self and not the prompt owner who already got notified)
      if (parentComment && 
          parentComment.authorId !== session.user.id && 
          parentComment.authorId !== prompt.authorId) {
        await db.notification.create({
          data: {
            type: "REPLY",
            userId: parentComment.authorId,
            actorId: session.user.id,
            promptId,
            commentId: comment.id,
          },
        });
      }
    }

    return NextResponse.json({
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        parentId: comment.parentId,
        flagged: false, // New comments are never flagged
        author: comment.author,
        score: 0,
        userVote: 0,
        replyCount: 0,
      },
    });
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Something went wrong" },
      { status: 500 }
    );
  }
}
