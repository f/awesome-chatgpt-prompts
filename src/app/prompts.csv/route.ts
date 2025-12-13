import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function escapeCSVField(field: string): string {
  if (!field) return "";
  
  const needsQuoting = /[,"\n\r]/.test(field) || field !== field.trim();
  
  if (needsQuoting) {
    const escaped = field.replace(/"/g, '""');
    return `"${escaped}"`;
  }
  
  return field;
}

function getUserIdentifier(user: { email: string; username: string; githubUsername: string | null }): string {
  // Determine contributor identifier (immutable to prevent impersonation):
  // 1. githubUsername if set (GitHub OAuth users)
  // 2. username if email ends with @unclaimed.prompts.chat (imported GitHub contributors)
  // 3. email for others (Google, credentials)
  const isUnclaimedAccount = user.email.endsWith('@unclaimed.prompts.chat');
  return user.githubUsername || (isUnclaimedAccount ? user.username : user.email);
}

export async function GET() {
  try {
    const prompts = await db.prompt.findMany({
      where: {
        isPrivate: false,
        isUnlisted: false, // Exclude unlisted prompts from CSV export
        deletedAt: null,
      },
      select: {
        title: true,
        content: true,
        type: true,
        category: {
          select: {
            slug: true,
          },
        },
        author: {
          select: {
            email: true,
            username: true,
            githubUsername: true,
          },
        },
        contributors: {
          select: {
            email: true,
            username: true,
            githubUsername: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const headers = ["act", "prompt", "for_devs", "type", "contributor"];
    const rows = prompts.map((prompt) => {
      const act = escapeCSVField(prompt.title);
      const promptContent = escapeCSVField(prompt.content);
      const forDevs = prompt.category?.slug === "coding" ? "TRUE" : "FALSE";
      const type = prompt.type;
      
      // Build contributor list: author first, then co-contributors
      // Format: "@author,@contributor1,@contributor2" or just "@author"
      const authorId = getUserIdentifier(prompt.author);
      const contributorIds = prompt.contributors
        .map((c: { email: string; username: string; githubUsername: string | null }) => getUserIdentifier(c))
        .filter((id: string) => id !== authorId); // Exclude author from contributors list
      
      const allContributors = [authorId, ...contributorIds];
      const contributorField = escapeCSVField(allContributors.join(","));
      
      return [act, promptContent, forDevs, type, contributorField].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("prompts.csv error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
