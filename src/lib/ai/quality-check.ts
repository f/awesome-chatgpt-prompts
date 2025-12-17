import OpenAI from "openai";

// DelistReason enum values (matches Prisma schema)
export type DelistReason = "TOO_SHORT" | "NOT_ENGLISH" | "LOW_QUALITY" | "NOT_LLM_INSTRUCTION" | "MANUAL";

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

const GENERATIVE_MODEL = process.env.OPENAI_GENERATIVE_MODEL || "gpt-4o";

// Minimum character count for prompt content
const MIN_CONTENT_LENGTH = 50;

// Minimum word count for prompt content
const MIN_WORD_COUNT = 10;

export interface QualityCheckResult {
  shouldDelist: boolean;
  reason: DelistReason | null;
  confidence: number;
  details: string;
}

/**
 * Performs basic length checks on prompt content
 */
function checkLength(content: string): QualityCheckResult | null {
  const trimmed = content.trim();
  const wordCount = trimmed.split(/\s+/).filter(w => w.length > 0).length;

  if (trimmed.length < MIN_CONTENT_LENGTH) {
    return {
      shouldDelist: true,
      reason: "TOO_SHORT",
      confidence: 1.0,
      details: `Content is too short (${trimmed.length} chars, minimum ${MIN_CONTENT_LENGTH})`,
    };
  }

  if (wordCount < MIN_WORD_COUNT) {
    return {
      shouldDelist: true,
      reason: "TOO_SHORT",
      confidence: 1.0,
      details: `Content has too few words (${wordCount} words, minimum ${MIN_WORD_COUNT})`,
    };
  }

  return null;
}

/**
 * AI-powered quality check for prompt content
 * Returns quality assessment with high precision to avoid false positives
 */
export async function checkPromptQuality(
  title: string,
  content: string,
  description?: string | null
): Promise<QualityCheckResult> {
  console.log(`[Quality Check] Checking: "${title}" (${content.length} chars)`);
  
  // First, run basic length checks (no AI needed)
  const lengthCheck = checkLength(content);
  if (lengthCheck) {
    console.log(`[Quality Check] Length check failed:`, lengthCheck);
    return lengthCheck;
  }

  // Check if OpenAI is available
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log(`[Quality Check] No OpenAI API key - skipping AI check`);
    // If no AI available, pass the check (avoid false positives)
    return {
      shouldDelist: false,
      reason: null,
      confidence: 0,
      details: "AI quality check skipped - no API key configured",
    };
  }
  
  console.log(`[Quality Check] Running AI check...`);

  try {
    const client = getOpenAIClient();

    const systemPrompt = `You are a quality assurance system for an AI prompt sharing platform.
Your job is to evaluate if a submitted prompt meets quality standards.

IMPORTANT: You must be VERY conservative. Only flag prompts that are CLEARLY problematic.
When in doubt, APPROVE the prompt. False positives are worse than false negatives.

Evaluate the prompt for these issues:

1. LOW_QUALITY: The prompt is extremely low quality.
   - Random characters, keyboard mashing, or gibberish
   - Completely meaningless or incoherent text
   - NOT low quality: Simple prompts, informal language, or beginner-level prompts

2. NOT_LLM_INSTRUCTION: The content is NOT an instruction for an generative AI tool (LLM, image, video or sound generation text).
   - This platform is for LLM, image, video or sound generation prompts/instructions only
   - Flag if it's clearly NOT a prompt (e.g., a recipe, personal note, random text, advertisement)
   - APPROVE if it could reasonably be used to instruct an AI, even if unusual
   - APPROVE roleplay scenarios, persona definitions, and creative prompts
   - APPROVE technical, coding, or specialized domain prompts

Respond with a JSON object:
{
  "shouldDelist": boolean,
  "reason": "NOT_ENGLISH" | "LOW_QUALITY" | "NOT_LLM_INSTRUCTION" | null,
  "confidence": number (0.0 to 1.0),
  "details": "Brief explanation"
}

CRITICAL RULES:
- Only set shouldDelist: true if confidence >= 0.85
- When uncertain, set shouldDelist: false
- Creative, roleplay, and unusual prompts are VALID
- Short but clear prompts are VALID
- Prompts in specialized domains are VALID`;

    const userMessage = `Title: ${title}
${description ? `Description: ${description}\n` : ""}
Content:
${content}`;

    const response = await client.chat.completions.create({
      model: GENERATIVE_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.1, // Low temperature for consistent results
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const responseText = response.choices[0]?.message?.content || "{}";
    console.log(`[Quality Check] AI response:`, responseText);
    
    try {
      const result = JSON.parse(responseText);
      
      // Extra safety: only delist if confidence is high enough
      if (result.shouldDelist && result.confidence < 0.85) {
        return {
          shouldDelist: false,
          reason: null,
          confidence: result.confidence,
          details: `Below confidence threshold: ${result.details}`,
        };
      }

      return {
        shouldDelist: !!result.shouldDelist,
        reason: result.reason as DelistReason | null,
        confidence: result.confidence || 0,
        details: result.details || "Quality check completed",
      };
    } catch {
      console.error("Failed to parse AI quality check response:", responseText);
      // On parse error, don't delist (avoid false positives)
      return {
        shouldDelist: false,
        reason: null,
        confidence: 0,
        details: "Failed to parse AI response - defaulting to approve",
      };
    }
  } catch (error) {
    console.error("AI quality check error:", error);
    // On error, don't delist (avoid false positives)
    return {
      shouldDelist: false,
      reason: null,
      confidence: 0,
      details: "AI quality check failed - defaulting to approve",
    };
  }
}

/**
 * Check if auto-delist feature is enabled
 */
export async function isAutoDelistEnabled(): Promise<boolean> {
  // Auto-delist requires OpenAI API key for AI checks
  // Basic length checks will still work without it
  return true;
}
