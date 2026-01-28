import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const createConnectionSchema = z.object({
  targetId: z.string().min(1),
  label: z.string().min(1).max(100),
  order: z.number().int().min(0).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const prompt = await db.prompt.findUnique({
      where: { id, deletedAt: null },
      select: { id: true, isPrivate: true, authorId: true },
    });

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    // Get all connections where this prompt is involved (source or target)
    // Exclude "related" label connections - those are for Related Prompts feature, not Prompt Flow
    const outgoingConnections = await db.promptConnection.findMany({
      where: { sourceId: id, label: { not: "related" } },
      orderBy: { order: "asc" },
      include: {
        target: {
          select: {
            id: true,
            title: true,
            slug: true,
            isPrivate: true,
            authorId: true,
          },
        },
      },
    });

    const incomingConnections = await db.promptConnection.findMany({
      where: { targetId: id, label: { not: "related" } },
      orderBy: { order: "asc" },
      include: {
        source: {
          select: {
            id: true,
            title: true,
            slug: true,
            isPrivate: true,
            authorId: true,
          },
        },
      },
    });

    // Filter out private prompts the user can't see
    const session = await auth();
    const userId = session?.user?.id;

    const filteredOutgoing = outgoingConnections.filter(
      (c: typeof outgoingConnections[number]) => !c.target.isPrivate || c.target.authorId === userId
    );

    const filteredIncoming = incomingConnections.filter(
      (c: typeof incomingConnections[number]) => !c.source.isPrivate || c.source.authorId === userId
    );

    return NextResponse.json({
      outgoing: filteredOutgoing,
      incoming: filteredIncoming,
    });
  } catch (error) {
    console.error("Failed to fetch connections:", error);
    return NextResponse.json(
      { error: "Failed to fetch connections" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { targetId, label, order } = createConnectionSchema.parse(body);

    // Verify source prompt exists and user owns it
    const sourcePrompt = await db.prompt.findUnique({
      where: { id, deletedAt: null },
      select: { authorId: true },
    });

    if (!sourcePrompt) {
      return NextResponse.json(
        { error: "Source prompt not found" },
        { status: 404 }
      );
    }

    if (
      sourcePrompt.authorId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "You can only add connections to your own prompts" },
        { status: 403 }
      );
    }

    // Verify target prompt exists and belongs to the user
    const targetPrompt = await db.prompt.findUnique({
      where: { id: targetId, deletedAt: null },
      select: { id: true, title: true, authorId: true },
    });

    if (!targetPrompt) {
      return NextResponse.json(
        { error: "Target prompt not found" },
        { status: 404 }
      );
    }

    // Verify user owns the target prompt (users can only connect their own prompts)
    if (
      targetPrompt.authorId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "You can only connect to your own prompts" },
        { status: 403 }
      );
    }

    // Prevent self-connection
    if (id === targetId) {
      return NextResponse.json(
        { error: "Cannot connect a prompt to itself" },
        { status: 400 }
      );
    }

    // Check if connection already exists
    const existing = await db.promptConnection.findUnique({
      where: { sourceId_targetId: { sourceId: id, targetId } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Connection already exists" },
        { status: 400 }
      );
    }

    // Calculate order if not provided
    let connectionOrder = order;
    if (connectionOrder === undefined) {
      const lastConnection = await db.promptConnection.findFirst({
        where: { sourceId: id },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      connectionOrder = (lastConnection?.order ?? -1) + 1;
    }

    const connection = await db.promptConnection.create({
      data: {
        sourceId: id,
        targetId,
        label,
        order: connectionOrder,
      },
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

    return NextResponse.json(connection, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Failed to create connection:", error);
    return NextResponse.json(
      { error: "Failed to create connection" },
      { status: 500 }
    );
  }
}
