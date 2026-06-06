import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { requestLogger } from "@/lib/logger";
import { executeComposition } from "@/lib/composition";

const testSchema = z.object({
  sampleInputs: z.array(z.string().min(1)).min(1),
  context: z.object({
    organizationId: z.string().min(1),
    userId: z.string().min(1),
    sessionId: z.string().nullable().optional(),
  }),
});

// POST /api/v1/compositions/[id]/test — run the chain against multiple sample
// inputs and return per-sample + aggregated results.
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
    const { sampleInputs, context } = testSchema.parse(body);

    const results: Array<{
      input: string;
      executionId: string;
      status: string;
      finalOutput: string;
      totalTokens: number;
      totalDuration: number;
      stageCount: number;
    }> = [];

    // Sequential to avoid hammering the LLM provider with parallel chains.
    for (const input of sampleInputs) {
      const r = await executeComposition(id, input, context);
      results.push({
        input,
        executionId: r.executionId,
        status: r.status,
        finalOutput: r.finalOutput,
        totalTokens: r.totalTokens,
        totalDuration: r.totalDuration,
        stageCount: r.stages.length,
      });
    }

    const count = results.length;
    const summary = {
      total: count,
      success: results.filter((r) => r.status === "success").length,
      partial: results.filter((r) => r.status === "partial").length,
      failed: results.filter((r) => r.status === "failed").length,
      avgTokens: Math.round(results.reduce((a, r) => a + r.totalTokens, 0) / count),
      avgDuration: Math.round(results.reduce((a, r) => a + r.totalDuration, 0) / count),
    };

    log.info({ op: "composition.test", compositionId: id, ...summary }, "composition test run");

    return NextResponse.json({ summary, results });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid input", details: error.issues }, { status: 400 });
    }
    if (error instanceof Error && error.message.startsWith("Composition not found")) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    log.error({ op: "composition.test", err: error }, "composition test failed");
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
