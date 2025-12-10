import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

interface CsvRow {
  act: string;
  prompt: string;
  for_devs: string;
  type: string;
}

// Unescape literal escape sequences like \n, \t, etc.
function unescapeString(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\');
}

function parseCSV(content: string): CsvRow[] {
  const lines = content.split("\n");
  const rows: CsvRow[] = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV with proper handling of quoted fields
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const nextChar = line[j + 1];
      
      if (char === '"' && !inQuotes) {
        inQuotes = true;
      } else if (char === '"' && inQuotes) {
        if (nextChar === '"') {
          // Escaped quote
          current += '"';
          j++;
        } else {
          inQuotes = false;
        }
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    if (values.length >= 4) {
      rows.push({
        act: values[0],
        prompt: unescapeString(values[1]),
        for_devs: values[2],
        type: values[3],
      });
    }
  }
  
  return rows;
}

function mapCsvTypeToPromptType(csvType: string): { type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "STRUCTURED"; structuredFormat: "JSON" | "YAML" | null } {
  const type = csvType.toUpperCase();
  if (type === "JSON") return { type: "STRUCTURED", structuredFormat: "JSON" };
  if (type === "YAML") return { type: "STRUCTURED", structuredFormat: "YAML" };
  if (type === "IMAGE") return { type: "IMAGE", structuredFormat: null };
  if (type === "VIDEO") return { type: "VIDEO", structuredFormat: null };
  if (type === "AUDIO") return { type: "AUDIO", structuredFormat: null };
  if (type === "STRUCTURED") return { type: "STRUCTURED", structuredFormat: "JSON" };
  return { type: "TEXT", structuredFormat: null };
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Read the prompts.csv file from the project root
    const csvPath = path.join(process.cwd(), "prompts.csv");
    const csvContent = await fs.readFile(csvPath, "utf-8");
    
    const rows = parseCSV(csvContent);
    
    if (rows.length === 0) {
      return NextResponse.json({ error: "No valid rows found in CSV" }, { status: 400 });
    }

    // Get the admin user ID for author assignment
    const adminUserId = session.user.id;

    // Upsert "Coding" category for for_devs prompts
    const codingCategory = await db.category.upsert({
      where: { slug: "coding" },
      update: {},
      create: {
        name: "Coding",
        slug: "coding",
        description: "Programming and development prompts",
        icon: "💻",
      },
    });

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const row of rows) {
      try {
        // Check if prompt with same title already exists
        const existing = await db.prompt.findFirst({
          where: { title: row.act },
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Determine type and structured format
        const { type, structuredFormat } = mapCsvTypeToPromptType(row.type);
        
        // Determine category based on for_devs field
        const isForDevs = row.for_devs.toUpperCase() === "TRUE";
        const categoryId = isForDevs ? codingCategory.id : null;

        // Create the prompt
        const prompt = await db.prompt.create({
          data: {
            title: row.act,
            content: row.prompt,
            type,
            structuredFormat,
            isPrivate: false,
            authorId: adminUserId,
            categoryId,
          },
        });

        // Create initial version
        await db.promptVersion.create({
          data: {
            promptId: prompt.id,
            version: 1,
            content: row.prompt,
            changeNote: "Imported from prompts.csv",
            createdBy: adminUserId,
          },
        });

        imported++;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        errors.push(`Failed to import "${row.act}": ${errorMessage}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: rows.length,
      errors: errors.slice(0, 10), // Only return first 10 errors
    });
  } catch (error) {
    console.error("Error importing prompts:", error);
    return NextResponse.json(
      { error: "Failed to import prompts" },
      { status: 500 }
    );
  }
}

// Delete all community prompts (prompts imported from CSV)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Read CSV to get the titles of community prompts
    const csvPath = path.join(process.cwd(), "prompts.csv");
    const csvContent = await fs.readFile(csvPath, "utf-8");
    const rows = parseCSV(csvContent);
    
    const titles = rows.map(row => row.act);
    
    // Delete all prompts that match the CSV titles
    const result = await db.prompt.deleteMany({
      where: {
        title: { in: titles },
      },
    });

    return NextResponse.json({
      success: true,
      deleted: result.count,
    });
  } catch (error) {
    console.error("Error deleting community prompts:", error);
    return NextResponse.json(
      { error: "Failed to delete community prompts" },
      { status: 500 }
    );
  }
}
