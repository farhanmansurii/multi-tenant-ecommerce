import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ order: null });
}

export async function PATCH() {
  return NextResponse.json({ message: "Update order - TODO" });
}

export async function DELETE() {
  return NextResponse.json({ message: "Delete order - TODO" });
}
