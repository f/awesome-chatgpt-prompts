import OpenAI from "openai";
import { getConfig } from "@/lib/config";

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

const GENERATIVE_MODEL = process.env.OPENAI_GENERATIVE_MODEL || "gpt-4o-mini";

export function getAIModelName(): string {
  return GENERATIVE_MODEL;
}

export async function isAIGenerationEnabled(): Promise<boolean> {
  const config = await getConfig();
  return !!(config.features.aiGeneration && process.env.OPENAI_API_KEY);
}

export async function generateSQL(prompt: string): Promise<string> {
  const config = await getConfig();
  if (!config.features.aiGeneration) {
    throw new Error("AI Generation is not enabled");
  }

  const client = getOpenAIClient();
  
  const systemPrompt = `You are an SQL expert. Generate SQL queries for the Hugging Face datasets viewer.
The dataset is "fka/awesome-chatgpt-prompts" with a "train" split.
Available columns: act (prompt title), prompt (prompt content), for_devs (boolean), type (TEXT or STRUCTURED), contributor (author name).

Rules:
- Always use "train" as the table name
- Return ONLY the SQL query, no explanations
- Keep queries simple and efficient
- Use proper SQL syntax for DuckDB
- The generated SQL strings must be in English since all prompts are in English (e.g. if user searches for "çiçekçi" it's florist.)
- Use multiple matchers like SELECT act, prompt FROM train WHERE LOWER(prompt) LIKE '%travel%' OR LOWER(act) LIKE '%travel%' OR LOWER(act) LIKE '%guide%' LIMIT 20;
- Be generative and creative. e.g. if user wrote "joke", search for similar terms.
- SQL must be formatted into lines.`;

  const response = await client.chat.completions.create({
    model: GENERATIVE_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 500,
  });
  
  const content = response.choices[0]?.message?.content || "";
  
  // Clean up the response - remove markdown code blocks if present
  return content
    .replace(/^```sql\n?/i, "")
    .replace(/^```\n?/i, "")
    .replace(/\n?```$/i, "")
    .trim();
}
