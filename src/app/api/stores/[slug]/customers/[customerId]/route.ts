import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ customer: null });
}

export async function PATCH() {
  return NextResponse.json({ message: "Update customer - TODO" });
}

export async function DELETE() {
  return NextResponse.json({ message: "Delete customer - TODO" });
}
