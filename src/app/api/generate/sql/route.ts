import { NextRequest, NextResponse } from "next/server";
import { generateSQL, isAIGenerationEnabled } from "@/lib/ai/generation";

export async function POST(request: NextRequest) {
  try {
    const enabled = await isAIGenerationEnabled();
    if (!enabled) {
      return NextResponse.json(
        { error: "AI Generation is not enabled" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { prompt } = body;

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const sql = await generateSQL(prompt);

    return NextResponse.json({ sql });
  } catch (error) {
    console.error("SQL Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate SQL" },
      { status: 500 }
    );
  }
}
