import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getConfig } from "@/lib/config";

// POST - Flag a comment (admin only)
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

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "forbidden", message: "Admin access required" },
        { status: 403 }
      );
    }

    const { id: promptId, commentId } = await params;

    // Check if comment exists
    const comment = await db.comment.findUnique({
      where: { id: commentId, deletedAt: null },
      select: { id: true, promptId: true, flagged: true },
    });

    if (!comment || comment.promptId !== promptId) {
      return NextResponse.json(
        { error: "not_found", message: "Comment not found" },
        { status: 404 }
      );
    }

    // Toggle flagged status
    const updated = await db.comment.update({
      where: { id: commentId },
      data: { 
        flagged: !comment.flagged,
        flaggedAt: !comment.flagged ? new Date() : null,
        flaggedBy: !comment.flagged ? session.user.id : null,
      },
    });

    return NextResponse.json({ 
      flagged: updated.flagged,
    });
  } catch (error) {
    console.error("Flag comment error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Something went wrong" },
      { status: 500 }
    );
  }
}
