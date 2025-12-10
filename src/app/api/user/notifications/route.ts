import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ pendingChangeRequests: 0 });
    }

    // Count pending change requests on user's prompts
    const pendingCount = await db.changeRequest.count({
      where: {
        status: "PENDING",
        prompt: {
          authorId: session.user.id,
        },
      },
    });

    return NextResponse.json({ pendingChangeRequests: pendingCount });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json({ pendingChangeRequests: 0 });
  }
}
