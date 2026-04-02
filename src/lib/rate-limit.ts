/**
 * In-memory fixed-window rate limiter for public API endpoints.
 *
 * Uses a fixed-window counter per identifier (IP or API key): each window
 * tracks a `count` that resets when `resetAt` is reached. No external
 * dependencies (Redis, etc.) required — suitable for single-instance
 * self-hosted deploys.
 *
 * For multi-instance production deployments, replace the store with an
 * Upstash Redis or similar backend.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimiterOptions {
  /** Maximum number of requests allowed within the window. */
  max: number;
  /** Time window in seconds. */
  windowSeconds: number;
}

export class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private readonly max: number;
  private readonly windowMs: number;
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor(opts: RateLimiterOptions) {
    this.max = opts.max;
    this.windowMs = opts.windowSeconds * 1000;

    // Background cleanup — runs every 60s, does NOT block request path.
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store) {
        if (entry.resetAt <= now) {
          this.store.delete(key);
        }
      }
    }, 60_000);

    // Allow the process to exit without waiting for the interval
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Check whether the given identifier is allowed to make a request.
   * Uses a fixed-window counter: count resets when resetAt expires.
   *
   * Returns `{ allowed: true, remaining }` or `{ allowed: false, retryAfterSeconds }`.
   */
  check(
    identifier: string
  ): { allowed: true; remaining: number } | { allowed: false; retryAfterSeconds: number } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || entry.resetAt <= now) {
      // New window
      this.store.set(identifier, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, remaining: this.max - 1 };
    }

    entry.count++;

    if (entry.count > this.max) {
      const retryAfterMs = entry.resetAt - now;
      return { allowed: false, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
    }

    return { allowed: true, remaining: this.max - entry.count };
  }
}

// ---------------------------------------------------------------------------
// Pre-configured limiters for MCP tool calls
// ---------------------------------------------------------------------------

/** General MCP POST requests – 20 req / min per identifier */
export const mcpGeneralLimiter = new RateLimiter({ max: 20, windowSeconds: 60 });

/** tool calls (tools/call) – 10 req / min per identifier */
export const mcpToolCallLimiter = new RateLimiter({ max: 10, windowSeconds: 60 });

/** Write-mutation tools – 5 req / min per identifier */
export const mcpWriteToolLimiter = new RateLimiter({ max: 5, windowSeconds: 60 });

/** AI-powered tools (improve_prompt) – 2 req / min per identifier */
export const mcpAiToolLimiter = new RateLimiter({ max: 2, windowSeconds: 60 });

// ---------------------------------------------------------------------------
// Public API rate limiter
// ---------------------------------------------------------------------------

/** Public API access – 60 req / min per IP */
export const publicApiLimiter = new RateLimiter({ max: 60, windowSeconds: 60 });

/**
 * Extract a best-effort client IP from a Request object.
 *
 * Checks common reverse-proxy and CDN headers in order of reliability:
 * 1. Cloudflare (cf-connecting-ip)
 * 2. True-Client-IP (Cloudflare Enterprise / Akamai)
 * 3. Fastly-Client-IP
 * 4. X-Forwarded-For (standard proxy header, first IP is original client)
 * 5. X-Real-IP (nginx proxy_set_header)
 *
 * Falls back to a per-request fingerprint derived from stable headers
 * (User-Agent + Accept-Language) so unidentified clients don't collide
 * in a single "unknown" bucket.
 */
export function getClientIp(request: Request): string {
  // Cloudflare
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp?.trim()) return cfIp.trim();

  // True-Client-IP (Cloudflare Enterprise / Akamai)
  const trueClientIp = request.headers.get("true-client-ip");
  if (trueClientIp?.trim()) return trueClientIp.trim();

  // Fastly
  const fastlyIp = request.headers.get("fastly-client-ip");
  if (fastlyIp?.trim()) return fastlyIp.trim();

  // X-Forwarded-For (may contain multiple IPs; first is the original client)
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0].trim();
    if (first) return first;
  }

  // X-Real-IP (nginx)
  const realIp = request.headers.get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();

  // Fallback: derive a per-request fingerprint from stable headers so
  // unidentified clients don't all share a single "unknown" bucket.
  const ua = request.headers.get("user-agent") || "";
  const al = request.headers.get("accept-language") || "";
  if (ua || al) {
    // Simple hash for a short, stable identifier
    const raw = `${ua}|${al}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
    }
    return `fp:${(hash >>> 0).toString(36)}`;
  }

  // Last resort — should rarely happen
  console.warn(
    "[rate-limit] No client IP or fingerprint headers found. Headers:",
    JSON.stringify(Object.fromEntries(request.headers.entries()))
  );
  return "unknown";
}
