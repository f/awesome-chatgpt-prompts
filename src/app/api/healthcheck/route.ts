import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Health check endpoint for container orchestration and load balancers.
 * Checks database connectivity and returns service status.
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Check database connectivity
    await db.$queryRaw`SELECT 1`;

    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        responseTime: `${responseTime}ms`,
        database: "connected",
        version: process.env.npm_package_version || "unknown",
      },
      { status: 200 }
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;

    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        responseTime: `${responseTime}ms`,
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}

