import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requestLogger } from "@/lib/logger";

// GET /api/v1/compositions/[id] — fetch a single composition with its stages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const log = requestLogger(request.headers.get("x-request-id"));
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const composition = await db.composition.findUnique({
      where: { id },
      include: { stages: { orderBy: { order: "asc" } } },
    });

    if (!composition) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json(composition);
  } catch (error) {
    log.error({ op: "composition.get", err: error }, "failed to fetch composition");
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
