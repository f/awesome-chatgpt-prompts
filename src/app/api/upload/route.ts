import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStoragePlugin } from "@/lib/plugins/registry";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

async function compressToJpg(buffer: Buffer): Promise<Buffer> {
  try {
    // Dynamic import for optional sharp dependency
    const sharpModule = await import(/* webpackIgnore: true */ "sharp");
    const sharp = sharpModule.default;
    return await sharp(buffer)
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer();
  } catch {
    throw new Error(
      "Image compression requires sharp. Install it with: npm install sharp"
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const enabledStorage = process.env.ENABLED_STORAGE || "url";
  
  if (enabledStorage === "url") {
    return NextResponse.json(
      { error: "File upload is not enabled. Using URL storage mode." },
      { status: 400 }
    );
  }

  const storagePlugin = getStoragePlugin(enabledStorage);
  
  if (!storagePlugin) {
    return NextResponse.json(
      { error: `Storage plugin "${enabledStorage}" not found` },
      { status: 500 }
    );
  }

  if (!storagePlugin.isConfigured()) {
    return NextResponse.json(
      { error: `Storage plugin "${enabledStorage}" is not configured` },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Compress to JPG
    const compressedBuffer = await compressToJpg(buffer);

    // Generate filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const filename = `prompt-media-${timestamp}-${randomId}.jpg`;

    // Upload to storage
    const result = await storagePlugin.upload(compressedBuffer, {
      filename,
      mimeType: "image/jpeg",
      folder: "prompt-media",
    });

    return NextResponse.json({
      url: result.url,
      size: result.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
