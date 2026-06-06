import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requestLogger } from "@/lib/logger";

const stageSchema = z.object({
  order: z.number().int(),
  promptId: z.string().min(1),
  fallbackPromptId: z.string().nullable().optional(),
  successThreshold: z.number().min(0).max(1).optional(),
  extractFields: z.array(z.string()).optional(),
  transformRules: z.record(z.string(), z.unknown()).nullable().optional(),
});

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  organizationId: z.string().min(1),
  stages: z.array(stageSchema).min(1),
});

// POST /api/v1/compositions — create a composition with N stages
export async function POST(request: NextRequest) {
  const log = requestLogger(request.headers.get("x-request-id"));
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createSchema.parse(body);

    const orders = data.stages.map((s) => s.order);
    if (new Set(orders).size !== orders.length) {
      return NextResponse.json({ error: "duplicate stage order" }, { status: 400 });
    }

    const composition = await db.composition.create({
      data: {
        name: data.name,
        description: data.description,
        organizationId: data.organizationId,
        createdBy: session.user.id,
        stages: {
          create: data.stages.map((s) => ({
            order: s.order,
            promptId: s.promptId,
            fallbackPromptId: s.fallbackPromptId ?? null,
            successThreshold: s.successThreshold ?? 0.5,
            extractFields: s.extractFields ?? [],
            transformRules:
              s.transformRules == null
                ? Prisma.DbNull
                : (s.transformRules as Prisma.InputJsonValue),
          })),
        },
      },
      include: { stages: { orderBy: { order: "asc" } } },
    });

    log.info(
      { op: "composition.create", compositionId: composition.id, stages: composition.stages.length },
      "composition created",
    );

    return NextResponse.json(
      {
        id: composition.id,
        name: composition.name,
        description: composition.description,
        stages: composition.stages,
        createdAt: composition.createdAt,
        createdBy: composition.createdBy,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid input", details: error.issues }, { status: 400 });
    }
    log.error({ op: "composition.create", err: error }, "failed to create composition");
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// GET /api/v1/compositions — list compositions (optionally by organizationId)
export async function GET(request: NextRequest) {
  const log = requestLogger(request.headers.get("x-request-id"));
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId") ?? undefined;

    const compositions = await db.composition.findMany({
      where: organizationId ? { organizationId } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        stages: { orderBy: { order: "asc" } },
        _count: { select: { executions: true } },
      },
    });

    return NextResponse.json({ compositions });
  } catch (error) {
    log.error({ op: "composition.list", err: error }, "failed to list compositions");
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
