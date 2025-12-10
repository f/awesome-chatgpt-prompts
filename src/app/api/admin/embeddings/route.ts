import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateAllEmbeddings, isAISearchEnabled } from "@/lib/ai/embeddings";

export async function POST() {
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

    const result = await generateAllEmbeddings();

    return NextResponse.json({
      message: "Embeddings generated",
      ...result,
    });
  } catch (error) {
    console.error("Generate embeddings error:", error);
    return NextResponse.json(
      { error: "Failed to generate embeddings" },
      { status: 500 }
    );
  }
}
