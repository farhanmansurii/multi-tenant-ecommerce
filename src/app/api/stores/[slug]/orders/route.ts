import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ orders: [], count: 0 });
}

export async function POST() {
  return NextResponse.json({ message: "Create order - TODO" }, { status: 201 });
}
