import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const updateConnectionSchema = z.object({
  label: z.string().min(1).max(100).optional(),
  order: z.number().int().min(0).optional(),
});

interface RouteParams {
  params: Promise<{ id: string; connectionId: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, connectionId } = await params;

  try {
    const connection = await db.promptConnection.findUnique({
      where: { id: connectionId },
      include: {
        source: {
          select: { authorId: true },
        },
      },
    });

    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    if (connection.sourceId !== id) {
      return NextResponse.json(
        { error: "Connection does not belong to this prompt" },
        { status: 400 }
      );
    }

    if (
      connection.source.authorId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "You can only delete connections from your own prompts" },
        { status: 403 }
      );
    }

    await db.promptConnection.delete({
      where: { id: connectionId },
    });

    // Revalidate the prompt page and flow cache
    revalidatePath(`/prompts/${id}`);
    revalidateTag("prompt-flow", "max");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete connection:", error);
    return NextResponse.json(
      { error: "Failed to delete connection" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, connectionId } = await params;

  try {
    const body = await request.json();
    const data = updateConnectionSchema.parse(body);

    const connection = await db.promptConnection.findUnique({
      where: { id: connectionId },
      include: {
        source: {
          select: { authorId: true },
        },
      },
    });

    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    if (connection.sourceId !== id) {
      return NextResponse.json(
        { error: "Connection does not belong to this prompt" },
        { status: 400 }
      );
    }

    if (
      connection.source.authorId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "You can only update connections on your own prompts" },
        { status: 403 }
      );
    }

    const updated = await db.promptConnection.update({
      where: { id: connectionId },
      data,
      include: {
        target: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    // Revalidate prompt flow cache
    revalidateTag("prompt-flow", "max");

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Failed to update connection:", error);
    return NextResponse.json(
      { error: "Failed to update connection" },
      { status: 500 }
    );
  }
}
