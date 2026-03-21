import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

function getUserIdentifier(user: {
  username: string;
  githubUsername: string | null;
}): string {
  return user.githubUsername || user.username;
}

const CONTENT_PREVIEW_LENGTH = 500;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export const dynamic = "force-dynamic";
export const revalidate = 3600;

function generateETag(count: number, latestUpdatedAt: Date | null): string {
  const raw = `${count}-${latestUpdatedAt?.toISOString() ?? "none"}`;
  const hash = crypto.createHash("md5").update(raw).digest("hex");
  return `"${hash}"`;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fullContent = searchParams.get("full_content") === "true";
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    const isPaginated = pageParam !== null || limitParam !== null;

    const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, parseInt(limitParam ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT)
    );

    const whereClause = {
      isPrivate: false,
      isUnlisted: false,
      deletedAt: null,
    };

    // Fetch total count and latest updatedAt for ETag generation
    const [totalCount, latestPrompt] = await Promise.all([
      db.prompt.count({ where: whereClause }),
      db.prompt.findFirst({
        where: whereClause,
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
    ]);

    // Generate and check ETag for conditional requests
    const etag = generateETag(totalCount, latestPrompt?.updatedAt ?? null);
    const ifNoneMatch = request.headers.get("If-None-Match");

    if (ifNoneMatch && ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Cache-Control":
            "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
        },
      });
    }

    const selectClause = {
      id: true,
      title: true,
      slug: true,
      description: true,
      content: true,
      type: true,
      mediaUrl: true,
      viewCount: true,
      createdAt: true,
      updatedAt: true,
      structuredFormat: true,
      isFeatured: true,
      featuredAt: true,
      requiresMediaUpload: true,
      requiredMediaType: true,
      requiredMediaCount: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
        },
      },
      author: {
        select: {
          username: true,
          name: true,
          avatar: true,
          githubUsername: true,
          verified: true,
        },
      },
      contributors: {
        select: {
          username: true,
          name: true,
          avatar: true,
          githubUsername: true,
          verified: true,
        },
      },
      tags: {
        select: {
          tag: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
            },
          },
        },
      },
      _count: {
        select: {
          votes: true,
          comments: true,
        },
      },
    } as const;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryOptions: any = {
      where: whereClause,
      select: selectClause,
      orderBy: { createdAt: "desc" as const },
    };

    if (isPaginated) {
      queryOptions.skip = (page - 1) * limit;
      queryOptions.take = limit;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prompts: any[] = await db.prompt.findMany(queryOptions);

    const includeFullContent = fullContent;

    const formattedPrompts = prompts.map((prompt) => {
      const content = prompt.content ?? "";
      const contentPreview =
        content.length > CONTENT_PREVIEW_LENGTH
          ? content.slice(0, CONTENT_PREVIEW_LENGTH) + "..."
          : content;

      return {
        id: prompt.id,
        title: prompt.title,
        slug: prompt.slug,
        description: prompt.description,
        ...(includeFullContent
          ? { content, contentPreview }
          : { contentPreview }),
        type: prompt.type,
        structuredFormat: prompt.structuredFormat,
        mediaUrl: prompt.mediaUrl,
        viewCount: prompt.viewCount,
        voteCount: prompt._count.votes,
        commentCount: prompt._count.comments,
        isFeatured: prompt.isFeatured,
        featuredAt: prompt.featuredAt,
        requiresMediaUpload: prompt.requiresMediaUpload,
        requiredMediaType: prompt.requiredMediaType,
        requiredMediaCount: prompt.requiredMediaCount,
        createdAt: prompt.createdAt,
        updatedAt: prompt.updatedAt,
        category: prompt.category
          ? {
              id: prompt.category.id,
              name: prompt.category.name,
              slug: prompt.category.slug,
              icon: prompt.category.icon,
            }
          : null,
        author: {
          username: prompt.author.username,
          name: prompt.author.name,
          avatar: prompt.author.avatar,
          identifier: getUserIdentifier(prompt.author),
          verified: prompt.author.verified,
        },
        contributors: prompt.contributors.map((c: { username: string; name: string | null; avatar: string | null; githubUsername: string | null; verified: boolean }) => ({
          username: c.username,
          name: c.name,
          avatar: c.avatar,
          identifier: getUserIdentifier(c),
          verified: c.verified,
        })),
        tags: prompt.tags.map((pt: { tag: { id: string; name: string; slug: string; color: string | null } }) => ({
          id: pt.tag.id,
          name: pt.tag.name,
          slug: pt.tag.slug,
          color: pt.tag.color,
        })),
      };
    });

    const totalPages = isPaginated ? Math.ceil(totalCount / limit) : 1;

    const responseBody = isPaginated
      ? {
          count: totalCount,
          page,
          limit,
          totalPages,
          hasMore: page < totalPages,
          prompts: formattedPrompts,
        }
      : {
          count: formattedPrompts.length,
          prompts: formattedPrompts,
        };

    return NextResponse.json(responseBody, {
      headers: {
        "Cache-Control":
          "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
        ETag: etag,
      },
    });
  } catch (error) {
    console.error("prompts.json error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
