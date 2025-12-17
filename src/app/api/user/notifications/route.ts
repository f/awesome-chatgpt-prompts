import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const DEFAULT_RESPONSE = { pendingChangeRequests: 0 };

export async function GET() {
  let session;
  try {
    session = await auth();
  } catch (error) {
    console.error("Auth error in notifications:", error);
    return NextResponse.json(DEFAULT_RESPONSE);
  }

  if (!session?.user?.id) {
    return NextResponse.json(DEFAULT_RESPONSE);
  }

  try {
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
    return NextResponse.json(DEFAULT_RESPONSE);
  }
}
