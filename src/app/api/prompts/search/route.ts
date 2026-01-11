import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
  const ownerOnly = searchParams.get("ownerOnly") === "true";

  if (query.length < 2) {
    return NextResponse.json({ prompts: [] });
  }

  const session = await auth();

  try {
    // Handle comma-separated keywords
    const keywords = query.split(",").map(k => k.trim()).filter(Boolean);
    const titleConditions = keywords.length > 1
      ? keywords.map(keyword => ({ title: { contains: keyword, mode: "insensitive" as const } }))
      : [{ title: { contains: query, mode: "insensitive" as const } }];

    const prompts = await db.prompt.findMany({
      where: {
        deletedAt: null,
        isUnlisted: false,
        AND: [
          // Visibility filter
          ownerOnly && session?.user
            ? { authorId: session.user.id }
            : {
                OR: [
                  { isPrivate: false },
                  ...(session?.user ? [{ authorId: session.user.id }] : []),
                ],
              },
          // Search filter
          { OR: titleConditions },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        author: {
          select: {
            username: true,
          },
        },
      },
      take: limit,
      orderBy: [
        { isFeatured: "desc" },
        { viewCount: "desc" },
      ],
    });

    return NextResponse.json({ prompts });
  } catch (error) {
    console.error("Search failed:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
