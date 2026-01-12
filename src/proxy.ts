import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/api/rate-limit";

// Rate limiting configuration per route
const rateLimitConfig: Record<string, { interval: number; uniqueTokenPerInterval: number }> = {
  "/api/stores": { interval: 60000, uniqueTokenPerInterval: 10 }, // 10 requests per minute
  "/api/stores/[slug]/products": { interval: 60000, uniqueTokenPerInterval: 30 },
  "/api/stores/[slug]/orders": { interval: 60000, uniqueTokenPerInterval: 20 },
  "/api/stores/[slug]/checkout": { interval: 60000, uniqueTokenPerInterval: 10 },
  default: { interval: 60000, uniqueTokenPerInterval: 100 }, // Default: 100 requests per minute
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip rate limiting for health checks and static files
  if (
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // Apply rate limiting to API routes
  if (pathname.startsWith("/api/")) {
    // Find matching rate limit config
    let config = rateLimitConfig.default;

    for (const [pattern, rateConfig] of Object.entries(rateLimitConfig)) {
      if (pattern === "default") continue;

      // Simple pattern matching (you could use a more sophisticated matcher)
      if (pathname.startsWith(pattern.replace("[slug]", ""))) {
        config = rateConfig;
        break;
      }
    }

    const rateLimitResponse = rateLimit(config)(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  }

  // Add security headers
  const response = NextResponse.next();

  // Add CORS headers if needed (adjust based on your requirements)
  const origin = request.headers.get("origin");
  if (origin && process.env.NEXT_PUBLIC_APP_URL && origin.includes(new URL(process.env.NEXT_PUBLIC_APP_URL).hostname)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Max-Age", "86400");
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
