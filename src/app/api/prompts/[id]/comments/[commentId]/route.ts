import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getConfig } from "@/lib/config";

// DELETE - Delete a comment (author or admin only)
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

    const { id: promptId, commentId } = await params;

    // Find the comment
    const comment = await db.comment.findUnique({
      where: { id: commentId, deletedAt: null },
      select: { 
        id: true, 
        promptId: true, 
        authorId: true,
      },
    });

    if (!comment || comment.promptId !== promptId) {
      return NextResponse.json(
        { error: "not_found", message: "Comment not found" },
        { status: 404 }
      );
    }

    // Check if user can delete (author or admin)
    const isAuthor = comment.authorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: "forbidden", message: "You cannot delete this comment" },
        { status: 403 }
      );
    }

    // Soft delete the comment
    await db.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Something went wrong" },
      { status: 500 }
    );
  }
}
