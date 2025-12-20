import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function getUserIdentifier(user: {
  username: string;
  githubUsername: string | null;
}): string {
  return user.githubUsername || user.username;
}

export async function GET() {
  try {
    const prompts = await db.prompt.findMany({
      where: {
        isPrivate: false,
        isUnlisted: false,
        deletedAt: null,
      },
      select: {
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
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedPrompts = prompts.map((prompt) => ({
      id: prompt.id,
      title: prompt.title,
      slug: prompt.slug,
      description: prompt.description,
      content: prompt.content,
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
      contributors: prompt.contributors.map((c) => ({
        username: c.username,
        name: c.name,
        avatar: c.avatar,
        identifier: getUserIdentifier(c),
        verified: c.verified,
      })),
      tags: prompt.tags.map((pt) => ({
        id: pt.tag.id,
        name: pt.tag.name,
        slug: pt.tag.slug,
        color: pt.tag.color,
      })),
    }));

    return NextResponse.json(
      {
        count: formattedPrompts.length,
        prompts: formattedPrompts,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=3600",
        },
      }
    );
  } catch (error) {
    console.error("prompts.json error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
