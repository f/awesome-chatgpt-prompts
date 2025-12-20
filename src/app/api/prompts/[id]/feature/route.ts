import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// POST /api/prompts/[id]/feature - Toggle featured status (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Get current prompt
    const prompt = await db.prompt.findUnique({
      where: { id },
      select: { isFeatured: true },
    });

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    // Toggle featured status
    const updatedPrompt = await db.prompt.update({
      where: { id },
      data: {
        isFeatured: !prompt.isFeatured,
        featuredAt: !prompt.isFeatured ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      isFeatured: updatedPrompt.isFeatured,
    });
  } catch (error) {
    console.error("Error toggling featured status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
