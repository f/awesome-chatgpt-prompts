import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { db } from "@/lib/db";
import { isValidApiKeyFormat } from "@/lib/api-key";
import { substituteVariables } from "@/lib/prompt-variables";

const RUN_MODEL = process.env.OPENAI_GENERATIVE_MODEL || "gpt-4o-mini";

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    openai = new OpenAI({
      apiKey,
      baseURL: process.env.OPENAI_BASE_URL || undefined,
    });
  }
  return openai;
}

const runSchema = z.object({
  variables: z.record(z.string()).optional().default({}),
});

async function authenticateByApiKey(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const apiKey = authHeader.slice(7);
  if (!isValidApiKeyFormat(apiKey)) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { apiKey },
    select: {
      id: true,
      username: true,
      generationCreditsRemaining: true,
      dailyGenerationLimit: true,
      flagged: true,
    },
  });

  return user;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate
    const user = await authenticateByApiKey(request);
    if (!user) {
      return NextResponse.json(
        { error: "unauthorized", message: "Valid API key required. Use Authorization: Bearer pchat_xxx" },
        { status: 401 }
      );
    }

    if (user.flagged) {
      return NextResponse.json(
        { error: "forbidden", message: "Account is flagged" },
        { status: 403 }
      );
    }

    // Check credits
    if (user.generationCreditsRemaining <= 0) {
      return NextResponse.json(
        {
          error: "credits_exhausted",
          message: "No generation credits remaining. Credits reset daily.",
          usage: { credits_remaining: 0, daily_limit: user.dailyGenerationLimit },
        },
        { status: 429 }
      );
    }

    const { id: promptId } = await params;

    // Fetch prompt
    const prompt = await db.prompt.findUnique({
      where: { id: promptId },
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        isPrivate: true,
        authorId: true,
        deletedAt: true,
      },
    });

    if (!prompt || prompt.deletedAt) {
      return NextResponse.json(
        { error: "not_found", message: "Prompt not found" },
        { status: 404 }
      );
    }

    // Private prompts only accessible by owner
    if (prompt.isPrivate && prompt.authorId !== user.id) {
      return NextResponse.json(
        { error: "not_found", message: "Prompt not found" },
        { status: 404 }
      );
    }

    // Only TEXT type prompts can be executed
    if (prompt.type !== "TEXT" && prompt.type !== "STRUCTURED") {
      return NextResponse.json(
        { error: "unsupported_type", message: `Prompt type '${prompt.type}' cannot be executed via API. Only TEXT and STRUCTURED prompts are supported.` },
        { status: 400 }
      );
    }

    // Parse and validate body
    const body = await request.json().catch(() => ({}));
    const parsed = runSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "validation_error", message: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { variables } = parsed.data;

    // Substitute variables
    const finalContent = substituteVariables(prompt.content, variables);

    // Call OpenAI
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: RUN_MODEL,
      messages: [
        { role: "user", content: finalContent },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const result = response.choices[0]?.message?.content?.trim() || "";

    // Decrement credits
    await db.user.update({
      where: { id: user.id },
      data: {
        generationCreditsRemaining: { decrement: 1 },
      },
    });

    return NextResponse.json({
      result,
      model: RUN_MODEL,
      prompt_id: prompt.id,
      prompt_title: prompt.title,
      usage: {
        credits_remaining: user.generationCreditsRemaining - 1,
        daily_limit: user.dailyGenerationLimit,
      },
    });
  } catch (error) {
    console.error("Run prompt error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Something went wrong" },
      { status: 500 }
    );
  }
}
