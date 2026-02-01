import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SKILLS_DIR = path.join(
  process.cwd(),
  "plugins/claude/prompts.chat/skills"
);

export async function GET() {
  try {
    const indexPath = path.join(SKILLS_DIR, "index.json");
    const indexContent = fs.readFileSync(indexPath, "utf-8");
    const index = JSON.parse(indexContent);

    return NextResponse.json(index, {
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error reading skills index:", error);
    return NextResponse.json(
      { error: "Skills index not found" },
      { status: 404 }
    );
  }
}
