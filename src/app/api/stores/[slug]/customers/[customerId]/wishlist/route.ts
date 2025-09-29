import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ wishlist: [] });
}

export async function POST() {
  return NextResponse.json({ message: "Add to wishlist - TODO" }, { status: 201 });
}
