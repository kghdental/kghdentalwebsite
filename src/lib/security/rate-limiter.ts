import { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory sliding window cache
const ipRateMap = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of ipRateMap.entries()) {
    if (record.resetAt <= now) {
      ipRateMap.delete(key);
    }
  }
}, 60 * 1000);

export interface RateLimitOptions {
  limit: number; // max requests
  windowMs: number; // time window in milliseconds
}

/**
 * Extracts client IP safely from request headers
 */
export function getClientIp(req: NextRequest | Request): string {
  const forwardedFor =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  // Take the first IP if multiple are present in comma-separated list
  const primaryIp = forwardedFor.split(",")[0].trim();
  return primaryIp || "127.0.0.1";
}

/**
 * Checks if a client IP has exceeded the rate limit.
 * Returns { success: boolean, remaining: number, resetInSeconds: number }
 */
export function checkRateLimit(
  req: NextRequest | Request,
  actionKey: string,
  options: RateLimitOptions = { limit: 10, windowMs: 60 * 1000 }
): {
  success: boolean;
  remaining: number;
  resetInSeconds: number;
} {
  const ip = getClientIp(req);
  const cacheKey = `${actionKey}:${ip}`;
  const now = Date.now();

  const record = ipRateMap.get(cacheKey);

  if (!record || record.resetAt <= now) {
    ipRateMap.set(cacheKey, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return {
      success: true,
      remaining: options.limit - 1,
      resetInSeconds: Math.ceil(options.windowMs / 1000),
    };
  }

  if (record.count >= options.limit) {
    return {
      success: false,
      remaining: 0,
      resetInSeconds: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  record.count += 1;
  return {
    success: true,
    remaining: options.limit - record.count,
    resetInSeconds: Math.ceil((record.resetAt - now) / 1000),
  };
}
