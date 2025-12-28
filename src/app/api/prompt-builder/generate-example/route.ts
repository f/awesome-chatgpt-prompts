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

// Extract valid method names from TYPE_DEFINITIONS for each builder type
function extractValidMethods(): Map<string, Set<string>> {
  const builderMethods = new Map<string, Set<string>>();
  
  // Match class methods: methodName(params): ReturnType
  const classPatterns = [
    { name: 'video', regex: /export class VideoPromptBuilder \{([\s\S]*?)^\s*\}/m },
    { name: 'audio', regex: /export class AudioPromptBuilder \{([\s\S]*?)^\s*\}/m },
    { name: 'image', regex: /export class ImagePromptBuilder \{([\s\S]*?)^\s*\}/m },
    { name: 'chat', regex: /export class ChatPromptBuilder \{([\s\S]*?)^\s*\}/m },
    { name: 'builder', regex: /export class PromptBuilder \{([\s\S]*?)^\s*\}/m },
  ];
  
  for (const { name, regex } of classPatterns) {
    const match = TYPE_DEFINITIONS.match(regex);
    if (match) {
      const methods = new Set<string>();
      // Match method names: methodName( or methodName<
      const methodMatches = match[1].matchAll(/^\s*(\w+)\s*[(<]/gm);
      for (const m of methodMatches) {
        methods.add(m[1]);
      }
      builderMethods.set(name, methods);
    }
  }
  
  return builderMethods;
}

// Detect which builder type is being used in the code
function detectBuilderType(code: string): string | null {
  if (code.includes("video()")) return "video";
  if (code.includes("audio()")) return "audio";
  if (code.includes("image()")) return "image";
  if (code.includes("chat()")) return "chat";
  if (code.includes("builder()")) return "builder";
  return null;
}

// Remove invalid method calls from the generated code
function removeInvalidMethods(code: string, validMethods: Set<string>): string {
  // Match chained method calls: .methodName( or .methodName({ or .methodName([
  // We need to remove entire method calls including their arguments
  const lines = code.split('\n');
  const cleanedLines: string[] = [];
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    // Check if line contains a method call
    const methodMatch = line.match(/^\s*\.(\w+)\s*\(/);
    if (methodMatch) {
      const methodName = methodMatch[1];
      if (!validMethods.has(methodName)) {
        // Skip this method call - need to find where it ends
        let bracketCount = 0;
        let foundOpen = false;
        let skipUntil = i;
        
        for (let j = i; j < lines.length; j++) {
          const checkLine = lines[j];
          for (const char of checkLine) {
            if (char === '(' || char === '{' || char === '[') {
              bracketCount++;
              foundOpen = true;
            } else if (char === ')' || char === '}' || char === ']') {
              bracketCount--;
            }
          }
          skipUntil = j;
          if (foundOpen && bracketCount === 0) break;
        }
        
        i = skipUntil + 1;
        continue;
      }
    }
    
    cleanedLines.push(line);
    i++;
  }
  
  return cleanedLines.join('\n');
}

// Validate and clean generated code
function validateAndCleanCode(code: string): string {
  const validMethodsMap = extractValidMethods();
  const builderType = detectBuilderType(code);
  
  if (!builderType) return code;
  
  const validMethods = validMethodsMap.get(builderType);
  if (!validMethods || validMethods.size === 0) return code;
  
  // Add common methods that are valid for all builders
  validMethods.add('build');
  
  return removeInvalidMethods(code, validMethods);
}

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

export async function POST() {
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

    // Validate and remove invalid method calls based on TYPE_DEFINITIONS
    cleanCode = validateAndCleanCode(cleanCode.trim());

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
