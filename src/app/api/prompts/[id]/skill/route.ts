import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { parseSkillFiles } from "@/lib/skill-files";
import JSZip from "jszip";

/**
 * Extracts the prompt ID from a URL parameter
 * Supports formats: "abc123", "abc123_some-slug"
 */
function parseIdParam(idParam: string): string {
  let param = idParam;
  
  // Remove .skill extension if present
  if (param.endsWith(".skill")) {
    param = param.slice(0, -".skill".length);
  }

  // If the param contains an underscore, extract the ID (everything before first underscore)
  const underscoreIndex = param.indexOf("_");
  if (underscoreIndex !== -1) {
    param = param.substring(0, underscoreIndex);
  }

  return param;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const id = parseIdParam(idParam);

  // Fetch the skill
  const prompt = await db.prompt.findFirst({
    where: { id, deletedAt: null, isPrivate: false, type: "SKILL" },
    select: { 
      id: true,
      slug: true,
      title: true, 
      description: true, 
      content: true,
    },
  });

  if (!prompt) {
    return new Response("Skill not found", { status: 404 });
  }

  // Parse the skill files
  const files = parseSkillFiles(prompt.content);

  // Create a zip file
  const zip = new JSZip();

  // Add each file to the zip
  for (const file of files) {
    zip.file(file.filename, file.content);
  }

  // Generate the zip content as blob for Response compatibility
  const zipContent = await zip.generateAsync({ 
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });

  // Generate filename
  const slug = prompt.slug || prompt.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const filename = `${slug}.skill`;

  return new Response(zipContent, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
