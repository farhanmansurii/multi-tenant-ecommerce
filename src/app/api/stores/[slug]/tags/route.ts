import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tags, stores } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

// GET /api/stores/[slug]/tags - Get all tags for a store
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Find the store
    const storeResult = await db.select().from(stores).where(eq(stores.slug, slug)).limit(1);
    const store = storeResult[0];

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Get all active tags for the store, ordered by usage count
    const storeTags = await db
      .select()
      .from(tags)
      .where(and(
        eq(tags.storeId, store.id),
        eq(tags.isActive, true)
      ))
      .orderBy(desc(tags.usageCount), desc(tags.createdAt));

    return NextResponse.json({ tags: storeTags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}

// POST /api/stores/[slug]/tags - Create a new tag
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { name, color } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Find the store
    const storeResult = await db.select().from(stores).where(eq(stores.slug, slug)).limit(1);
    const store = storeResult[0];

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Create slug from name
    const tagSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if tag with this slug already exists
    const existingTagResult = await db
      .select()
      .from(tags)
      .where(and(
        eq(tags.storeId, store.id),
        eq(tags.slug, tagSlug)
      ))
      .limit(1);
    const existingTag = existingTagResult[0];

    if (existingTag) {
      return NextResponse.json(
        { error: "Tag with this name already exists" },
        { status: 400 }
      );
    }

    // Create the tag
    const newTag = await db.insert(tags).values({
      id: createId(),
      storeId: store.id,
      name,
      slug: tagSlug,
      color,
    }).returning();

    return NextResponse.json({ tag: newTag[0] });
  } catch (error) {
    console.error("Error creating tag:", error);
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}
