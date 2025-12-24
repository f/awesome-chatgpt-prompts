import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Cron job endpoint to reset daily generation credits for all users.
 * Should be called daily via external cron service (e.g., Vercel Cron, GitHub Actions).
 * 
 * Requires CRON_SECRET environment variable for authentication.
 * 
 * Cron Notation: 0 0 * * * (Every day at midnight)
 * 
 * Example cron call:
 * curl -X POST https://your-domain.com/api/cron/reset-credits \
 *   -H "Authorization: Bearer YOUR_CRON_SECRET"
 */
export async function POST(request: NextRequest) {
  // Verify the secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("CRON_SECRET is not configured");
    return NextResponse.json(
      { error: "Cron secret not configured" },
      { status: 500 }
    );
  }

  const providedSecret = authHeader?.replace("Bearer ", "");

  if (providedSecret !== cronSecret) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Reset generation credits for all users to their daily limit
    const result = await db.$executeRaw`
      UPDATE users 
      SET "generationCreditsRemaining" = "dailyGenerationLimit",
          "generationCreditsResetAt" = NOW()
    `;

    console.log(`Daily credit reset completed. Updated ${result} users.`);

    return NextResponse.json({
      success: true,
      message: "Daily generation credits reset successfully",
      usersUpdated: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error resetting daily credits:", error);
    return NextResponse.json(
      { error: "Failed to reset credits" },
      { status: 500 }
    );
  }
}

// Also support GET for simple health checks / manual triggers via browser
export async function GET(request: NextRequest) {
  return POST(request);
}
