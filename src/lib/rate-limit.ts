/**
 * Lightweight in-memory rate limiter for public API endpoints.
 *
 * Uses a sliding-window counter per IP address. No external dependencies
 * (Redis, etc.) required — suitable for single-instance self-hosted deploys.
 *
 * For multi-instance production deployments, replace the store with an
 * Upstash Redis or similar backend.
 */

type RateLimitEntry = { count: number; resetAt: number };

const store = new Map<string, RateLimitEntry>();

/** Default: 60 requests per 60-second window. */
const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS = 60;

/** Clean up stale entries every 5 minutes to prevent memory leaks. */
const CLEANUP_INTERVAL_MS = 5 * 60_000;
let lastCleanup = Date.now();

/**
 * Check whether the given `key` (typically an IP) has exceeded the rate limit.
 *
 * Returns `{ allowed: true }` if the request is permitted, or
 * `{ allowed: false, retryAfterMs }` if the limit has been reached.
 */
export function checkRateLimit(
  key: string,
  opts: { windowMs?: number; maxRequests?: number } = {}
): { allowed: true } | { allowed: false; retryAfterMs: number } {
  const now = Date.now();
  const windowMs = opts.windowMs ?? DEFAULT_WINDOW_MS;
  const maxRequests = opts.maxRequests ?? DEFAULT_MAX_REQUESTS;

  // Periodic cleanup
  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    for (const [k, v] of store) {
      if (v.resetAt <= now) store.delete(k);
    }
    lastCleanup = now;
  }

  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  entry.count++;

  if (entry.count > maxRequests) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  return { allowed: true };
}

/**
 * Extract a best-effort client IP from a Request object.
 * Handles common reverse-proxy headers (X-Forwarded-For, X-Real-IP).
 */
export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    // X-Forwarded-For may contain multiple IPs; the first is the original client.
    return xff.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  // Fallback — will be the loopback in most server-side render contexts.
  return "unknown";
}
