import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "all"; // all, month, week

    // Calculate date filters
    const now = new Date();
    let dateFilter: Date | undefined;

    if (period === "week") {
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "month") {
      dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get prompts with vote counts and author info
    const prompts = await db.prompt.findMany({
      where: {
        isPrivate: false,
        deletedAt: null,
      },
      select: {
        id: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        votes: dateFilter
          ? {
              where: {
                createdAt: { gte: dateFilter },
              },
              select: { promptId: true },
            }
          : {
              select: { promptId: true },
            },
      },
    });

    // Aggregate votes by user
    const userVotes = new Map<string, {
      id: string;
      name: string | null;
      username: string;
      avatar: string | null;
      totalUpvotes: number;
    }>();

    for (const prompt of prompts) {
      const author = prompt.author;
      const voteCount = prompt.votes.length;
      
      if (voteCount === 0) continue;
      
      const existing = userVotes.get(author.id);
      
      if (existing) {
        existing.totalUpvotes += voteCount;
      } else {
        userVotes.set(author.id, {
          id: author.id,
          name: author.name,
          username: author.username,
          avatar: author.avatar,
          totalUpvotes: voteCount,
        });
      }
    }

    // Get total prompt counts for users with upvotes
    const userIds = Array.from(userVotes.keys());
    const promptCounts = await db.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        _count: {
          select: {
            prompts: {
              where: {
                isPrivate: false,
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    const promptCountMap = new Map(promptCounts.map((u) => [u.id, u._count.prompts]));

    // Convert to array and sort by upvotes
    let leaderboard = Array.from(userVotes.values())
      .map((user) => ({
        ...user,
        promptCount: promptCountMap.get(user.id) || 0,
      }))
      .sort((a, b) => b.totalUpvotes - a.totalUpvotes)
      .slice(0, 50);

    const MIN_USERS = 10;

    // If less than 10 users, fill with users who have most prompts
    if (leaderboard.length < MIN_USERS) {
      const existingUserIds = new Set(leaderboard.map((u) => u.id));

      const usersWithPrompts = await db.user.findMany({
        where: {
          id: { notIn: Array.from(existingUserIds) },
          prompts: {
            some: {
              isPrivate: false,
              deletedAt: null,
              ...(dateFilter ? { createdAt: { gte: dateFilter } } : {}),
            },
          },
        },
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          _count: {
            select: {
              prompts: {
                where: {
                  isPrivate: false,
                  deletedAt: null,
                  ...(dateFilter ? { createdAt: { gte: dateFilter } } : {}),
                },
              },
            },
          },
        },
        orderBy: {
          prompts: {
            _count: "desc",
          },
        },
        take: MIN_USERS - leaderboard.length,
      });

      const additionalUsers = usersWithPrompts.map((user) => ({
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        totalUpvotes: 0,
        promptCount: user._count.prompts,
      }));

      leaderboard = [...leaderboard, ...additionalUsers];
    }

    return NextResponse.json({
      period,
      leaderboard,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Something went wrong" },
      { status: 500 }
    );
  }
}
