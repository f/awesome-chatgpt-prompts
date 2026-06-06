import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { requestLogger } from "@/lib/logger";
import { executeComposition } from "@/lib/composition";

const executeSchema = z.object({
  input: z.string().min(1),
  context: z.object({
    organizationId: z.string().min(1),
    userId: z.string().min(1),
    sessionId: z.string().nullable().optional(),
  }),
});

// POST /api/v1/compositions/[id]/execute — run the chain end-to-end
export async function POST(
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
    const body = await request.json();
    const { input, context } = executeSchema.parse(body);

    const result = await executeComposition(id, input, context);

    log.info(
      {
        op: "composition.execute",
        compositionId: id,
        executionId: result.executionId,
        status: result.status,
        totalTokens: result.totalTokens,
        totalDuration: result.totalDuration,
      },
      "composition executed",
    );

    return NextResponse.json({ ...result, executionTrace: [] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid input", details: error.issues }, { status: 400 });
    }
    if (error instanceof Error && error.message.startsWith("Composition not found")) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    log.error({ op: "composition.execute", err: error }, "composition execution failed");
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
