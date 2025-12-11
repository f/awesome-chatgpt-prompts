import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// POST - Subscribe to a category
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

    const { id: categoryId } = await params;

    // Check if category exists
    const category = await db.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "not_found", message: "Category not found" },
        { status: 404 }
      );
    }

    // Check if already subscribed
    const existing = await db.categorySubscription.findUnique({
      where: {
        userId_categoryId: {
          userId: session.user.id,
          categoryId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "already_subscribed", message: "Already subscribed to this category" },
        { status: 400 }
      );
    }

    // Create subscription
    const subscription = await db.categorySubscription.create({
      data: {
        userId: session.user.id,
        categoryId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({ subscribed: true, category: subscription.category });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// DELETE - Unsubscribe from a category
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

    const { id: categoryId } = await params;

    // Delete subscription
    await db.categorySubscription.deleteMany({
      where: {
        userId: session.user.id,
        categoryId,
      },
    });

    return NextResponse.json({ subscribed: false });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Something went wrong" },
      { status: 500 }
    );
  }
}
