export interface Variable {
  name: string;
  defaultValue: string;
}

/**
 * Extract variables from prompt content in ${variableName} or ${variableName:default} format
 */
export function extractVariables(content: string): Variable[] {
  const regex = /\$\{([^}:]+)(?::([^}]*))?\}/g;
  const variables: Variable[] = [];
  const seen = new Set<string>();

  let match;
  while ((match = regex.exec(content)) !== null) {
    const name = match[1].trim();
    const defaultValue = match[2]?.trim() || "";

    if (!seen.has(name)) {
      seen.add(name);
      variables.push({ name, defaultValue });
    }
  }

  return variables;
}

/**
 * Compile a prompt template with variable values
 */
export function compilePrompt(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(
    /\$\{([^}:]+)(?::([^}]*))?\}/g,
    (match, name, defaultValue) => {
      const trimmedName = name.trim();
      return values[trimmedName] ?? defaultValue?.trim() ?? match;
    },
  );
}

export interface Platform {
  id: string;
  name: string;
  baseUrl: string;
  supportsQuerystring: boolean;
  isDeeplink?: boolean;
}

// Chat platforms (AI assistants)
export const chatPlatforms: Platform[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    baseUrl: "https://chatgpt.com",
    supportsQuerystring: true,
  },
  {
    id: "claude",
    name: "Claude",
    baseUrl: "https://claude.ai/new",
    supportsQuerystring: true,
  },
  {
    id: "copilot",
    name: "Microsoft Copilot",
    baseUrl: "https://copilot.microsoft.com",
    supportsQuerystring: false,
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    baseUrl: "https://chat.deepseek.com",
    supportsQuerystring: false,
  },
  {
    id: "fal",
    name: "fal.ai Sandbox",
    baseUrl: "https://fal.ai/sandbox",
    supportsQuerystring: true,
  },
  {
    id: "gemini",
    name: "Gemini",
    baseUrl: "https://gemini.google.com/app",
    supportsQuerystring: false,
  },
  {
    id: "goose-chat",
    name: "Goose",
    baseUrl: "goose://recipe",
    supportsQuerystring: true,
    isDeeplink: true,
  },
  {
    id: "grok",
    name: "Grok",
    baseUrl: "https://grok.com/chat?reasoningMode=none",
    supportsQuerystring: true,
  },
  {
    id: "huggingface",
    name: "HuggingChat",
    baseUrl: "https://huggingface.co/chat",
    supportsQuerystring: true,
  },
  {
    id: "llama",
    name: "Meta AI",
    baseUrl: "https://www.meta.ai",
    supportsQuerystring: false,
  },
  {
    id: "manus",
    name: "Manus",
    baseUrl: "https://manus.im/app",
    supportsQuerystring: false,
  },
  {
    id: "mistral",
    name: "Le Chat",
    baseUrl: "https://chat.mistral.ai/chat",
    supportsQuerystring: true,
  },
  {
    id: "perplexity",
    name: "Perplexity",
    baseUrl: "https://www.perplexity.ai",
    supportsQuerystring: true,
  },
  {
    id: "phind",
    name: "Phind",
    baseUrl: "https://www.phind.com",
    supportsQuerystring: true,
  },
  {
    id: "pi",
    name: "Pi",
    baseUrl: "https://pi.ai",
    supportsQuerystring: false,
  },
  {
    id: "poe",
    name: "Poe",
    baseUrl: "https://poe.com",
    supportsQuerystring: false,
  },
  {
    id: "you",
    name: "You.com",
    baseUrl: "https://you.com",
    supportsQuerystring: true,
  },
];

// Code platforms (IDEs + code generation tools)
export const codePlatforms: Platform[] = [
  {
    id: "windsurf",
    name: "Windsurf",
    baseUrl: "windsurf://",
    supportsQuerystring: false,
    isDeeplink: true,
  },
  {
    id: "cursor",
    name: "Cursor",
    baseUrl: "cursor://anysphere.cursor-deeplink/prompt",
    supportsQuerystring: true,
    isDeeplink: true,
  },
  {
    id: "vscode",
    name: "VS Code",
    baseUrl: "vscode://",
    supportsQuerystring: false,
    isDeeplink: true,
  },
  {
    id: "vscode-insiders",
    name: "VS Code Insiders",
    baseUrl: "vscode-insiders://",
    supportsQuerystring: false,
    isDeeplink: true,
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    baseUrl: "https://github.com/copilot",
    supportsQuerystring: true,
  },
  {
    id: "bolt",
    name: "Bolt",
    baseUrl: "https://bolt.new",
    supportsQuerystring: true,
  },
  {
    id: "lovable",
    name: "Lovable",
    baseUrl: "https://lovable.dev",
    supportsQuerystring: true,
  },
  {
    id: "v0",
    name: "v0",
    baseUrl: "https://v0.dev/chat",
    supportsQuerystring: true,
  },
  {
    id: "ai2sql",
    name: "AI2SQL",
    baseUrl: "https://builder.ai2sql.io/dashboard/builder-all-lp?tab=generate",
    supportsQuerystring: true,
  },
];

// Image generation platforms
export const imagePlatforms: Platform[] = [
  {
    id: "mitte-image",
    name: "Mitte.ai (Image)",
    baseUrl: "https://mitte.ai",
    supportsQuerystring: true,
  },
];

// Video generation platforms
export const videoPlatforms: Platform[] = [
  {
    id: "mitte-video",
    name: "Mitte.ai (Video)",
    baseUrl: "https://mitte.ai",
    supportsQuerystring: true,
  },
];

export function buildUrl(
  platformId: string,
  baseUrl: string,
  promptText: string,
  promptTitle?: string,
  promptDescription?: string,
): string {
  const encoded = encodeURIComponent(promptText);

  switch (platformId) {
    // IDE deeplinks
    case "cursor":
      return `${baseUrl}?text=${encoded}`;
    case "goose":
    case "goose-chat": {
      const config = JSON.stringify({
        version: "1.0.0",
        title: promptTitle || "Prompt",
        description: promptDescription || "",
        instructions:
          "This is a prompt imported from prompts.chat. Follow the instructions below to complete the task.",
        prompt: promptText,
        activities: [
          "message:This prompt was imported from prompts.chat. Follow the instructions below to complete the task.",
          "Do it now",
          "Learn more about the instructions",
        ],
      });
      const base64Config = Buffer.from(config).toString("base64");
      return `${baseUrl}?config=${base64Config}`;
    }
    // Web platforms
    case "ai2sql":
      return `${baseUrl}&prompt=${encoded}`;
    case "bolt":
      return `${baseUrl}?prompt=${encoded}`;
    case "chatgpt":
      return `${baseUrl}/?q=${encoded}`;
    case "claude":
      return `${baseUrl}?q=${encoded}`;
    case "copilot":
      return `${baseUrl}/?q=${encoded}`;
    case "deepseek":
      return `${baseUrl}/?q=${encoded}`;
    case "github-copilot":
      return `${baseUrl}?prompt=${encoded}`;
    case "grok":
      return `${baseUrl}&q=${encoded}`;
    case "fal":
      return `${baseUrl}?prompt=${encoded}`;
    case "huggingface":
      return `${baseUrl}/?prompt=${encoded}`;
    case "lovable":
      return `${baseUrl}/?autosubmit=true#prompt=${encoded}`;
    case "mistral":
      return `${baseUrl}?q=${encoded}`;
    case "perplexity":
      return `${baseUrl}/search?q=${encoded}`;
    case "phind":
      return `${baseUrl}/search?q=${encoded}`;
    case "poe":
      return `${baseUrl}/?q=${encoded}`;
    case "v0":
      return `${baseUrl}?q=${encoded}`;
    case "you":
      return `${baseUrl}/search?q=${encoded}`;
    case "mitte-image":
    case "mitte-video":
      return `${baseUrl}?prompt=${encoded}`;
    default:
      return `${baseUrl}?q=${encoded}`;
  }
}
