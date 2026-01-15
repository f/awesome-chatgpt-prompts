/**
 * Seed script to import skills from Anthropic's skills repository
 * 
 * Usage:
 *   npx tsx scripts/seed-skills.ts [skill-name]
 * 
 * Examples:
 *   npx tsx scripts/seed-skills.ts pdf
 *   npx tsx scripts/seed-skills.ts --all
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// File separator uses ASCII control characters (injection-proof):
// \x1F (Unit Separator, ASCII 31) marks start
// \x1E (Record Separator, ASCII 30) marks end
const FILE_SEPARATOR = (filename: string) => `\x1FFILE:${filename}\x1E`;

interface SkillMetadata {
  name: string;
  description: string;
  license?: string;
}

/**
 * Parse YAML frontmatter from SKILL.md
 */
function parseFrontmatter(content: string): { metadata: SkillMetadata; body: string } {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  
  if (!frontmatterMatch) {
    return {
      metadata: { name: "Unknown", description: "" },
      body: content,
    };
  }

  const [, frontmatter, body] = frontmatterMatch;
  const metadata: SkillMetadata = { name: "Unknown", description: "" };

  // Simple YAML parsing for frontmatter
  frontmatter.split("\n").forEach((line) => {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      if (key === "name") metadata.name = value.trim();
      if (key === "description") metadata.description = value.trim();
      if (key === "license") metadata.license = value.trim();
    }
  });

  return { metadata, body };
}

/**
 * Recursively read all files from a directory
 */
function readSkillFiles(skillDir: string, basePath: string = ""): Array<{ path: string; content: string }> {
  const files: Array<{ path: string; content: string }> = [];
  const entries = fs.readdirSync(skillDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(skillDir, entry.name);
    const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      files.push(...readSkillFiles(fullPath, relativePath));
    } else if (entry.isFile()) {
      // Skip binary files and hidden files
      if (entry.name.startsWith(".")) continue;
      
      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        files.push({ path: relativePath, content });
      } catch (e) {
        console.warn(`  Skipping binary file: ${relativePath}`);
      }
    }
  }

  return files;
}

/**
 * Serialize skill files into multi-file format
 */
function serializeSkillFiles(files: Array<{ path: string; content: string }>): string {
  // SKILL.md should be first
  const skillMd = files.find((f) => f.path === "SKILL.md");
  const otherFiles = files.filter((f) => f.path !== "SKILL.md");

  if (!skillMd) {
    throw new Error("SKILL.md not found");
  }

  let result = skillMd.content;

  for (const file of otherFiles) {
    result += `\n${FILE_SEPARATOR(file.path)}\n${file.content}`;
  }

  return result;
}

/**
 * Import a single skill into the database
 */
async function importSkill(skillDir: string, authorId: string): Promise<void> {
  const skillName = path.basename(skillDir);
  console.log(`\nImporting skill: ${skillName}`);

  // Read all files
  const files = readSkillFiles(skillDir);
  console.log(`  Found ${files.length} files`);

  // Find and parse SKILL.md
  const skillMdFile = files.find((f) => f.path === "SKILL.md");
  if (!skillMdFile) {
    console.error(`  ERROR: SKILL.md not found in ${skillDir}`);
    return;
  }

  const { metadata } = parseFrontmatter(skillMdFile.content);
  console.log(`  Name: ${metadata.name}`);
  console.log(`  Description: ${metadata.description.substring(0, 80)}...`);

  // Serialize all files
  const content = serializeSkillFiles(files);

  // Check if skill already exists
  const existing = await prisma.prompt.findFirst({
    where: {
      title: metadata.name,
      type: "SKILL",
      authorId,
    },
  });

  if (existing) {
    console.log(`  Skill "${metadata.name}" already exists, updating...`);
    await prisma.prompt.update({
      where: { id: existing.id },
      data: {
        content,
        description: metadata.description,
      },
    });
  } else {
    // Create new skill
    await prisma.prompt.create({
      data: {
        title: metadata.name,
        description: metadata.description,
        content,
        type: "SKILL",
        authorId,
        isPrivate: false,
      },
    });
    console.log(`  Created skill: ${metadata.name}`);
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log("Usage:");
    console.log("  npx tsx scripts/seed-skills.ts <skill-name>  - Import a specific skill");
    console.log("  npx tsx scripts/seed-skills.ts --all         - Import all skills");
    console.log("  npx tsx scripts/seed-skills.ts --list        - List available skills");
    console.log("\nAvailable skills:");
    
    const skillsDir = "/tmp/anthropic-skills/skills";
    if (fs.existsSync(skillsDir)) {
      const skills = fs.readdirSync(skillsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);
      skills.forEach((s) => console.log(`  - ${s}`));
    } else {
      console.log("  (Skills repo not found. Clone it first with: git clone https://github.com/anthropics/skills.git /tmp/anthropic-skills)");
    }
    return;
  }

  // Find or create admin user for importing
  let author = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!author) {
    console.log("No admin user found. Creating system user...");
    author = await prisma.user.create({
      data: {
        email: "system@prompts.chat",
        username: "system",
        name: "System",
        role: "ADMIN",
      },
    });
  }

  console.log(`Using author: ${author.username} (${author.id})`);

  const skillsBaseDir = "/tmp/anthropic-skills/skills";

  if (!fs.existsSync(skillsBaseDir)) {
    console.error("Skills directory not found. Please clone the repo first:");
    console.error("  git clone https://github.com/anthropics/skills.git /tmp/anthropic-skills");
    return;
  }

  if (args[0] === "--all") {
    // Import all skills
    const skillDirs = fs.readdirSync(skillsBaseDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => path.join(skillsBaseDir, d.name));

    console.log(`Found ${skillDirs.length} skills to import`);

    for (const skillDir of skillDirs) {
      try {
        await importSkill(skillDir, author.id);
      } catch (e) {
        console.error(`  ERROR importing ${path.basename(skillDir)}:`, e);
      }
    }
  } else if (args[0] === "--list") {
    // List available skills
    const skills = fs.readdirSync(skillsBaseDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
    
    console.log("Available skills:");
    skills.forEach((s) => console.log(`  - ${s}`));
  } else {
    // Import specific skill
    const skillDir = path.join(skillsBaseDir, args[0]);
    
    if (!fs.existsSync(skillDir)) {
      console.error(`Skill not found: ${args[0]}`);
      console.log("\nAvailable skills:");
      const skills = fs.readdirSync(skillsBaseDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);
      skills.forEach((s) => console.log(`  - ${s}`));
      return;
    }

    await importSkill(skillDir, author.id);
  }

  console.log("\nDone!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
