export interface Platform {
  id: string;
  name: string;
  baseUrl: string;
  supportsQuerystring?: boolean;
  isDeeplink?: boolean;
  sponsor?: boolean;
}

// Image generation platforms (Mitte.ai)
export const imagePlatforms: Platform[] = [
  { id: "mitte-nano-banana", name: "Mitte.ai - Nano Banana", baseUrl: "https://mitte.ai?model=nano-banana", sponsor: true },
  { id: "mitte-nano-banana-pro", name: "Mitte.ai - Nano Banana Pro", baseUrl: "https://mitte.ai?model=nano-banana-pro", sponsor: true },
  { id: "mitte-flux-2-flex", name: "Mitte.ai - Flux 2 Flex", baseUrl: "https://mitte.ai?model=flux-2-flex", sponsor: true },
  { id: "mitte-flux-2", name: "Mitte.ai - Flux 2", baseUrl: "https://mitte.ai?model=flux-2", sponsor: true },
];

// Video generation platforms (Mitte.ai)
export const videoPlatforms: Platform[] = [
  { id: "mitte-veo-31", name: "Mitte.ai - Veo 3.1", baseUrl: "https://mitte.ai?model=veo-31", sponsor: true },
  { id: "mitte-kling-26", name: "Mitte.ai - Kling 2.6", baseUrl: "https://mitte.ai?model=kling-26", sponsor: true },
  { id: "mitte-sora-2", name: "Mitte.ai - Sora 2", baseUrl: "https://mitte.ai?model=sora-2", sponsor: true },
  { id: "mitte-remotion", name: "Mitte.ai - Remotion", baseUrl: "https://mitte.ai?model=remotion", sponsor: true },
];

export const codePlatforms: Platform[] = [
  { id: "windsurf", name: "Windsurf", baseUrl: "windsurf://", isDeeplink: true, supportsQuerystring: false, sponsor: true },
  { id: "vscode", name: "VS Code", baseUrl: "vscode://", isDeeplink: true, supportsQuerystring: false },
  { id: "vscode-insiders", name: "VS Code Insiders", baseUrl: "vscode-insiders://", isDeeplink: true, supportsQuerystring: false },
  { id: "cursor", name: "Cursor", baseUrl: "cursor://anysphere.cursor-deeplink/prompt", isDeeplink: true },
  { id: "goose", name: "Goose", baseUrl: "goose://recipe", isDeeplink: true },
  { id: "github-copilot", name: "GitHub Copilot Chat", baseUrl: "https://github.com/copilot" },
  { id: "github-copilot-agents", name: "GitHub Copilot Agents", baseUrl: "https://github.com/copilot/agents" },
  { id: "bolt", name: "Bolt", baseUrl: "https://bolt.new" },
  { id: "lovable", name: "Lovable", baseUrl: "https://lovable.dev" },
  { id: "v0", name: "v0", baseUrl: "https://v0.dev/chat" },
  { id: "ai2sql", name: "AI2SQL", baseUrl: "https://builder.ai2sql.io/dashboard/builder-all-lp?tab=generate" },
];

export const chatPlatforms: Platform[] = [
  { id: "chatgpt", name: "ChatGPT", baseUrl: "https://chatgpt.com" },
  { id: "claude", name: "Claude", baseUrl: "https://claude.ai/new" },
  { id: "copilot", name: "Microsoft Copilot", baseUrl: "https://copilot.microsoft.com", supportsQuerystring: false },
  { id: "deepseek", name: "DeepSeek", baseUrl: "https://chat.deepseek.com", supportsQuerystring: false },
  { id: "fal", name: "fal.ai Sandbox", baseUrl: "https://fal.ai/sandbox" },
  { id: "gemini", name: "Gemini", baseUrl: "https://gemini.google.com/app", supportsQuerystring: false },
  { id: "grok", name: "Grok", baseUrl: "https://grok.com/chat?reasoningMode=none" },
  { id: "grok-deepsearch", name: "Grok Deep Search", baseUrl: "https://grok.com/chat?reasoningMode=deepsearch" },
  { id: "grok-think", name: "Grok Think", baseUrl: "https://grok.com/chat?reasoningMode=think" },
  { id: "huggingface", name: "HuggingChat", baseUrl: "https://huggingface.co/chat" },
  { id: "llama", name: "Meta AI", baseUrl: "https://www.meta.ai" },
  { id: "manus", name: "Manus", baseUrl: "https://manus.im/app" },
  { id: "mistral", name: "Le Chat", baseUrl: "https://chat.mistral.ai/chat" },
  { id: "perplexity", name: "Perplexity", baseUrl: "https://www.perplexity.ai" },
  { id: "phind", name: "Phind", baseUrl: "https://www.phind.com" },
  { id: "pi", name: "Pi", baseUrl: "https://pi.ai", supportsQuerystring: false },
  { id: "poe", name: "Poe", baseUrl: "https://poe.com", supportsQuerystring: false },
  { id: "you", name: "You.com", baseUrl: "https://you.com" },
];

export function buildUrl(
  platformId: string, 
  baseUrl: string, 
  promptText: string, 
  promptTitle?: string, 
  promptDescription?: string
): string {
  const encoded = encodeURIComponent(promptText);
  
  switch (platformId) {
    case "cursor":
      return `${baseUrl}?text=${encoded}`;
    case "goose": {
      const config = JSON.stringify({
        version: "1.0.0",
        title: promptTitle || "Prompt",
        description: promptDescription || "",
        instructions: "This is a prompt imported from prompts.chat.",
        prompt: promptText,
        activities: ["Do it now"]
      });
      const base64Config = Buffer.from(config).toString('base64');
      return `${baseUrl}?config=${base64Config}`;
    }
    case "bolt":
      return `${baseUrl}?prompt=${encoded}`;
    case "chatgpt":
      return `${baseUrl}/?q=${encoded}`;
    case "claude":
      return `${baseUrl}?q=${encoded}`;
    case "github-copilot":
    case "github-copilot-agents":
      return `${baseUrl}?prompt=${encoded}`;
    case "ai2sql":
      return `${baseUrl}&prompt=${encoded}`;
    case "fal":
      return `${baseUrl}?prompt=${encoded}`;
    case "grok":
    case "grok-deepsearch":
    case "grok-think":
      return `${baseUrl}&q=${encoded}`;
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
    case "v0":
      return `${baseUrl}?q=${encoded}`;
    case "you":
      return `${baseUrl}/search?q=${encoded}`;
    case "mitte-nano-banana":
    case "mitte-nano-banana-pro":
    case "mitte-flux-2-flex":
    case "mitte-flux-2":
    case "mitte-veo-31":
    case "mitte-kling-26":
    case "mitte-sora-2":
    case "mitte-remotion":
      return `${baseUrl}&prompt=${encoded}`;
    default:
      return `${baseUrl}?q=${encoded}`;
  }
}
