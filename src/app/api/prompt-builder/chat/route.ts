import { NextRequest } from "next/server";
import OpenAI from "openai";
import { auth } from "@/lib/auth";
import { getConfig } from "@/lib/config";
import {
  PROMPT_BUILDER_TOOLS,
  executeToolCall,
  type PromptBuilderState,
} from "@/lib/ai/prompt-builder-tools";

const GENERATIVE_MODEL = process.env.OPENAI_GENERATIVE_MODEL || "gpt-4o-mini";

const SYSTEM_PROMPT = `You are an expert prompt engineer agent. Your job is to quickly build high-quality prompts that match the style and quality of existing prompts in the database.

MANDATORY FIRST STEP - LEARN FROM EXAMPLES:
Before creating ANY prompt, you MUST first call search_prompts to study existing prompts in the database.
This is NON-NEGOTIABLE. You need to understand how prompts are written in this system before creating new ones.
Study the structure, tone, format, and quality of existing prompts and match that style.

IMPORTANT - REASONING FORMAT:
Before EVERY tool call, write a brief reasoning line starting with "→" to explain what you're about to do.
Example: "→ Searching for similar prompts to learn the style..."
This makes your actions transparent and agentic.

WORKFLOW FOR NEW PROMPTS:
1. MANDATORY: Call search_prompts FIRST to study 3-5 similar examples - learn their structure, tone, and format
2. Analyze the examples to understand how prompts are written in this database
3. Create your prompt matching that same quality and style using tools (set_title, set_description, set_content, set_tags)
4. Only respond with a brief summary of what you created

WORKFLOW FOR CHANGES/EDITS:
1. The current prompt state is provided below - review it first
2. Make ONLY the requested changes, keep everything else intact
3. When editing content, preserve existing text and modify only what's needed

WORKFLOW FOR JSON/STRUCTURED CONVERSION:
1. FIRST search for similar JSON prompts: search_prompts(query, promptType="STRUCTURED", structuredFormat="JSON")
2. Analyze the current prompt and break it into logical parts/sections
3. Create a JSON object with meaningful keys for each part of the prompt
4. Structure example:
   {
     "role": "Description of the AI's role",
     "context": "Background information",
     "task": "Main instruction",
     "constraints": ["rule1", "rule2"],
     "output_format": "Expected response format",
     "examples": [{"input": "...", "output": "..."}],
     "variables": {"key": "description"}
   }
5. Set type to STRUCTURED and structuredFormat to JSON using set_type tool
6. Preserve ALL original content - just reorganize into JSON structure

AUTO-DETECT MEDIA REQUIREMENTS:
If the user's request mentions any of these, automatically call set_media_requirements:
- "file", "document", "PDF", "image", "photo", "picture", "screenshot", "upload"
- "analyze this", "look at this", "attached", "attachment"
- Any indication they want to provide media input to the prompt
Set appropriate mediaType (IMAGE, VIDEO, DOCUMENT) based on context.

RULES:
- NEVER skip searching for examples - this is your first action for ANY new prompt
- Be ACTION-ORIENTED: Use tools immediately, don't ask many questions
- ALWAYS write reasoning ("→ ...") before each tool call
- For NEW prompts: MUST search for examples first to learn the style, then build matching that style
- For EDITS: modify only what the user asked, don't rewrite everything
- For JSON: search structured prompts first, then convert preserving all content
- Auto-detect and set media requirements when user mentions files/uploads
- Use variables: \${variableName} or \${variableName:defaultValue} for customizable parts
- Keep responses SHORT - just confirm what you did
- If the request is clear, act immediately (but always search examples first for new prompts)
- Only ask ONE clarifying question if absolutely necessary

PROMPT STYLE (MANDATORY FOR TEXT PROMPTS):
- ALWAYS use "Act as" role-playing format: "Act as a [role]. You are [description]..."
- Be INSTRUCTIVE and IMPERATIVE: Use "do this", "act as", "you will", "your task is"
- Define a clear ROLE/PERSONA the AI should adopt
- Include specific RESPONSIBILITIES and BEHAVIORS
- Add CONSTRAINTS and RULES for the role
- Example format:
  "Act as a [Role]. You are an expert in [domain] with [experience/skills].
   Your task is to [main objective].
   You will:
   - [Responsibility 1]
   - [Responsibility 2]
   Rules:
   - [Constraint 1]
   - [Constraint 2]"

VARIABLES (HIGHLY ENCOURAGED):
- ALWAYS look for opportunities to add variables to make prompts reusable
- Use syntax: \${variableName} or \${variableName:defaultValue}
- Common variable patterns:
  - \${topic} - main subject/topic
  - \${language:English} - target language with default
  - \${tone:professional} - writing tone
  - \${length:medium} - output length
  - \${context} - additional context from user
  - \${input} - user's input text to process
- Variables make prompts flexible and powerful - include at least 1-2 in every prompt
- Example: "Translate the following text to \${language:Spanish}"

PROMPT QUALITY:
- Write clear, specific instructions
- Include context and constraints
- Add examples when helpful
- Use structured sections for complex prompts
- Make prompts reusable with variables (see above)

You have tools to: search_prompts (with promptType and structuredFormat filters), set_title, set_description, set_content, set_type, set_tags, set_category, set_privacy, set_media_requirements, get_current_state, get_available_tags, get_available_categories.

Act fast. Build immediately. For edits, preserve existing content.`;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: string;
  }>;
  toolResults?: Array<{
    id: string;
    result: unknown;
  }>;
}

interface RequestBody {
  messages: ChatMessage[];
  currentState: PromptBuilderState;
  availableTags: Array<{ id: string; name: string; slug: string; color: string }>;
  availableCategories: Array<{ id: string; name: string; slug: string; parentId: string | null }>;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
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

  const body: RequestBody = await request.json();
  const { messages, currentState, availableTags, availableCategories } = body;

  // Create a streaming response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const openai = new OpenAI({
          apiKey,
          baseURL: process.env.OPENAI_BASE_URL || undefined,
        });

        // Build available tags and categories context
        const tagNames = availableTags.map(t => t.name).join(", ");
        const categoryNames = availableCategories.map(c => c.name).join(", ");
        
        const availableContext = `

AVAILABLE TAGS (use exact names with set_tags):
${tagNames || "(none)"}

AVAILABLE CATEGORIES (use exact names with set_category):
${categoryNames || "(none)"}`;

        // Build system message with current state context
        const hasContent = currentState.title || currentState.content || currentState.description;
        const selectedTagNames = currentState.tagIds
          .map(id => availableTags.find(t => t.id === id)?.name)
          .filter(Boolean)
          .join(", ");
        const selectedCategoryName = availableCategories.find(c => c.id === currentState.categoryId)?.name;
        
        const stateContext = hasContent ? `

CURRENT PROMPT STATE:
- Title: ${currentState.title || "(not set)"}
- Description: ${currentState.description || "(not set)"}
- Content (FULL - DO NOT SHORTEN):
${currentState.content || "(not set)"}
- Type: ${currentState.type}
- Tags: ${selectedTagNames || "(none)"}
- Category: ${selectedCategoryName || "(none)"}
- Private: ${currentState.isPrivate}

CRITICAL: When editing content, you MUST preserve the FULL content above. Do NOT shorten, summarize, or truncate it. Only make the specific changes the user requested while keeping everything else exactly the same.` : "";

        // Convert messages to OpenAI format
        const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
          { role: "system", content: SYSTEM_PROMPT + availableContext + stateContext },
        ];

        for (const msg of messages) {
          if (msg.role === "user") {
            openaiMessages.push({ role: "user", content: msg.content });
          } else if (msg.role === "assistant") {
            if (msg.toolCalls && msg.toolCalls.length > 0) {
              openaiMessages.push({
                role: "assistant",
                content: msg.content || null,
                tool_calls: msg.toolCalls.map((tc) => ({
                  id: tc.id,
                  type: "function" as const,
                  function: {
                    name: tc.name,
                    arguments: tc.arguments,
                  },
                })),
              });

              if (msg.toolResults) {
                for (const tr of msg.toolResults) {
                  openaiMessages.push({
                    role: "tool",
                    tool_call_id: tr.id,
                    content: JSON.stringify(tr.result),
                  });
                }
              }
            } else {
              openaiMessages.push({ role: "assistant", content: msg.content });
            }
          }
        }

        // Agentic loop with streaming
        let state = { ...currentState };
        let loopCount = 0;
        const maxLoops = 10;
        const allToolCalls: Array<{ id: string; name: string; arguments: string; result: unknown }> = [];

        while (loopCount < maxLoops) {
          loopCount++;

          // Use streaming for the final response
          const response = await openai.chat.completions.create({
            model: GENERATIVE_MODEL,
            messages: openaiMessages,
            tools: PROMPT_BUILDER_TOOLS,
            tool_choice: "auto",
            temperature: 0.7,
            max_tokens: 2000,
            stream: true,
          });

          let fullContent = "";
          const toolCallsAccumulator: Map<number, { id: string; name: string; arguments: string }> = new Map();

          for await (const chunk of response) {
            const delta = chunk.choices[0]?.delta;

            // Stream text content
            if (delta?.content) {
              fullContent += delta.content;
              send({ type: "text", content: delta.content });
            }

            // Accumulate tool calls - handle streaming chunks properly
            if (delta?.tool_calls) {
              for (const tc of delta.tool_calls) {
                const idx = tc.index;
                const existing = toolCallsAccumulator.get(idx);
                
                if (existing) {
                  // Append to existing tool call
                  if (tc.id) existing.id = tc.id;
                  if (tc.function?.name) existing.name = tc.function.name;
                  if (tc.function?.arguments) existing.arguments += tc.function.arguments;
                } else {
                  // Create new tool call entry
                  toolCallsAccumulator.set(idx, {
                    id: tc.id || "",
                    name: tc.function?.name || "",
                    arguments: tc.function?.arguments || "",
                  });
                }
              }
            }
          }

          // Filter for valid tool calls (must have id and name)
          const toolCalls = Array.from(toolCallsAccumulator.values()).filter(tc => tc.id && tc.name);

          // If no tool calls, we're done
          if (toolCalls.length === 0) {
            send({ type: "state", state });
            send({ type: "done" });
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
            return;
          }

          // Process tool calls
          const toolResults: Array<{ id: string; name: string; result: unknown }> = [];

          for (const toolCall of toolCalls) {
            try {
              const args = JSON.parse(toolCall.arguments);
              const { result, newState } = await executeToolCall(
                toolCall.name,
                args,
                state,
                availableTags,
                availableCategories
              );
              state = newState;

              const toolCallResult = {
                id: toolCall.id,
                name: toolCall.name,
                arguments: toolCall.arguments,
                result,
              };

              toolResults.push({
                id: toolCall.id,
                name: toolCall.name,
                result,
              });

              allToolCalls.push(toolCallResult);

              // Stream tool call result
              send({ type: "tool_call", toolCall: toolCallResult });
            } catch (e) {
              console.error("Tool call error:", e);
            }
          }

          // Add assistant message with tool calls to conversation
          openaiMessages.push({
            role: "assistant",
            content: fullContent || null,
            tool_calls: toolCalls.map((tc) => ({
              id: tc.id,
              type: "function" as const,
              function: {
                name: tc.name,
                arguments: tc.arguments,
              },
            })),
          });

          // Add tool results
          for (const tr of toolResults) {
            openaiMessages.push({
              role: "tool",
              tool_call_id: tr.id,
              content: JSON.stringify(tr.result),
            });
          }
        }

        // Max loops reached
        send({ type: "text", content: "I've made several changes. Let me know if you need anything else!" });
        send({ type: "state", state });
        send({ type: "done" });
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        console.error("Prompt builder chat error:", error);
        send({ type: "error", error: "Failed to process request" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
