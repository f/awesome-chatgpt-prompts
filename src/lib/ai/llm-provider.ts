import OpenAI from "openai";

// Provider-agnostic LLM completion abstraction.
//
// stageExecutor (and any future caller) depends ONLY on this interface, so the
// underlying provider can be swapped without touching call sites. v1 ships an
// OpenAI-backed implementation that reuses the existing src/lib/ai setup
// (OPENAI_API_KEY / OPENAI_BASE_URL / OPENAI_GENERATIVE_MODEL). Claude can be
// added later as an alternate provider (e.g. when ANTHROPIC_API_KEY exists)
// by registering a new LLMProvider here — no engine changes required.

export interface LLMCompletionRequest {
  /** Optional system / instruction prompt (the stage's prompt content). */
  system?: string;
  /** User input for this turn (the stage input). */
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMCompletionResult {
  output: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
}

export interface LLMProvider {
  readonly name: string;
  complete(req: LLMCompletionRequest): Promise<LLMCompletionResult>;
}

class OpenAIProvider implements LLMProvider {
  readonly name = "openai";
  private client: OpenAI | null = null;
  private readonly model = process.env.OPENAI_GENERATIVE_MODEL || "gpt-4o-mini";

  private getClient(): OpenAI {
    if (!this.client) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not set");
      }
      this.client = new OpenAI({
        apiKey,
        baseURL: process.env.OPENAI_BASE_URL || undefined,
      });
    }
    return this.client;
  }

  async complete(req: LLMCompletionRequest): Promise<LLMCompletionResult> {
    const client = this.getClient();
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (req.system) {
      messages.push({ role: "system", content: req.system });
    }
    messages.push({ role: "user", content: req.prompt });

    const response = await client.chat.completions.create({
      model: this.model,
      messages,
      temperature: req.temperature ?? 0.7,
      max_tokens: req.maxTokens ?? 4000,
    });

    return {
      output: response.choices[0]?.message?.content?.trim() ?? "",
      inputTokens: response.usage?.prompt_tokens ?? 0,
      outputTokens: response.usage?.completion_tokens ?? 0,
      model: response.model ?? this.model,
    };
  }
}

let activeProvider: LLMProvider | null = null;

/** Returns the active LLM provider (OpenAI-backed by default). */
export function getLLMProvider(): LLMProvider {
  if (!activeProvider) {
    activeProvider = new OpenAIProvider();
  }
  return activeProvider;
}

/** Override the active provider (used by tests and future provider swaps). */
export function setLLMProvider(provider: LLMProvider | null): void {
  activeProvider = provider;
}
