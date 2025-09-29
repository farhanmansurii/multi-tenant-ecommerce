import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ customers: [], count: 0 });
}

export async function POST() {
  return NextResponse.json({ message: "Create customer - TODO" }, { status: 201 });
}
