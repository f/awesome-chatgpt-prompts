import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { isPrivateUrl } from "@/lib/webhook";

const VALID_METHODS = ["GET", "POST", "PUT", "PATCH"] as const;
const VALID_EVENTS = ["PROMPT_CREATED", "PROMPT_UPDATED", "PROMPT_DELETED"] as const;

type WebhookInput = {
  name: string;
  url: string;
  method?: string;
  headers?: Record<string, string>;
  payload: string;
  events: string[];
  isEnabled?: boolean;
};

function validateWebhook(body: unknown): { success: true; data: WebhookInput } | { success: false; error: string } {
  if (!body || typeof body !== "object") {
    return { success: false, error: "Invalid request body" };
  }
  
  const data = body as Record<string, unknown>;
  
  if (!data.name || typeof data.name !== "string" || data.name.length < 1 || data.name.length > 100) {
    return { success: false, error: "Name is required (1-100 characters)" };
  }
  
  if (!data.url || typeof data.url !== "string") {
    return { success: false, error: "URL is required" };
  }
  
  try {
    new URL(data.url);
  } catch {
    return { success: false, error: "Invalid URL" };
  }
  
  // A10: Block private/internal URLs to prevent SSRF
  if (isPrivateUrl(data.url)) {
    return { success: false, error: "Webhook URL cannot target private/internal networks" };
  }
  
  const method = (data.method as string) || "POST";
  if (!VALID_METHODS.includes(method as typeof VALID_METHODS[number])) {
    return { success: false, error: "Invalid method" };
  }
  
  if (!data.payload || typeof data.payload !== "string" || data.payload.length < 1) {
    return { success: false, error: "Payload is required" };
  }
  
  if (!Array.isArray(data.events) || data.events.length === 0) {
    return { success: false, error: "At least one event is required" };
  }
  
  for (const event of data.events) {
    if (!VALID_EVENTS.includes(event as typeof VALID_EVENTS[number])) {
      return { success: false, error: `Invalid event: ${event}` };
    }
  }
  
  return {
    success: true,
    data: {
      name: data.name as string,
      url: data.url as string,
      method,
      headers: data.headers as Record<string, string> | undefined,
      payload: data.payload as string,
      events: data.events as string[],
      isEnabled: data.isEnabled !== false,
    },
  };
}

// GET all webhooks
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const webhooks = await db.webhookConfig.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(webhooks);
  } catch (error) {
    console.error("Get webhooks error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// CREATE webhook
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = validateWebhook(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "validation_error", message: parsed.error },
        { status: 400 }
      );
    }

    const createData: Record<string, unknown> = {
      name: parsed.data.name,
      url: parsed.data.url,
      method: parsed.data.method || "POST",
      headers: parsed.data.headers || Prisma.JsonNull,
      payload: parsed.data.payload,
      events: parsed.data.events,
      isEnabled: parsed.data.isEnabled ?? true,
    };

    const webhook = await db.webhookConfig.create({
      data: createData as Prisma.WebhookConfigCreateInput,
    });

    return NextResponse.json(webhook);
  } catch (error) {
    console.error("Create webhook error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
