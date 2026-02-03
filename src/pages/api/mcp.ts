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
import { parseSkillFiles, serializeSkillFiles, DEFAULT_SKILL_FILE } from "@/lib/skill-files";

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

  // Save skill tool - create a new skill with multiple files
  server.registerTool(
    "save_skill",
    {
      title: "Save Skill",
      description:
        "Save a new Agent Skill to your prompts.chat account. Skills are multi-file prompts that can include SKILL.md (required), reference docs, scripts, and configuration files. Requires API key authentication. If the file contents are too long, first save the SKILL.md only, with no other files. Then call add_file_to_skill tool per file.",
      inputSchema: {
        title: z.string().min(1).max(200).describe("Title of the skill"),
        description: z.string().max(500).optional().describe("Description of what the skill does"),
        files: z.array(z.object({
          filename: z.string().describe("File path (e.g., 'SKILL.md', 'reference.md', 'scripts/helper.py')"),
          content: z.string().describe("File content"),
        })).min(1).describe("Array of files. Must include SKILL.md as the main skill file."),
        tags: z.array(z.string()).max(10).optional().describe("Optional array of tag names"),
        category: z.string().optional().describe("Optional category slug"),
        isPrivate: z.boolean().optional().describe("Whether the skill is private (default: uses your account setting)"),
      },
    },
    async ({ title, description, files, tags, category, isPrivate }) => {
      if (!authenticatedUser) {
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ error: "Authentication required. Please provide an API key." }) }],
          isError: true,
        };
      }

      try {
        // Ensure SKILL.md exists
        const hasSkillMd = files.some(f => f.filename === DEFAULT_SKILL_FILE);
        if (!hasSkillMd) {
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ error: "SKILL.md file is required" }) }],
            isError: true,
          };
        }

        // Serialize files to multi-file format
        const content = serializeSkillFiles(files.map(f => ({ filename: f.filename, content: f.content })));

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
                data: { name: tagName, slug: tagSlug },
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

        // Create the skill
        const skill = await db.prompt.create({
          data: {
            title,
            slug: slugify(title),
            content,
            description: description || null,
            isPrivate: shouldBePrivate,
            type: "SKILL",
            authorId: authenticatedUser.id,
            categoryId: categoryId || null,
            tags: { create: tagConnections },
          },
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            isPrivate: true,
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
                  skill: {
                    ...skill,
                    files: files.map(f => f.filename),
                    tags: skill.tags.map((t) => t.tag.name),
                    category: skill.category?.name || null,
                    link: skill.isPrivate ? null : `https://prompts.chat/prompts/${skill.id}_${getPromptName(skill)}`,
                  },
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        console.error("MCP save_skill error:", error);
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ error: "Failed to save skill" }) }],
          isError: true,
        };
      }
    }
  );

  // Add file to skill tool
  server.registerTool(
    "add_file_to_skill",
    {
      title: "Add File to Skill",
      description:
        "Add a new file to an existing Agent Skill. Use this to add reference docs, scripts, or configuration files to a skill you own.",
      inputSchema: {
        skillId: z.string().describe("The ID of the skill to add the file to"),
        filename: z.string().describe("File path (e.g., 'reference.md', 'scripts/helper.py', 'config/settings.json')"),
        content: z.string().describe("File content"),
      },
    },
    async ({ skillId, filename, content }) => {
      if (!authenticatedUser) {
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ error: "Authentication required. Please provide an API key." }) }],
          isError: true,
        };
      }

      try {
        // Fetch the skill
        const skill = await db.prompt.findFirst({
          where: {
            id: skillId,
            type: "SKILL",
            authorId: authenticatedUser.id,
            deletedAt: null,
          },
          select: { id: true, content: true, title: true, slug: true },
        });

        if (!skill) {
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ error: "Skill not found or you don't have permission to edit it" }) }],
            isError: true,
          };
        }

        // Parse existing files
        const files = parseSkillFiles(skill.content);

        // Check if file already exists
        if (files.some(f => f.filename === filename)) {
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ error: `File '${filename}' already exists. Use a different filename or update the existing file.` }) }],
            isError: true,
          };
        }

        // Cannot add SKILL.md (it always exists)
        if (filename === DEFAULT_SKILL_FILE) {
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ error: "SKILL.md already exists. Edit the skill directly to modify it." }) }],
            isError: true,
          };
        }

        // Add the new file
        files.push({ filename, content });

        // Serialize and update
        const updatedContent = serializeSkillFiles(files);
        await db.prompt.update({
          where: { id: skillId },
          data: { content: updatedContent, updatedAt: new Date() },
        });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  message: `File '${filename}' added to skill`,
                  skillId,
                  files: files.map(f => f.filename),
                  link: `https://prompts.chat/prompts/${skill.id}_${getPromptName(skill)}`,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        console.error("MCP add_file_to_skill error:", error);
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ error: "Failed to add file to skill" }) }],
          isError: true,
        };
      }
    }
  );

  // Update file in skill tool
  server.registerTool(
    "update_skill_file",
    {
      title: "Update Skill File",
      description:
        "Update an existing file in an Agent Skill. Use this to modify reference docs, scripts, configuration files, or SKILL.md content.",
      inputSchema: {
        skillId: z.string().describe("The ID of the skill containing the file"),
        filename: z.string().describe("File path to update (e.g., 'SKILL.md', 'reference.md', 'scripts/helper.py')"),
        content: z.string().describe("New file content"),
      },
    },
    async ({ skillId, filename, content }) => {
      if (!authenticatedUser) {
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ error: "Authentication required. Please provide an API key." }) }],
          isError: true,
        };
      }

      try {
        // Fetch the skill
        const skill = await db.prompt.findFirst({
          where: {
            id: skillId,
            type: "SKILL",
            authorId: authenticatedUser.id,
            deletedAt: null,
          },
          select: { id: true, content: true, title: true, slug: true },
        });

        if (!skill) {
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ error: "Skill not found or you don't have permission to edit it" }) }],
            isError: true,
          };
        }

        // Parse existing files
        const files = parseSkillFiles(skill.content);

        // Find the file to update
        const fileIndex = files.findIndex(f => f.filename === filename);
        if (fileIndex === -1) {
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ error: `File '${filename}' not found in skill. Use add_file_to_skill to add new files.` }) }],
            isError: true,
          };
        }

        // Update the file content
        files[fileIndex].content = content;

        // Serialize and update
        const updatedContent = serializeSkillFiles(files);
        await db.prompt.update({
          where: { id: skillId },
          data: { content: updatedContent, updatedAt: new Date() },
        });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  message: `File '${filename}' updated in skill`,
                  skillId,
                  files: files.map(f => f.filename),
                  link: `https://prompts.chat/prompts/${skill.id}_${getPromptName(skill)}`,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        console.error("MCP update_skill_file error:", error);
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ error: "Failed to update file in skill" }) }],
          isError: true,
        };
      }
    }
  );

  // Remove file from skill tool
  server.registerTool(
    "remove_file_from_skill",
    {
      title: "Remove File from Skill",
      description:
        "Remove a file from an existing Agent Skill. Cannot remove SKILL.md as it is required.",
      inputSchema: {
        skillId: z.string().describe("The ID of the skill to remove the file from"),
        filename: z.string().describe("File path to remove (e.g., 'reference.md', 'scripts/helper.py')"),
      },
    },
    async ({ skillId, filename }) => {
      if (!authenticatedUser) {
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ error: "Authentication required. Please provide an API key." }) }],
          isError: true,
        };
      }

      try {
        // Cannot remove SKILL.md
        if (filename === DEFAULT_SKILL_FILE) {
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ error: "Cannot remove SKILL.md - it is required for all skills" }) }],
            isError: true,
          };
        }

        // Fetch the skill
        const skill = await db.prompt.findFirst({
          where: {
            id: skillId,
            type: "SKILL",
            authorId: authenticatedUser.id,
            deletedAt: null,
          },
          select: { id: true, content: true, title: true, slug: true },
        });

        if (!skill) {
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ error: "Skill not found or you don't have permission to edit it" }) }],
            isError: true,
          };
        }

        // Parse existing files
        const files = parseSkillFiles(skill.content);

        // Check if file exists
        if (!files.some(f => f.filename === filename)) {
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ error: `File '${filename}' not found in this skill` }) }],
            isError: true,
          };
        }

        // Remove the file
        const updatedFiles = files.filter(f => f.filename !== filename);

        // Serialize and update
        const updatedContent = serializeSkillFiles(updatedFiles);
        await db.prompt.update({
          where: { id: skillId },
          data: { content: updatedContent, updatedAt: new Date() },
        });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  message: `File '${filename}' removed from skill`,
                  skillId,
                  files: updatedFiles.map(f => f.filename),
                  link: `https://prompts.chat/prompts/${skill.id}_${getPromptName(skill)}`,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        console.error("MCP remove_file_from_skill error:", error);
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ error: "Failed to remove file from skill" }) }],
          isError: true,
        };
      }
    }
  );

  // Get skill tool - retrieve a skill with all its files
  server.registerTool(
    "get_skill",
    {
      title: "Get Skill",
      description:
        "Get an Agent Skill by ID, including all its files (SKILL.md, reference docs, scripts, etc.). Returns the skill metadata and file contents. Save to .claude/skills/{slug}/SKILL.md and .claude/skills/{slug}/[other files] structure if user asks to download.",
      inputSchema: {
        id: z.string().describe("The ID of the skill to retrieve"),
      },
    },
    async ({ id }) => {
      try {
        // Build visibility filter
        const visibilityFilter = authenticatedUser
          ? {
              OR: [
                { isPrivate: false },
                { isPrivate: true, authorId: authenticatedUser.id },
              ],
            }
          : { isPrivate: false };

        const skill = await db.prompt.findFirst({
          where: {
            id,
            type: "SKILL",
            isUnlisted: false,
            deletedAt: null,
            ...visibilityFilter,
          },
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            content: true,
            isPrivate: true,
            createdAt: true,
            updatedAt: true,
            author: { select: { username: true, name: true } },
            category: { select: { name: true, slug: true } },
            tags: { select: { tag: { select: { name: true, slug: true } } } },
            _count: { select: { votes: true } },
          },
        });

        if (!skill) {
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ error: "Skill not found" }) }],
            isError: true,
          };
        }

        // Parse files from content
        const files = parseSkillFiles(skill.content);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  id: skill.id,
                  slug: getPromptName(skill),
                  title: skill.title,
                  description: skill.description,
                  author: skill.author.name || skill.author.username,
                  category: skill.category?.name || null,
                  tags: skill.tags.map((t) => t.tag.name),
                  votes: skill._count.votes,
                  isPrivate: skill.isPrivate,
                  createdAt: skill.createdAt.toISOString(),
                  updatedAt: skill.updatedAt.toISOString(),
                  files: files.map(f => ({
                    filename: f.filename,
                    content: f.content,
                  })),
                  link: skill.isPrivate ? null : `https://prompts.chat/prompts/${skill.id}_${getPromptName(skill)}`,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        console.error("MCP get_skill error:", error);
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ error: "Failed to get skill" }) }],
          isError: true,
        };
      }
    }
  );

  // Search skills tool - search for agent skills
  server.registerTool(
    "search_skills",
    {
      title: "Search Skills",
      description:
        "Search for Agent Skills by keyword. Returns matching skills with title, description, author, and file list. Use this to discover reusable AI agent capabilities for coding, analysis, automation, and more.",
      inputSchema: {
        query: z.string().describe("Search query to find relevant skills"),
        limit: z
          .number()
          .min(1)
          .max(50)
          .default(10)
          .describe("Maximum number of skills to return (default 10, max 50)"),
        category: z.string().optional().describe("Filter by category slug"),
        tag: z.string().optional().describe("Filter by tag slug"),
      },
    },
    async ({ query, limit = 10, category, tag }) => {
      try {
        const where: Record<string, unknown> = {
          type: "SKILL",
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
            // Visibility filter: public OR user's own private skills
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

        if (category) where.category = { slug: category };
        if (tag) where.tags = { some: { tag: { slug: tag } } };

        const skills = await db.prompt.findMany({
          where,
          take: Math.min(limit, 50),
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            content: true,
            createdAt: true,
            author: { select: { username: true, name: true } },
            category: { select: { name: true, slug: true } },
            tags: { select: { tag: { select: { name: true, slug: true } } } },
            _count: { select: { votes: true } },
          },
        });

        const results = skills.map((s) => {
          const files = parseSkillFiles(s.content);
          return {
            id: s.id,
            slug: getPromptName(s),
            title: s.title,
            description: s.description,
            author: s.author.name || s.author.username,
            category: s.category?.name || null,
            tags: s.tags.map((t) => t.tag.name),
            votes: s._count.votes,
            files: files.map(f => f.filename),
            createdAt: s.createdAt.toISOString(),
            link: `https://prompts.chat/prompts/${s.id}_${getPromptName(s)}`,
          };
        });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ query, count: results.length, skills: results }, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error("MCP search_skills error:", error);
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ error: "Failed to search skills" }) }],
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
        {
          name: "save_skill",
          description: "Save a new Agent Skill with multiple files (requires API key authentication).",
        },
        {
          name: "add_file_to_skill",
          description: "Add a file to an existing Agent Skill (requires API key authentication).",
        },
        {
          name: "update_skill_file",
          description: "Update an existing file in an Agent Skill (requires API key authentication).",
        },
        {
          name: "remove_file_from_skill",
          description: "Remove a file from an Agent Skill (requires API key authentication).",
        },
        {
          name: "get_skill",
          description: "Get an Agent Skill by ID with all its files.",
        },
        {
          name: "search_skills",
          description: "Search for Agent Skills by keyword.",
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
