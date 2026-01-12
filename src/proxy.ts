import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/api/rate-limit";

const rateLimitConfig: Record<string, { interval: number; uniqueTokenPerInterval: number }> = {
  "/api/stores": { interval: 60000, uniqueTokenPerInterval: 10 },
  "/api/stores/[slug]/products": { interval: 60000, uniqueTokenPerInterval: 30 },
  "/api/stores/[slug]/orders": { interval: 60000, uniqueTokenPerInterval: 20 },
  "/api/stores/[slug]/checkout": { interval: 60000, uniqueTokenPerInterval: 10 },
  "/api/stores/[slug]/analytics": { interval: 60000, uniqueTokenPerInterval: 200 },
  default: { interval: 60000, uniqueTokenPerInterval: 100 },
};

const skipRateLimitPaths = [
  "/api/health",
  "/api/auth",
  "/api/stores/[slug]/analytics",
  "/api/stores/[slug]/products",
  "/api/stores/[slug]/orders",
  "/api/stores/[slug]/customers",
  "/api/stores/[slug]/categories",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js)$/)
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    const shouldSkipRateLimit = skipRateLimitPaths.some((skipPath) => {
      if (skipPath.includes("[slug]")) {
        const parts = skipPath.split("[slug]");
        return pathname.startsWith(parts[0]) && pathname.includes(parts[1]);
      }
      return pathname.startsWith(skipPath);
    });

    if (shouldSkipRateLimit) {
      return NextResponse.next();
    }

    let config = rateLimitConfig.default;

    for (const [pattern, rateConfig] of Object.entries(rateLimitConfig)) {
      if (pattern === "default") continue;

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
