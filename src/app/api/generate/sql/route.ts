import { NextRequest, NextResponse } from "next/server";
import { generateSQL, isAIGenerationEnabled } from "@/lib/ai/generation";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // A01: Require authentication before generating SQL
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
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
