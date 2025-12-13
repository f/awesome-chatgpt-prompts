import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function escapeCSVField(field: string): string {
  if (!field) return "";
  
  // Check if field needs quoting (contains comma, newline, quote, or leading/trailing whitespace)
  const needsQuoting = /[,"\n\r]/.test(field) || field !== field.trim();
  
  if (needsQuoting) {
    // Escape double quotes by doubling them
    const escaped = field.replace(/"/g, '""');
    return `"${escaped}"`;
  }
  
  return field;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all public prompts with their category and author
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
            username: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Build CSV content
    const headers = ["act", "prompt", "for_devs", "type", "contributor"];
    const rows = prompts.map((prompt) => {
      const act = escapeCSVField(prompt.title);
      const promptContent = escapeCSVField(prompt.content);
      const forDevs = prompt.category?.slug === "coding" ? "TRUE" : "FALSE";
      const type = prompt.type;
      const contributor = escapeCSVField(prompt.author.username);
      
      return [act, promptContent, forDevs, type, contributor].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    // Return as downloadable CSV file
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="prompts.csv"',
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
