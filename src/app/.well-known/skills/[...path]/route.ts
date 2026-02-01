import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SKILLS_DIR = path.join(
  process.cwd(),
  "plugins/claude/prompts.chat/skills"
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const filePath = path.join(SKILLS_DIR, ...pathSegments);

    // Security: ensure the resolved path is within SKILLS_DIR
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(SKILLS_DIR))) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    if (!fs.existsSync(resolvedPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const content = fs.readFileSync(resolvedPath, "utf-8");
    const ext = path.extname(resolvedPath).toLowerCase();

    // Determine content type
    let contentType = "text/plain";
    if (ext === ".json") {
      contentType = "application/json";
    } else if (ext === ".md") {
      contentType = "text/markdown";
    }

    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error reading skill file:", error);
    return NextResponse.json(
      { error: "Error reading file" },
      { status: 500 }
    );
  }
}
