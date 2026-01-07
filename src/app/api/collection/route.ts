import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const addToCollectionSchema = z.object({
  promptId: z.string().min(1),
});

export async function GET() {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const collections = await db.collection.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      prompt: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
              verified: true,
            },
          },
          category: {
            include: {
              parent: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: { votes: true, contributors: true },
          },
        },
      },
    },
  });

  return NextResponse.json({ collections });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { promptId } = addToCollectionSchema.parse(body);

    const existingCollection = await db.collection.findUnique({
      where: {
        userId_promptId: {
          userId: session.user.id,
          promptId,
        },
      },
    });

    if (existingCollection) {
      return NextResponse.json({ error: "Already in collection" }, { status: 400 });
    }

    const prompt = await db.prompt.findUnique({
      where: { id: promptId },
      select: { id: true, isPrivate: true, authorId: true },
    });

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    if (prompt.isPrivate && prompt.authorId !== session.user.id) {
      return NextResponse.json({ error: "Cannot add private prompt" }, { status: 403 });
    }

    const collection = await db.collection.create({
      data: {
        userId: session.user.id,
        promptId,
      },
    });

    return NextResponse.json({ collection, added: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("Failed to add to collection:", error);
    return NextResponse.json({ error: "Failed to add to collection" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const promptId = searchParams.get("promptId");

    if (!promptId) {
      return NextResponse.json({ error: "promptId required" }, { status: 400 });
    }

    await db.collection.delete({
      where: {
        userId_promptId: {
          userId: session.user.id,
          promptId,
        },
      },
    });

    return NextResponse.json({ removed: true });
  } catch (error) {
    console.error("Failed to remove from collection:", error);
    return NextResponse.json({ error: "Failed to remove from collection" }, { status: 500 });
  }
}
