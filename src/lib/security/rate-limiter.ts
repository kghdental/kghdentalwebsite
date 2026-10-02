import { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory sliding window cache fallback
const inMemoryCache = new Map<string, RateLimitRecord>();

// Cleanup stale in-memory records periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of inMemoryCache.entries()) {
      if (record.resetAt <= now) {
        inMemoryCache.delete(key);
      }
    }
  }, 60 * 1000);
}

export interface RateLimitOptions {
  limit: number; // max requests
  windowMs: number; // time window in milliseconds
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetInSeconds: number;
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
 * Synchronous in-memory rate limit check (used directly or as fallback)
 */
export function checkRateLimitSync(
  req: NextRequest | Request,
  actionKey: string,
  options: RateLimitOptions = { limit: 10, windowMs: 60 * 1000 }
): RateLimitResult {
  const ip = getClientIp(req);
  const cacheKey = `${actionKey}:${ip}`;
  const now = Date.now();

  const record = inMemoryCache.get(cacheKey);

  if (!record || record.resetAt <= now) {
    inMemoryCache.set(cacheKey, {
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

// Global cached Upstash instances map to avoid re-instantiating on every request
const upstashInstances = new Map<string, Ratelimit>();

function getUpstashRatelimiter(actionKey: string, options: RateLimitOptions): Ratelimit | null {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!redisUrl || !redisToken) {
    return null;
  }

  const mapKey = `${actionKey}:${options.limit}:${options.windowMs}`;
  const cached = upstashInstances.get(mapKey);
  if (cached) return cached;

  try {
    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    const windowSeconds = Math.max(1, Math.ceil(options.windowMs / 1000));
    // Upstash Ratelimit accepts time format like "60 s", "1 m", "1 h" etc.
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(options.limit, `${windowSeconds} s`),
      prefix: `@kgh:${actionKey}`,
      analytics: true,
    });

    upstashInstances.set(mapKey, limiter);
    return limiter;
  } catch (err) {
    console.warn("Failed to initialize Upstash Ratelimit, falling back to memory:", err);
    return null;
  }
}

/**
 * Unified Rate Limiter:
 * - Uses Upstash Redis when UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are provided.
 * - Gracefully falls back to local in-memory sliding window when Upstash is not configured or fails.
 */
export async function checkRateLimit(
  req: NextRequest | Request,
  actionKey: string,
  options: RateLimitOptions = { limit: 10, windowMs: 60 * 1000 }
): Promise<RateLimitResult> {
  const ip = getClientIp(req);
  const upstash = getUpstashRatelimiter(actionKey, options);

  if (upstash) {
    try {
      const { success, remaining, reset } = await upstash.limit(ip);
      const now = Date.now();
      const resetInSeconds = Math.max(1, Math.ceil((reset - now) / 1000));
      return {
        success,
        remaining,
        resetInSeconds,
      };
    } catch (redisError) {
      console.warn(`Upstash Redis error for ${actionKey}, using in-memory fallback:`, redisError);
      return checkRateLimitSync(req, actionKey, options);
    }
  }

  return checkRateLimitSync(req, actionKey, options);
}
