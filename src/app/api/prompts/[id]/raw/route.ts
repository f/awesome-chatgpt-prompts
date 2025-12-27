import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type OutputFormat = "md" | "yml";
type FileType = "prompt" | "skill";

/**
 * Extracts the prompt ID, format, and file type from a URL parameter
 * Supports formats: "abc123.prompt.md", "abc123_some-slug.prompt.md", "abc123.prompt.yml"
 * Also supports: "abc123.SKILL.md", "abc123_some-slug.SKILL.md" (SKILL only has .md format)
 */
function parseIdParam(idParam: string): { id: string; format: OutputFormat; fileType: FileType } {
  let param = idParam;
  let format: OutputFormat = "md";
  let fileType: FileType = "prompt";

  if (param.endsWith(".SKILL.md")) {
    format = "md";
    fileType = "skill";
    param = param.slice(0, -".SKILL.md".length);
  } else if (param.endsWith(".prompt.yml")) {
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

  return { id: param, format, fileType };
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
  const { id, format, fileType } = parseIdParam(idParam);

  // Unlisted prompts are accessible via direct link (like YouTube unlisted videos)
  const prompt = await db.prompt.findFirst({
    where: { id, deletedAt: null, isPrivate: false },
    select: { title: true, description: true, content: true, type: true },
  });

  if (!prompt) {
    return new NextResponse("Prompt not found", { status: 404 });
  }

  let output: string;
  let contentType: string;

  // Use skill format if requested via .SKILL.md URL or if prompt type is SKILL
  const isSkill = fileType === "skill" || prompt.type === "SKILL";

  if (format === "yml") {
    // YAML format (only for regular prompts, not skills)
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
    if (isSkill) {
      // Format as SKILL.md (Agent Skills specification)
      const frontmatter = [
        "---",
        `name: ${prompt.title}`,
        prompt.description ? `description: ${prompt.description}` : null,
        "---",
      ].filter(Boolean).join("\n");
      output = `${frontmatter}\n\n${prompt.content}`;
    } else {
      // Format as markdown with YAML frontmatter
      const frontmatter = [
        "---",
        `name: ${prompt.title}`,
        prompt.description ? `description: ${prompt.description}` : null,
        "---",
      ].filter(Boolean).join("\n");
      output = `${frontmatter}\n${prompt.content}`;
    }
    contentType = "text/plain; charset=utf-8";
  }

  return new NextResponse(output, {
    headers: {
      "Content-Type": contentType,
    },
  });
}
