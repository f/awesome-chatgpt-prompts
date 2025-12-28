import { NextRequest } from "next/server";
import OpenAI from "openai";
import { auth } from "@/lib/auth";
import { getConfig } from "@/lib/config";
import { loadPrompt, interpolatePrompt } from "@/lib/ai/load-prompt";
import { TYPE_DEFINITIONS } from "@/data/type-definitions";
import {
  EXAMPLE_VIDEO,
  EXAMPLE_AUDIO,
  EXAMPLE_IMAGE,
  EXAMPLE_CHAT,
  DEFAULT_CODE,
} from "@/components/ide/examples";

const generateExamplePrompt = loadPrompt("src/lib/ai/generate-example.prompt.yml");

const GENERATIVE_MODEL = process.env.OPENAI_GENERATIVE_MODEL || "gpt-4o";

// Rate limiting: 1 request per minute per user
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 1;

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitStore.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetIn: userLimit.resetAt - now };
  }

  userLimit.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - userLimit.count, resetIn: userLimit.resetAt - now };
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized. Please log in to generate examples." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Check rate limit
  const userId = session.user.id || session.user.email || "anonymous";
  const rateLimit = checkRateLimit(userId);
  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({ 
      error: "Rate limit exceeded. You can generate one example per minute.",
      resetIn: Math.ceil(rateLimit.resetIn / 1000)
    }), {
      status: 429,
      headers: { 
        "Content-Type": "application/json",
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetIn / 1000)),
      },
    });
  }

  const config = await getConfig();
  if (!config.features.aiGeneration) {
    return new Response(JSON.stringify({ error: "AI generation is not enabled" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const openai = new OpenAI({
      apiKey,
      baseURL: process.env.OPENAI_BASE_URL || undefined,
    });

    // Prepare existing examples summary
    const existingExamples = `
### Video Example (Samurai in bamboo forest theme)
${EXAMPLE_VIDEO.substring(0, 500)}...

### Audio Example (Synthwave music theme)
${EXAMPLE_AUDIO.substring(0, 500)}...

### Image Example (Library in tree theme)
${EXAMPLE_IMAGE.substring(0, 500)}...

### Chat Example (Code reviewer theme)
${EXAMPLE_CHAT}

### Default Builder Example (TypeScript code review theme)
${DEFAULT_CODE}
`;

    // Build messages with interpolated variables
    const systemMessage = generateExamplePrompt.messages.find(m => m.role === "system");
    const userMessage = generateExamplePrompt.messages.find(m => m.role === "user");

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: interpolatePrompt(systemMessage?.content || "", {
          typeDefinitions: TYPE_DEFINITIONS,
        }),
      },
      {
        role: "user",
        content: interpolatePrompt(userMessage?.content || "", {
          existingExamples,
        }),
      },
    ];

    const response = await openai.chat.completions.create({
      model: GENERATIVE_MODEL,
      messages,
      temperature: generateExamplePrompt.modelParameters?.temperature || 0.9,
      max_tokens: generateExamplePrompt.modelParameters?.maxTokens || 2000,
    });

    const generatedCode = response.choices[0]?.message?.content || "";

    // Clean up the response - remove markdown code blocks if present
    let cleanCode = generatedCode.trim();
    if (cleanCode.startsWith("```typescript") || cleanCode.startsWith("```ts")) {
      cleanCode = cleanCode.replace(/^```(?:typescript|ts)\n?/, "").replace(/\n?```$/, "");
    } else if (cleanCode.startsWith("```")) {
      cleanCode = cleanCode.replace(/^```\n?/, "").replace(/\n?```$/, "");
    }

    return new Response(JSON.stringify({ code: cleanCode.trim() }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generate example error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate example" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
