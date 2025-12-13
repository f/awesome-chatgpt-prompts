import { NextResponse } from "next/server";

export async function GET() {
  const enabledStorage = process.env.ENABLED_STORAGE || "url";
  
  return NextResponse.json({
    mode: enabledStorage,
    supportsUpload: enabledStorage !== "url",
  });
}
