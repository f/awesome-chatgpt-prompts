// Types and constants for "Works Best With" feature

// MCP Server configuration for a prompt
export interface PromptMCPConfig {
  command: string;
  tools?: string[];
}

// Well-known AI models (slug -> display info)
export const AI_MODELS = {
  // OpenAI
  "gpt-4o": { name: "GPT-4o", provider: "OpenAI" },
  "gpt-4o-mini": { name: "GPT-4o Mini", provider: "OpenAI" },
  "gpt-4-turbo": { name: "GPT-4 Turbo", provider: "OpenAI" },
  "gpt-4": { name: "GPT-4", provider: "OpenAI" },
  "o1": { name: "o1", provider: "OpenAI" },
  "o1-mini": { name: "o1 Mini", provider: "OpenAI" },
  "o1-pro": { name: "o1 Pro", provider: "OpenAI" },
  "o3": { name: "o3", provider: "OpenAI" },
  "o3-mini": { name: "o3 Mini", provider: "OpenAI" },
  "gpt-4-5": { name: "GPT-4.5", provider: "OpenAI" },

  // Anthropic
  "claude-3-5-sonnet": { name: "Claude 3.5 Sonnet", provider: "Anthropic" },
  "claude-3-5-haiku": { name: "Claude 3.5 Haiku", provider: "Anthropic" },
  "claude-3-opus": { name: "Claude 3 Opus", provider: "Anthropic" },
  "claude-4-sonnet": { name: "Claude 4 Sonnet", provider: "Anthropic" },
  "claude-4-opus": { name: "Claude 4 Opus", provider: "Anthropic" },

  // Google
  "gemini-2-0-flash": { name: "Gemini 2.0 Flash", provider: "Google" },
  "gemini-2-5-pro": { name: "Gemini 2.5 Pro", provider: "Google" },
  "gemini-2-5-flash": { name: "Gemini 2.5 Flash", provider: "Google" },
  "gemma-3": { name: "Gemma 3", provider: "Google" },

  // Meta
  "llama-4": { name: "Llama 4", provider: "Meta" },
  "llama-4-scout": { name: "Llama 4 Scout", provider: "Meta" },
  "llama-4-maverick": { name: "Llama 4 Maverick", provider: "Meta" },
  "llama-3-3": { name: "Llama 3.3", provider: "Meta" },

  // xAI
  "grok-3": { name: "Grok 3", provider: "xAI" },
  "grok-2": { name: "Grok 2", provider: "xAI" },

  // DeepSeek
  "deepseek-r1": { name: "DeepSeek R1", provider: "DeepSeek" },
  "deepseek-v3": { name: "DeepSeek V3", provider: "DeepSeek" },

  // Mistral
  "mistral-large": { name: "Mistral Large", provider: "Mistral" },
  "mixtral-8x22b": { name: "Mixtral 8x22B", provider: "Mistral" },
  "codestral": { name: "Codestral", provider: "Mistral" },

  // Alibaba
  "qwen-2-5": { name: "Qwen 2.5", provider: "Alibaba" },
  "qwen-3": { name: "Qwen 3", provider: "Alibaba" },

  // Microsoft
  "phi-4": { name: "Phi-4", provider: "Microsoft" },

  // Amazon
  "nova-pro": { name: "Nova Pro", provider: "Amazon" },
  "nova-lite": { name: "Nova Lite", provider: "Amazon" },
} as const;

export type AIModelSlug = keyof typeof AI_MODELS;

export function getModelInfo(slug: string): { name: string; provider: string } | null {
  return AI_MODELS[slug as AIModelSlug] ?? null;
}

export function isValidModelSlug(slug: string): slug is AIModelSlug {
  return slug in AI_MODELS;
}

// Get models grouped by provider
export function getModelsByProvider(): Record<string, { slug: string; name: string }[]> {
  const grouped: Record<string, { slug: string; name: string }[]> = {};

  for (const [slug, info] of Object.entries(AI_MODELS)) {
    if (!grouped[info.provider]) {
      grouped[info.provider] = [];
    }
    grouped[info.provider].push({ slug, name: info.name });
  }

  return grouped;
}

// Validate bestWithModels (max 3, valid slugs)
export function validateBestWithModels(models: string[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (models.length > 3) {
    errors.push("Maximum 3 models allowed");
  }

  for (const slug of models) {
    if (!isValidModelSlug(slug)) {
      errors.push(`Unknown model: ${slug}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// Validate bestWithMCP
export function validateBestWithMCP(mcp: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (mcp === null || mcp === undefined) {
    return { valid: true, errors: [] };
  }

  if (typeof mcp !== "object") {
    errors.push("MCP config must be an object");
    return { valid: false, errors };
  }

  const config = mcp as Record<string, unknown>;

  if (!("command" in config) || typeof config.command !== "string") {
    errors.push("MCP config.command is required and must be a string");
  }

  if ("tools" in config && config.tools !== undefined) {
    if (!Array.isArray(config.tools)) {
      errors.push("MCP config.tools must be an array");
    } else if (!config.tools.every((t: unknown) => typeof t === "string")) {
      errors.push("MCP config.tools must be an array of strings");
    }
  }

  return { valid: errors.length === 0, errors };
}
