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

export async function GET() {
  try {
    const prompts = await db.prompt.findMany({
      where: {
        isPrivate: false,
        deletedAt: null,
      },
      include: {
        category: {
          select: {
            slug: true,
          },
        },
        author: {
          select: {
            email: true,
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
      // Use githubUsername for GitHub users, email for others (Google, credentials)
      // This prevents impersonation since these identifiers are immutable
      const contributor = escapeCSVField(prompt.author.githubUsername || prompt.author.email);
      
      return [act, promptContent, forDevs, type, contributor].join(",");
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
