import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { translateContent } from "@/lib/ai/generation";
import { z } from "zod";

const translateSchema = z.object({
  content: z.string().min(1),
  targetLanguage: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { content, targetLanguage } = translateSchema.parse(body);

    const translatedContent = await translateContent(content, targetLanguage);

    return NextResponse.json({ translatedContent });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Failed to translate content" },
      { status: 500 }
    );
  }
}
