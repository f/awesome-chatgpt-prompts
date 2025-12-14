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
      },
    }
  );

  // Build category/tag filter for prompts
  const promptFilter: Record<string, unknown> = {
    isPrivate: false,
    isUnlisted: false,
    deletedAt: null,
  };

  if (options.categories && options.categories.length > 0) {
    promptFilter.category = {
      slug: { in: options.categories },
    };
  }

  if (options.tags && options.tags.length > 0) {
    promptFilter.tags = {
      some: {
        tag: { slug: { in: options.tags } },
      },
    };
  }

  if (options.users && options.users.length > 0) {
    promptFilter.author = {
      username: { in: options.users },
    };
  }

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
          name: slugify(p.title),
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
        title: true,
        description: true,
        content: true,
      },
    });

    const prompt = prompts.find((p) => slugify(p.title) === promptSlug);

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
          isPrivate: false,
          isUnlisted: false,
          deletedAt: null,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
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
            const result = await extra.sendRequest(
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

  const serverOptions: ServerOptions = {};
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
