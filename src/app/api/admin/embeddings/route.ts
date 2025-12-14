import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateAllEmbeddings, isAISearchEnabled } from "@/lib/ai/embeddings";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const enabled = await isAISearchEnabled();
    if (!enabled) {
      return NextResponse.json(
        { error: "AI Search is not enabled or OPENAI_API_KEY is not set" },
        { status: 400 }
      );
    }

    // Check if regenerate mode
    const { searchParams } = new URL(request.url);
    const regenerate = searchParams.get("regenerate") === "true";

    // Create a streaming response for progress updates
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await generateAllEmbeddings(
            (current, total, success, failed) => {
              const progress = JSON.stringify({ current, total, success, failed, done: false });
              controller.enqueue(encoder.encode(`data: ${progress}\n\n`));
            },
            regenerate
          );
          
          const final = JSON.stringify({ ...result, done: true });
          controller.enqueue(encoder.encode(`data: ${final}\n\n`));
          controller.close();
        } catch (error) {
          const errorMsg = JSON.stringify({ error: "Failed to generate embeddings", done: true });
          controller.enqueue(encoder.encode(`data: ${errorMsg}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Generate embeddings error:", error);
    return NextResponse.json(
      { error: "Failed to generate embeddings" },
      { status: 500 }
    );
  }
}
