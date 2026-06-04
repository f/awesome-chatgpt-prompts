import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const PUBLIC_PATHS = ["/login", "/register", "/api/auth", "/api/mcp", "/api/collections", "/unauthorized", "/monitoring"];
const REQUIRED_ORG = process.env.S8_REQUIRED_ORG || "solution8-com";
const ENFORCE_GITHUB_ORG = process.env.S8_ENFORCE_GITHUB_ORG !== "false";

// Rate limiter for API mutations
const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(30, "10 s"),
        analytics: true,
        prefix: "@upstash/ratelimit",
      })
    : null;

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function wantsJson(request: NextRequest) {
  const accept = request.headers.get("accept") ?? "";
  return request.nextUrl.pathname.startsWith("/api") || accept.includes("application/json");
}

async function getAuthToken(request: NextRequest) {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) return null;

  // Primary decode path using default Auth.js cookie detection.
  const primary = await getToken({ req: request, secret });
  if (primary) return primary;

  // Fallback cookie names for cross-runtime/proxy edge cases.
  const fallbackCookieNames = [
    "__Secure-authjs.session-token",
    "authjs.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.session-token",
  ] as const;
  const presentFallbackCookieNames = fallbackCookieNames.filter((cookieName) =>
    request.cookies.has(cookieName)
  );

  if (presentFallbackCookieNames.length === 0) return null;

  for (const cookieName of presentFallbackCookieNames) {
    const token = await getToken({ req: request, secret, cookieName });
    if (token) return token;
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(pathname);

  if (
    pathname.startsWith("/_next/") ||
    pathname === "/robots.txt" ||
    pathname === "/favicon.ico" ||
    hasFileExtension ||
    isPublicPath(pathname)
  ) {
    return NextResponse.next();
  }

  const token = await getAuthToken(request);

  // Rate limiting for non-GET API routes
  if (ratelimit && pathname.startsWith("/api/") && request.method !== "GET") {
    const identifier = token?.email || request.ip || "anonymous";
    const { success } = await ratelimit.limit(identifier);

    if (!success) {
      return NextResponse.json(
        { error: "rate_limited", message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  }

  if (!token) {
    if (wantsJson(request)) {
      return NextResponse.json({ error: "unauthorized", reason: "NO_SESSION" }, { status: 401 });
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl, { status: 302 });
  }

  if (ENFORCE_GITHUB_ORG && token.orgMember !== true) {
    if (wantsJson(request)) {
      return NextResponse.json(
        { error: "unauthorized", reason: "WRONG_ORG", requiredOrg: REQUIRED_ORG },
        { status: 403 }
      );
    }

    const unauthorizedUrl = new URL("/unauthorized", request.url);
    return NextResponse.redirect(unauthorizedUrl, { status: 302 });
  }

  if (pathname.startsWith("/prompts/") && (pathname.endsWith(".prompt.md") || pathname.endsWith(".prompt.yml"))) {
    const id = pathname.slice("/prompts/".length);
    const url = request.nextUrl.clone();
    url.pathname = `/api/prompts/${id}/raw`;
    return NextResponse.rewrite(url);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
