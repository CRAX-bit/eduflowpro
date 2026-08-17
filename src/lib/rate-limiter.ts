import { NextRequest, NextResponse } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-Memory storage for rate limits
const rateLimitMap = new Map<string, RateLimitRecord>();

// Periodically clean up expired entries every 2 minutes to prevent memory growth
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    rateLimitMap.forEach((record, key) => {
      if (now > record.resetAt) {
        rateLimitMap.delete(key);
      }
    });
  }, 120000);
}

/**
 * Extracts a client identifier from user ID, forwarded IP headers, or fallback.
 */
export function getClientIdentifier(req: NextRequest, userId?: string): string {
  if (userId && userId.trim()) {
    return `user:${userId.trim()}`;
  }

  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const ip = forwarded.split(',')[0].trim();
    if (ip) return `ip:${ip}`;
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) return `ip:${realIp.trim()}`;

  return 'anonymous-client';
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

/**
 * In-memory sliding window rate limiter.
 * @param key - User ID or IP address
 * @param maxRequests - Maximum allowed requests within the window (default 10)
 * @param windowMs - Time window in milliseconds (default 60,000 ms = 1 minute)
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  const existing = rateLimitMap.get(key);

  if (!existing || now > existing.resetAt) {
    // New window
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (existing.count >= maxRequests) {
    // Limit exceeded
    const resetInSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
    };
  }

  // Increment count
  existing.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - existing.count,
    resetInSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}

/**
 * Returns a standardized HTTP 429 Too Many Requests response.
 */
export function rateLimitExceededResponse(resetInSeconds: number = 60) {
  return NextResponse.json(
    {
      success: false,
      error: 'Çok hızlı istek gönderiyorsunuz, lütfen biraz bekleyin.',
      code: 'TOO_MANY_REQUESTS',
      retryAfter: resetInSeconds,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(resetInSeconds),
      },
    }
  );
}
