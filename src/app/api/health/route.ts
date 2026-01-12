import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ok, serverError } from "@/lib/api/responses";

export async function GET() {
  try {
    // Check database connection
    await db.execute("SELECT 1");

    return ok({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      version: process.env.npm_package_version || "unknown",
    });
  } catch (error) {
    return serverError("Health check failed", { status: 503 });
  }
}
