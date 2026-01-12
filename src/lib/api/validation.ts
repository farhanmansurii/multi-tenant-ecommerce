import { z } from "zod";
import { badRequest } from "./responses";
import { randomUUID } from "crypto";

const MAX_JSON_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_PARSE_TIME = 5000; // 5 seconds

export async function parseJson<T>(request: Request, schema: z.ZodSchema<T>) {
  const requestId = randomUUID();

  // Check content length
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_JSON_SIZE) {
    return badRequest("Request payload too large", {
      requestId,
      code: "PAYLOAD_TOO_LARGE",
    });
  }

  // Check content type
  const contentType = request.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return badRequest("Content-Type must be application/json", {
      requestId,
      code: "INVALID_CONTENT_TYPE",
    });
  }

  let json: unknown;
  try {
    // Add timeout to prevent hanging on large payloads
    const jsonPromise = request.json();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("JSON parse timeout")), MAX_PARSE_TIME)
    );

    json = await Promise.race([jsonPromise, timeoutPromise]);
  } catch (error) {
    return badRequest("Invalid JSON payload", {
      requestId,
      code: "INVALID_JSON",
      details: error instanceof Error ? error.message : "Failed to parse JSON",
    });
  }

  const result = schema.safeParse(json);
  if (!result.success) {
    return badRequest("Invalid payload", {
      requestId,
      code: "VALIDATION_ERROR",
      details: result.error.flatten(),
    });
  }

  return result.data;
}


