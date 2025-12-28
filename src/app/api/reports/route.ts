import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const reportSchema = z.object({
  promptId: z.string().min(1),
  reason: z.enum(["SPAM", "INAPPROPRIATE", "COPYRIGHT", "MISLEADING", "RELIST_REQUEST", "OTHER"]),
  details: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { promptId, reason, details } = reportSchema.parse(body);

    // Check if prompt exists
    const prompt = await db.prompt.findUnique({
      where: { id: promptId },
      select: { id: true, authorId: true },
    });

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    // Prevent self-reporting (except for relist requests)
    if (prompt.authorId === session.user.id && reason !== "RELIST_REQUEST") {
      return NextResponse.json(
        { error: "You cannot report your own prompt" },
        { status: 400 }
      );
    }

    // Check if user already reported this prompt
    const existingReport = await db.promptReport.findFirst({
      where: {
        promptId,
        reporterId: session.user.id,
        status: "PENDING",
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this prompt" },
        { status: 400 }
      );
    }

    // Create the report
    await db.promptReport.create({
      data: {
        promptId,
        reporterId: session.user.id,
        reason,
        details: details || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }
    console.error("Report creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
