import { NextResponse } from "next/server";

interface ApiErrorOptions {
  status?: number;
  code?: string;
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data as unknown as Record<string, unknown>, { status: 200, ...init });
}

export function created<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data as unknown as Record<string, unknown>, { status: 201, ...init });
}

export function badRequest(message = "Invalid request", options: ApiErrorOptions = {}) {
  return NextResponse.json({ error: message, code: options.code }, { status: options.status ?? 400 });
}

export function unauthorized(message = "Unauthorized", options: ApiErrorOptions = {}) {
  return NextResponse.json({ error: message, code: options.code }, { status: options.status ?? 401 });
}

export function forbidden(message = "Forbidden", options: ApiErrorOptions = {}) {
  return NextResponse.json({ error: message, code: options.code }, { status: options.status ?? 403 });
}

export function notFound(message = "Not found", options: ApiErrorOptions = {}) {
  return NextResponse.json({ error: message, code: options.code }, { status: options.status ?? 404 });
}

export function serverError(message = "Internal server error", options: ApiErrorOptions = {}) {
  return NextResponse.json({ error: message, code: options.code }, { status: options.status ?? 500 });
}


