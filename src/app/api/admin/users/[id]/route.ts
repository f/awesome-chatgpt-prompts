import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Update user (role change or verification)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { role, verified, flagged, flaggedReason, dailyGenerationLimit } = body;

    // Build update data
    const updateData: { 
      role?: "ADMIN" | "USER"; 
      verified?: boolean;
      flagged?: boolean;
      flaggedAt?: Date | null;
      flaggedReason?: string | null;
      dailyGenerationLimit?: number;
      generationCreditsRemaining?: number;
    } = {};

    if (role !== undefined) {
      if (!["ADMIN", "USER"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      updateData.role = role;
    }

    if (verified !== undefined) {
      updateData.verified = verified;
    }

    if (flagged !== undefined) {
      updateData.flagged = flagged;
      if (flagged) {
        updateData.flaggedAt = new Date();
        updateData.flaggedReason = flaggedReason || null;
      } else {
        updateData.flaggedAt = null;
        updateData.flaggedReason = null;
      }
    }

    if (dailyGenerationLimit !== undefined) {
      const limit = parseInt(dailyGenerationLimit, 10);
      if (isNaN(limit) || limit < 0) {
        return NextResponse.json({ error: "Invalid daily generation limit" }, { status: 400 });
      }
      updateData.dailyGenerationLimit = limit;
      // Also reset remaining credits to the new limit
      updateData.generationCreditsRemaining = limit;
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatar: true,
        role: true,
        verified: true,
        flagged: true,
        flaggedAt: true,
        flaggedReason: true,
        dailyGenerationLimit: true,
        generationCreditsRemaining: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Don't allow deleting yourself
    if (id === session.user.id) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
    }

    await db.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
