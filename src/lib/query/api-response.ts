import { QueryError } from "@/lib/query/errors";

type ApiSuccessEnvelope<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

type ApiErrorEnvelope = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  } | string;
  code?: string;
  message?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function unwrapApiData<T>(payload: unknown): T {
  if (isRecord(payload) && "data" in payload) {
    const envelope = payload as ApiSuccessEnvelope<T>;
    return envelope.data;
  }

  return payload as T;
}

export function extractApiError(payload: unknown, fallbackMessage: string): QueryError {
  if (!isRecord(payload)) {
    return new QueryError(fallbackMessage);
  }

  const envelope = payload as ApiErrorEnvelope;
  const statusCode = typeof envelope.code === "string" ? envelope.code : undefined;

  if (typeof envelope.error === "string") {
    return new QueryError(envelope.error, undefined, statusCode);
  }

  if (isRecord(envelope.error)) {
    const message =
      typeof envelope.error.message === "string" ? envelope.error.message : fallbackMessage;
    const code =
      typeof envelope.error.code === "string" ? envelope.error.code : statusCode;
    return new QueryError(message, undefined, code);
  }

  if (typeof envelope.message === "string") {
    return new QueryError(envelope.message, undefined, statusCode);
  }

  return new QueryError(fallbackMessage, undefined, statusCode);
}

export async function parseApiResponse<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  const payload = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const apiError = extractApiError(payload, fallbackMessage);
    throw new QueryError(apiError.message, response.status, apiError.code);
  }

  return unwrapApiData<T>(payload);
}
