import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next-auth/jwt so we can control token presence
vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn().mockResolvedValue(null),
}));

// Mock Upstash to avoid real Redis connections
vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: vi.fn(),
}));
vi.mock("@upstash/redis", () => ({
  Redis: { fromEnv: vi.fn() },
}));

import { middleware } from "@/middleware";
import type { NextRequest } from "next/server";

/**
 * Build a minimal NextRequest-like object for middleware testing.
 * We cast to NextRequest because constructing a real NextRequest in a
 * non-Edge environment requires complex setup.
 */
function makeRequest(pathname: string, options: { method?: string; acceptHeader?: string } = {}) {
  const url = `https://prompts.chat${pathname}`;
  const headers = new Headers();
  if (options.acceptHeader) {
    headers.set("accept", options.acceptHeader);
  }
  // API paths signal JSON response via their prefix — middleware checks pathname starts with /api
  const cookieStore = { has: () => false };

  return {
    method: options.method ?? "GET",
    url,
    headers,
    cookies: cookieStore,
    nextUrl: new URL(url),
    ip: "127.0.0.1",
  } as unknown as NextRequest;
}

describe("middleware — /api/collections exemption", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure no AUTH_SECRET causes early null return from getToken
    process.env.AUTH_SECRET = "test-secret";
    // Disable org enforcement for these tests
    process.env.S8_ENFORCE_GITHUB_ORG = "false";
  });

  it("allows unauthenticated requests to /api/collections/[username]/[slug]/marketplace.json through (file-extension bypass)", async () => {
    // This path ends in .json so the hasFileExtension check already passes it through.
    // Confirming the existing behavior is preserved.
    const req = makeRequest("/api/collections/alice/my-collection/marketplace.json");
    const response = await middleware(req);

    // Middleware calls NextResponse.next() for file-extension paths — status 200 (no redirect/error body)
    expect(response.status).toBe(200);
  });

  it("allows unauthenticated requests to /api/collections (non-extension path) through without 401", async () => {
    // RED: This is the behavior we want after the fix.
    // Before the fix: /api/collections has no session → wantsJson(true) → 401
    // After the fix: /api/collections is in PUBLIC_PATHS → NextResponse.next()
    const req = makeRequest("/api/collections");
    const response = await middleware(req);

    expect(response.status).toBe(200);
  });

  it("allows unauthenticated GET to /api/collections/alice/my-collection through without 401", async () => {
    // RED: Nested non-extension collection path should pass through.
    const req = makeRequest("/api/collections/alice/my-collection");
    const response = await middleware(req);

    expect(response.status).toBe(200);
  });

  it("allows unauthenticated GET to /api/collections/alice/my-collection/items through without 401", async () => {
    // RED: Sub-paths of collections should pass through — route handlers enforce auth.
    const req = makeRequest("/api/collections/alice/my-collection/items");
    const response = await middleware(req);

    expect(response.status).toBe(200);
  });

  it("still blocks unauthenticated requests to protected /api routes (e.g. /api/prompts)", async () => {
    // Regression guard: non-collection API routes should still return 401 without session.
    const req = makeRequest("/api/prompts");
    const response = await middleware(req);

    expect(response.status).toBe(401);
  });
});
