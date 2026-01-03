import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { improvePrompt } from "@/lib/ai/improve-prompt";
import { db } from "@/lib/db";
import { isValidApiKeyFormat } from "@/lib/api-key";

const requestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(10000, "Prompt too long"),
  outputFormat: z.enum(["text", "structured_json", "structured_yaml"]).default("text"),
  outputType: z.enum(["text", "image", "video", "sound"]).default("text"),
});

async function authenticateRequest(request: NextRequest) {
  // Check for API key in headers
  const apiKey = request.headers.get("x-api-key") || 
                 request.headers.get("authorization")?.replace("Bearer ", "") ||
                 request.headers.get("prompts-api-key");

  if (!apiKey || !isValidApiKeyFormat(apiKey)) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { apiKey },
    select: { id: true, username: true },
  });

  return user;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required. Please provide a valid API key." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { prompt, outputFormat, outputType } = validation.data;

    const result = await improvePrompt({ prompt, outputFormat, outputType });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error improving prompt:", error);

    if (error instanceof Error) {
      // Handle rate limiting
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "An error occurred while improving the prompt" },
      { status: 500 }
    );
  }
}
