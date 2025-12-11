import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query || query.length < 1) {
      return NextResponse.json([]);
    }

    const users = await db.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
      },
      take: 10,
      orderBy: { username: "asc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("User search error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Something went wrong" },
      { status: 500 }
    );
  }
}
