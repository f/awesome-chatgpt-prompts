import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Toggle unlist status (admin only)
export async function POST(
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

    // Only admins can unlist prompts
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "forbidden", message: "Only admins can unlist prompts" },
        { status: 403 }
      );
    }

    // Check if prompt exists
    const existing = await db.prompt.findUnique({
      where: { id },
      select: { id: true, isUnlisted: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "not_found", message: "Prompt not found" },
        { status: 404 }
      );
    }

    // Toggle unlist status
    const newUnlistedStatus = !existing.isUnlisted;
    
    await db.prompt.update({
      where: { id },
      data: { 
        isUnlisted: newUnlistedStatus,
        unlistedAt: newUnlistedStatus ? new Date() : null,
      },
    });

    return NextResponse.json({ 
      success: true, 
      isUnlisted: newUnlistedStatus,
      message: newUnlistedStatus ? "Prompt unlisted" : "Prompt relisted" 
    });
  } catch (error) {
    console.error("Unlist prompt error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Something went wrong" },
      { status: 500 }
    );
  }
}
