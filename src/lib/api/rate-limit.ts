import { NextRequest, NextResponse } from "next/server";

export interface RateLimitOptions {
  interval: number;
  uniqueTokenPerInterval: number;
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : request.headers.get("x-real-ip") || "unknown";

  // In production, you might want to use a more sophisticated approach
  // For now, we'll use IP + user agent as identifier
  const userAgent = request.headers.get("user-agent") || "";
  return `${ip}-${userAgent.slice(0, 50)}`;
}

export function rateLimit(
  options: RateLimitOptions = { interval: 60000, uniqueTokenPerInterval: 100 },
) {
  return (request: NextRequest): NextResponse | null => {
    const identifier = getClientIdentifier(request);
    const now = Date.now();

    const record = rateLimitMap.get(identifier);

    if (!record || now > record.resetTime) {
      // Create new record or reset expired one
      rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + options.interval,
      });
      return null; // Allow request
    }

    if (record.count >= options.uniqueTokenPerInterval) {
      // Rate limit exceeded
      return NextResponse.json(
        {
          error: "Too many requests",
          message: `Rate limit exceeded. Please try again in ${Math.ceil((record.resetTime - now) / 1000)} seconds.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((record.resetTime - now) / 1000)),
            "X-RateLimit-Limit": String(options.uniqueTokenPerInterval),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(record.resetTime / 1000)),
          },
        },
      );
    }

    // Increment count
    record.count++;
    rateLimitMap.set(identifier, record);

    return null; // Allow request
  };
}

// Cleanup old entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 60000); // Clean up every minute
}
