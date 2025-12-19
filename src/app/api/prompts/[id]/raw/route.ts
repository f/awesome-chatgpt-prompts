import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type OutputFormat = "md" | "yml";

/**
 * Extracts the prompt ID and format from a URL parameter
 * Supports formats: "abc123.prompt.md", "abc123_some-slug.prompt.md", "abc123.prompt.yml"
 */
function parseIdParam(idParam: string): { id: string; format: OutputFormat } {
  let param = idParam;
  let format: OutputFormat = "md";

  if (param.endsWith(".prompt.yml")) {
    format = "yml";
    param = param.slice(0, -".prompt.yml".length);
  } else if (param.endsWith(".prompt.md")) {
    format = "md";
    param = param.slice(0, -".prompt.md".length);
  }

  // If the param contains an underscore, extract the ID (everything before first underscore)
  const underscoreIndex = param.indexOf("_");
  if (underscoreIndex !== -1) {
    param = param.substring(0, underscoreIndex);
  }

  return { id: param, format };
}

/**
 * Converts ${variable:default} placeholders to {{variable}} format
 */
function convertVariables(str: string): string {
  return str.replace(/\$\{([^}:]+)(?::[^}]*)?\}/g, "{{$1}}");
}

/**
 * Escapes a string for YAML output
 */
function yamlEscape(str: string): string {
  if (str.includes("\n") || str.includes(":") || str.includes("#") || str.startsWith(" ")) {
    return `|\n${str.split("\n").map(line => `    ${line}`).join("\n")}`;
  }
  return str;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const { id, format } = parseIdParam(idParam);

  const prompt = await db.prompt.findFirst({
    where: { id, deletedAt: null, isPrivate: false, isUnlisted: false },
    select: { title: true, description: true, content: true },
  });

  if (!prompt) {
    return new NextResponse("Prompt not found", { status: 404 });
  }

  let output: string;
  let contentType: string;

  if (format === "yml") {
    // Format as structured YAML with messages array
    const lines = [
      `name: ${prompt.title}`,
    ];
    if (prompt.description) {
      lines.push(`description: ${prompt.description}`);
    }
    lines.push(
      `model: openai/gpt-4o-mini`,
      `modelParameters:`,
      `  temperature: 0.5`,
      `messages:`,
      `  - role: system`,
      `    content: ${yamlEscape(convertVariables(prompt.content))}`,
    );
    output = lines.join("\n");
    contentType = "text/yaml; charset=utf-8";
  } else {
    // Format as markdown with YAML frontmatter
    const frontmatter = [
      "---",
      `name: ${prompt.title}`,
      prompt.description ? `description: ${prompt.description}` : null,
      "---",
    ].filter(Boolean).join("\n");
    output = `${frontmatter}\n${prompt.content}`;
    contentType = "text/plain; charset=utf-8";
  }

  return new NextResponse(output, {
    headers: {
      "Content-Type": contentType,
    },
  });
}
