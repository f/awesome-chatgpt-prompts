import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generatePromptSlug } from "@/lib/slug";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "unauthorized", message: "Admin access required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const regenerateAll = searchParams.get("regenerate") === "true";

    // Get prompts that need slug generation
    const whereClause = regenerateAll
      ? { deletedAt: null }
      : { slug: null, deletedAt: null };

    const prompts = await db.prompt.findMany({
      where: whereClause,
      select: { id: true, title: true },
    });

    if (prompts.length === 0) {
      return NextResponse.json({
        success: true,
        updated: 0,
        message: "No prompts to update",
      });
    }

    // Stream response for progress updates
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let success = 0;
        let failed = 0;

        for (let i = 0; i < prompts.length; i++) {
          const prompt = prompts[i];
          
          try {
            const slug = await generatePromptSlug(prompt.title);
            
            await db.prompt.update({
              where: { id: prompt.id },
              data: { slug },
            });
            
            success++;
          } catch (error) {
            console.error(`Failed to generate slug for prompt ${prompt.id}:`, error);
            failed++;
          }

          // Send progress update
          const progress = {
            current: i + 1,
            total: prompts.length,
            success,
            failed,
            done: false,
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(progress)}\n\n`));
        }

        // Send final result
        const finalResult = {
          current: prompts.length,
          total: prompts.length,
          success,
          failed,
          done: true,
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalResult)}\n\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Generate slugs error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// GET endpoint to check slug status
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "unauthorized", message: "Admin access required" },
        { status: 401 }
      );
    }

    const [promptsWithoutSlugs, totalPrompts] = await Promise.all([
      db.prompt.count({
        where: {
          slug: null,
          deletedAt: null,
        },
      }),
      db.prompt.count({
        where: {
          deletedAt: null,
        },
      }),
    ]);

    return NextResponse.json({
      promptsWithoutSlugs,
      totalPrompts,
    });
  } catch (error) {
    console.error("Get slug status error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Something went wrong" },
      { status: 500 }
    );
  }
}
