import OpenAI from "openai";

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return null;
    }
    openai = new OpenAI({ 
      apiKey,
      baseURL: process.env.OPENAI_BASE_URL || undefined,
    });
  }
  return openai;
}

const GENERATIVE_MODEL = process.env.OPENAI_GENERATIVE_MODEL || "gpt-4o-mini";

/**
 * Converts a string to a URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word characters except spaces and hyphens
    .replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
    .substring(0, 100); // Limit length
}

/**
 * Detects if text is likely not in English
 */
function isLikelyNonEnglish(text: string): boolean {
  // Check for common non-ASCII character ranges (CJK, Arabic, Cyrillic, etc.)
  const nonEnglishPattern = /[\u0080-\uFFFF]/;
  return nonEnglishPattern.test(text);
}

/**
 * Translates text to English using OpenAI
 */
export async function translateToEnglish(text: string): Promise<string> {
  const client = getOpenAIClient();
  
  if (!client) {
    // No OpenAI key, return original text
    return text;
  }

  try {
    const response = await client.chat.completions.create({
      model: GENERATIVE_MODEL,
      messages: [
        { 
          role: "system", 
          content: "Translate the following text to English. Return ONLY the translated text, nothing else. If the text is already in English, return it as-is." 
        },
        { role: "user", content: text }
      ],
      temperature: 0.1,
      max_tokens: 200,
    });
    
    return response.choices[0]?.message?.content?.trim() || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}

/**
 * Generates a URL-friendly slug from a title
 * Translates to English first if the title contains non-English characters
 */
export async function generateSlug(title: string): Promise<string> {
  let textToSlugify = title;
  
  // If text contains non-English characters, translate it first
  if (isLikelyNonEnglish(title)) {
    textToSlugify = await translateToEnglish(title);
  }
  
  return slugify(textToSlugify);
}

/**
 * Generates a slug for a prompt, always translating to English first
 * This ensures consistent English slugs regardless of the original language
 */
export async function generatePromptSlug(title: string): Promise<string> {
  // Always translate to English for consistency
  const englishTitle = await translateToEnglish(title);
  return slugify(englishTitle);
}
