import { NextRequest, NextResponse } from "next/server";

const DEFAULT_TIMEOUT = 30000; // 30 seconds

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = DEFAULT_TIMEOUT,
  errorMessage = "Request timeout"
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}

export function createTimeoutHandler(timeoutMs: number = DEFAULT_TIMEOUT) {
  return async (request: NextRequest, handler: (req: NextRequest) => Promise<NextResponse>) => {
    try {
      return await withTimeout(handler(request), timeoutMs, "Request timeout");
    } catch (error) {
      if (error instanceof Error && error.message === "Request timeout") {
        return NextResponse.json(
          { error: "Request timeout", message: "The request took too long to process" },
          { status: 504 }
        );
      }
      throw error;
    }
  };
}
