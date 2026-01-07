import type { NextApiRequest, NextApiResponse } from "next";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  ElicitResultSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  type PrimitiveSchemaDefinition,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { db } from "@/lib/db";
import { isValidApiKeyFormat } from "@/lib/api-key";
import { improvePrompt } from "@/lib/ai/improve-prompt";

interface AuthenticatedUser {
  id: string;
  username: string;
  mcpPromptsPublicByDefault: boolean;
}

async function authenticateApiKey(apiKey: string | null): Promise<AuthenticatedUser | null> {
  if (!apiKey || !isValidApiKeyFormat(apiKey)) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { apiKey },
    select: {
      id: true,
      username: true,
      mcpPromptsPublicByDefault: true,
    },
  });

  return user;
}

interface ExtractedVariable {
  name: string;
  defaultValue?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Get the prompt name/slug for MCP.
 * Priority: slug > slugify(title) > id
 */
function getPromptName(prompt: { id: string; slug?: string | null; title: string }): string {
  if (prompt.slug) return prompt.slug;
  const titleSlug = slugify(prompt.title);
  if (titleSlug) return titleSlug;
  return prompt.id;
}

function extractVariables(content: string): ExtractedVariable[] {
  // Format: ${variableName} or ${variableName:default}
  const regex = /\$\{([a-zA-Z_][a-zA-Z0-9_\s]*?)(?::([^}]*))?\}/g;
  const variables: ExtractedVariable[] = [];
  const seen = new Set<string>();
  let match;
  while ((match = regex.exec(content)) !== null) {
    const name = match[1].trim();
    if (!seen.has(name)) {
      seen.add(name);
      variables.push({
        name,
        defaultValue: match[2]?.trim(),
      });
    }
  }
  return variables;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

interface ServerOptions {
  categories?: string[];
  tags?: string[];
  users?: string[];
  authenticatedUser?: AuthenticatedUser | null;
}

function createServer(options: ServerOptions = {}) {
  const server = new McpServer(
    {
      name: "prompts-chat",
      version: "1.0.0",
    },
    {
      capabilities: {
        prompts: { listChanged: false },
        tools: {},
      },
    }
  );

  const { authenticatedUser } = options;

  // Build category/tag filter for prompts
  // If authenticated user is present and no specific users filter, include their private prompts
  const buildPromptFilter = (includeOwnPrivate: boolean = true): Record<string, unknown> => {
    const baseFilter: Record<string, unknown> = {
      isUnlisted: false,
      deletedAt: null,
    };

    // Handle visibility: public prompts OR authenticated user's own prompts
    if (authenticatedUser && includeOwnPrivate) {
      // If users filter includes the authenticated user (or no users filter), include their private prompts
      const usersFilter = options.users && options.users.length > 0 ? options.users : null;
      const includeAuthUserPrivate = !usersFilter || usersFilter.includes(authenticatedUser.username);
      
      if (includeAuthUserPrivate) {
        baseFilter.OR = [
          { isPrivate: false },
          { isPrivate: true, authorId: authenticatedUser.id },
        ];
      } else {
        baseFilter.isPrivate = false;
      }
    } else {
      baseFilter.isPrivate = false;
    }

    if (options.categories && options.categories.length > 0) {
      baseFilter.category = {
        slug: { in: options.categories },
      };
    }

    if (options.tags && options.tags.length > 0) {
      baseFilter.tags = {
        some: {
          tag: { slug: { in: options.tags } },
        },
      };
    }

    if (options.users && options.users.length > 0) {
      baseFilter.author = {
        username: { in: options.users },
      };
    }

    return baseFilter;
  };

  const promptFilter = buildPromptFilter();

  // Dynamic MCP Prompts - expose database prompts as MCP prompts
  server.server.setRequestHandler(ListPromptsRequestSchema, async (request) => {
    const cursor = request.params?.cursor;
    const page = cursor ? parseInt(cursor, 10) : 1;
    const perPage = 20;

    const prompts = await db.prompt.findMany({
      where: promptFilter,
      skip: (page - 1) * perPage,
      take: perPage + 1, // fetch one extra to check if there's more
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        content: true,
      },
    });

    const hasMore = prompts.length > perPage;
    const results = hasMore ? prompts.slice(0, perPage) : prompts;

    return {
      prompts: results.map((p) => {
        const variables = extractVariables(p.content);
        return {
          name: getPromptName(p),
          title: p.title,
          description: p.description || undefined,
          arguments: variables.map((v) => ({
            name: v.name,
            description: v.defaultValue ? `Default: ${v.defaultValue}` : undefined,
            required: !v.defaultValue,
          })),
        };
      }),
      nextCursor: hasMore ? String(page + 1) : undefined,
    };
  });

  server.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const promptSlug = request.params.name;
    const args = request.params.arguments || {};

    // Fetch all matching prompts and find by slug
    const prompts = await db.prompt.findMany({
      where: promptFilter,
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        content: true,
      },
    });

    // Find by slug field first, then by slugified title, then by id
    const prompt = prompts.find((p) => 
      p.slug === promptSlug || 
      slugify(p.title) === promptSlug || 
      p.id === promptSlug
    );

    if (!prompt) {
      throw new Error(`Prompt not found: ${promptSlug}`);
    }

    // Replace variables in content
    let filledContent = prompt.content;
    const variables = extractVariables(prompt.content);
    
    for (const variable of variables) {
      const value = args[variable.name] ?? variable.defaultValue ?? `\${${variable.name}}`;
      filledContent = filledContent.replace(
        new RegExp(`\\$\\{${variable.name}(?::[^}]*)?\\}`, "g"),
        String(value)
      );
    }

    return {
      description: prompt.description || prompt.title,
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: filledContent,
          },
        },
      ],
    };
  });

  server.registerTool(
    "search_prompts",
    {
      title: "Search Prompts",
      description:
        "Search for AI prompts by keyword. Returns matching prompts with title, description, content, author, category, and tags. Use this to discover prompts for various AI tasks like coding, writing, analysis, and more.",
      inputSchema: {
        query: z.string().describe("Search query to find relevant prompts"),
        limit: z
          .number()
          .min(1)
          .max(50)
          .default(10)
          .describe("Maximum number of prompts to return (default 10, max 50)"),
        type: z
          .enum(["TEXT", "STRUCTURED", "IMAGE", "VIDEO", "AUDIO"])
          .optional()
          .describe("Filter by prompt type"),
        category: z.string().optional().describe("Filter by category slug"),
        tag: z.string().optional().describe("Filter by tag slug"),
      },
    },
    async ({ query, limit = 10, type, category, tag }) => {
      try {
        const where: Record<string, unknown> = {
          isUnlisted: false,
          deletedAt: null,
          AND: [
            // Search filter
            {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
                { content: { contains: query, mode: "insensitive" } },
              ],
            },
            // Visibility filter: public OR user's own private prompts
            authenticatedUser
              ? {
                  OR: [
                    { isPrivate: false },
                    { isPrivate: true, authorId: authenticatedUser.id },
                  ],
                }
              : { isPrivate: false },
          ],
        };

        if (type) where.type = type;
        if (category) where.category = { slug: category };
        if (tag) where.tags = { some: { tag: { slug: tag } } };

        const prompts = await db.prompt.findMany({
          where,
          take: Math.min(limit, 50),
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            content: true,
            type: true,
            structuredFormat: true,
            createdAt: true,
            author: { select: { username: true, name: true } },
            category: { select: { name: true, slug: true } },
            tags: { select: { tag: { select: { name: true, slug: true } } } },
            _count: { select: { votes: true } },
          },
        });

        const results = prompts.map((p) => ({
          id: p.id,
          slug: getPromptName(p),
          title: p.title,
          description: p.description,
          content: p.content,
          type: p.type,
          structuredFormat: p.structuredFormat,
          author: p.author.name || p.author.username,
          category: p.category?.name || null,
          tags: p.tags.map((t) => t.tag.name),
          votes: p._count.votes,
          createdAt: p.createdAt.toISOString(),
        }));

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ query, count: results.length, prompts: results }, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error("MCP search_prompts error:", error);
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ error: "Failed to search prompts" }) }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "get_prompt",
    {
      title: "Get Prompt",
      description:
        "Get a prompt by ID and optionally fill in its variables. If the prompt contains template variables (like {{variable}}), you will be asked to provide values for them.",
      inputSchema: {
        id: z.string().describe("The ID of the prompt to retrieve"),
      },
    },
    async ({ id }, extra) => {
      try {
        const prompt = await db.prompt.findFirst({
          where: {
            id,
            isPrivate: false,
            isUnlisted: false,
            deletedAt: null,
          },
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            content: true,
            type: true,
            structuredFormat: true,
            author: { select: { username: true, name: true } },
            category: { select: { name: true, slug: true } },
            tags: { select: { tag: { select: { name: true, slug: true } } } },
          },
        });

        if (!prompt) {
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ error: "Prompt not found" }) }],
            isError: true,
          };
        }

        const variables = extractVariables(prompt.content);

        if (variables.length > 0) {
          const properties: Record<string, PrimitiveSchemaDefinition> = {};
          const requiredFields: string[] = [];
          for (const variable of variables) {
            properties[variable.name] = {
              type: "string",
              title: variable.name,
              description: `Value for \${${variable.name}}${variable.defaultValue ? ` (default: ${variable.defaultValue})` : ""}`,
              default: variable.defaultValue,
            };
            // Only require fields without defaults
            if (!variable.defaultValue) {
              requiredFields.push(variable.name);
            }
          }

          try {
            // Add timeout to prevent hanging if client doesn't support elicitation
            const timeoutMs = 10000; // 10 seconds
            const elicitationPromise = extra.sendRequest(
              {
                method: "elicitation/create",
                params: {
                  mode: "form",
                  message: `This prompt requires ${variables.length} variable(s). Please provide values:`,
                  requestedSchema: {
                    type: "object",
                    properties,
                    required: requiredFields.length > 0 ? requiredFields : undefined,
                  },
                },
              },
              ElicitResultSchema
            );
            
            const timeoutPromise = new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error("Elicitation timeout")), timeoutMs)
            );
            
            const result = await Promise.race([elicitationPromise, timeoutPromise]);

            if (result.action === "accept" && result.content) {
              let filledContent = prompt.content;
              for (const [key, value] of Object.entries(result.content)) {
                // Replace ${key} or ${key:default} patterns
                filledContent = filledContent.replace(
                  new RegExp(`\\$\\{${key}(?::[^}]*)?\\}`, "g"),
                  String(value)
                );
              }

              return {
                content: [
                  {
                    type: "text" as const,
                    text: JSON.stringify(
                      {
                        ...prompt,
                        content: filledContent,
                        originalContent: prompt.content,
                        variables: result.content,
                        author: prompt.author.name || prompt.author.username,
                        category: prompt.category?.name || null,
                        tags: prompt.tags.map((t) => t.tag.name),
                        link: `https://prompts.chat/prompts/${prompt.id}_${getPromptName(prompt)}`,
                      },
                      null,
                      2
                    ),
                  },
                ],
              };
            } else {
              return {
                content: [
                  {
                    type: "text" as const,
                    text: JSON.stringify(
                      {
                        ...prompt,
                        variablesRequired: variables,
                        message: "User declined to provide variable values. Returning original prompt.",
                        author: prompt.author.name || prompt.author.username,
                        category: prompt.category?.name || null,
                        tags: prompt.tags.map((t) => t.tag.name),
                        link: `https://prompts.chat/prompts/${prompt.id}_${getPromptName(prompt)}`,
                      },
                      null,
                      2
                    ),
                  },
                ],
              };
            }
          } catch {
            return {
              content: [
                {
                  type: "text" as const,
                  text: JSON.stringify(
                    {
                      ...prompt,
                      variablesRequired: variables,
                      message: "Elicitation not supported. Variables need to be filled manually.",
                      author: prompt.author.name || prompt.author.username,
                      category: prompt.category?.name || null,
                      tags: prompt.tags.map((t) => t.tag.name),
                      link: `https://prompts.chat/prompts/${prompt.id}_${getPromptName(prompt)}`,
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  ...prompt,
                  author: prompt.author.name || prompt.author.username,
                  category: prompt.category?.name || null,
                  tags: prompt.tags.map((t) => t.tag.name),
                  link: `https://prompts.chat/prompts/${prompt.id}_${getPromptName(prompt)}`,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        console.error("MCP get_prompt error:", error);
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ error: "Failed to get prompt" }) }],
          isError: true,
        };
      }
    }
  );

  // Save prompt tool - requires authentication
  server.registerTool(
    "save_prompt",
    {
      title: "Save Prompt",
      description:
        "Save a new prompt to your prompts.chat account. Requires API key authentication. Prompts are private by default unless configured otherwise in settings.",
      inputSchema: {
        title: z.string().min(1).max(200).describe("Title of the prompt"),
        content: z.string().min(1).describe("The prompt content. Can include variables like ${variable} or ${variable:default}"),
        description: z.string().max(500).optional().describe("Optional description of the prompt"),
        tags: z.array(z.string()).max(10).optional().describe("Optional array of tag names (will be created if they don't exist)"),
        category: z.string().optional().describe("Optional category slug"),
        isPrivate: z.boolean().optional().describe("Whether the prompt is private (default: uses your account setting)"),
        type: z.enum(["TEXT", "STRUCTURED", "IMAGE", "VIDEO", "AUDIO"]).optional().describe("Prompt type (default: TEXT)"),
        structuredFormat: z.enum(["JSON", "YAML"]).optional().describe("Format for structured prompts"),
      },
    },
    async ({ title, content, description, tags, category, isPrivate, type, structuredFormat }) => {
      if (!authenticatedUser) {
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ error: "Authentication required. Please provide an API key." }) }],
          isError: true,
        };
      }

      try {
        // Determine privacy setting
        const shouldBePrivate = isPrivate !== undefined ? isPrivate : !authenticatedUser.mcpPromptsPublicByDefault;

        // Find or create tags
        const tagConnections: { tag: { connect: { id: string } } }[] = [];
        if (tags && tags.length > 0) {
          for (const tagName of tags) {
            const tagSlug = slugify(tagName);
            if (!tagSlug) continue;
            
            let tag = await db.tag.findUnique({ where: { slug: tagSlug } });
            if (!tag) {
              tag = await db.tag.create({
                data: {
                  name: tagName,
                  slug: tagSlug,
                },
              });
            }
            tagConnections.push({ tag: { connect: { id: tag.id } } });
          }
        }

        // Find category if provided
        let categoryId: string | undefined;
        if (category) {
          const cat = await db.category.findUnique({ where: { slug: category } });
          if (cat) categoryId = cat.id;
        }

        // Create the prompt
        const prompt = await db.prompt.create({
          data: {
            title,
            slug: slugify(title),
            content,
            description: description || null,
            isPrivate: shouldBePrivate,
            type: type || "TEXT",
            structuredFormat: type === "STRUCTURED" ? (structuredFormat || "JSON") : null,
            authorId: authenticatedUser.id,
            categoryId: categoryId || null,
            tags: {
              create: tagConnections,
            },
          },
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            content: true,
            isPrivate: true,
            type: true,
            createdAt: true,
            tags: { select: { tag: { select: { name: true, slug: true } } } },
            category: { select: { name: true, slug: true } },
          },
        });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  prompt: {
                    ...prompt,
                    tags: prompt.tags.map((t) => t.tag.name),
                    category: prompt.category?.name || null,
                    link: prompt.isPrivate ? null : `https://prompts.chat/prompts/${prompt.id}_${getPromptName(prompt)}`,
                  },
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        console.error("MCP save_prompt error:", error);
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ error: "Failed to save prompt" }) }],
          isError: true,
        };
      }
    }
  );

  // Improve prompt tool - uses AI to enhance prompts
  server.registerTool(
    "improve_prompt",
    {
      title: "Improve Prompt",
      description:
        "Transform a basic prompt into a well-structured, comprehensive prompt using AI. Optionally searches for similar prompts for inspiration. Supports different output types (text, image, video, sound) and formats (text, JSON, YAML).",
      inputSchema: {
        prompt: z.string().min(1).max(10000).describe("The prompt to improve"),
        outputType: z
          .enum(["text", "image", "video", "sound"])
          .default("text")
          .describe("Content type: text, image, video, or sound"),
        outputFormat: z
          .enum(["text", "structured_json", "structured_yaml"])
          .default("text")
          .describe("Response format: text, structured_json, or structured_yaml"),
      },
    },
    async ({ prompt, outputType = "text", outputFormat = "text" }) => {
      if (!authenticatedUser) {
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ error: "Authentication required. Please provide an API key." }) }],
          isError: true,
        };
      }

      try {
        const result = await improvePrompt({ prompt, outputType, outputFormat });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error("MCP improve_prompt error:", error);
        const message = error instanceof Error ? error.message : "Failed to improve prompt";
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ error: message }) }],
          isError: true,
        };
      }
    }
  );

  return server;
}

async function parseBody(req: NextApiRequest): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve(body);
      }
    });
    req.on("error", reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json({
      name: "prompts-chat",
      version: "1.0.0",
      description: "MCP server for prompts.chat - Search and discover AI prompts",
      protocol: "Model Context Protocol (MCP)",
      capabilities: {
        tools: true,
        prompts: true,
      },
      tools: [
        {
          name: "search_prompts",
          description: "Search for AI prompts by keyword.",
        },
        {
          name: "get_prompt",
          description: "Get a prompt by ID with variable elicitation support.",
        },
        {
          name: "save_prompt",
          description: "Save a new prompt (requires API key authentication).",
        },
        {
          name: "improve_prompt",
          description: "Transform a basic prompt into a well-structured, comprehensive prompt using AI.",
        },
      ],
      prompts: {
        description: "All public prompts are available as MCP prompts. Use prompts/list to browse and prompts/get to retrieve with variable substitution.",
        usage: "Access via slash commands in MCP clients (e.g., /prompt-id)",
      },
      endpoint: "/api/mcp",
    });
  }

  if (req.method === "DELETE") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed" },
      id: null,
    });
  }

  // Parse query parameters for filtering
  const url = new URL(req.url || "", `http://${req.headers.host}`);
  const categoriesParam = url.searchParams.get("categories");
  const tagsParam = url.searchParams.get("tags");
  const usersParam = url.searchParams.get("users");

  // Extract API key from PROMPTS_API_KEY header or query parameter
  const apiKeyHeader = req.headers["prompts_api_key"] || req.headers["prompts-api-key"];
  const apiKeyParam = url.searchParams.get("api_key");
  const apiKey = (Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader) || apiKeyParam;

  // Authenticate user if API key is provided
  const authenticatedUser = await authenticateApiKey(apiKey);

  const serverOptions: ServerOptions = { authenticatedUser };
  if (categoriesParam) {
    serverOptions.categories = categoriesParam.split(",").map((c) => c.trim());
  }
  if (tagsParam) {
    serverOptions.tags = tagsParam.split(",").map((t) => t.trim());
  }
  if (usersParam) {
    serverOptions.users = usersParam.split(",").map((u) => u.trim());
  }

  const server = createServer(serverOptions);

  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    await server.connect(transport);

    const body = await parseBody(req);

    await transport.handleRequest(req, res, body);

    res.on("close", () => {
      transport.close();
      server.close();
    });
  } catch (error) {
    console.error("MCP error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
}
