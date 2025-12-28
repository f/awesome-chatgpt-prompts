import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// DELETE - Hard delete a prompt (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: "unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "forbidden", message: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Validate prompt ID
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "invalid_request", message: "Valid prompt ID is required" },
        { status: 400 }
      );
    }

    // Check if prompt exists
    const prompt = await db.prompt.findUnique({
      where: { id },
      select: { id: true, title: true },
    });

    if (!prompt) {
      return NextResponse.json(
        { error: "not_found", message: "Prompt not found" },
        { status: 404 }
      );
    }

    // Hard delete the prompt (cascades to related records due to schema relations)
    await db.prompt.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Prompt deleted successfully",
      deletedPrompt: {
        id: prompt.id,
        title: prompt.title,
      },
    });
  } catch (error) {
    console.error("Admin delete prompt error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Failed to delete prompt" },
      { status: 500 }
    );
  }
}
