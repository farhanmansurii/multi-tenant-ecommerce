import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories, stores } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

// GET /api/stores/[slug]/categories - Get all categories for a store
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

    // Get all active categories for the store
    const storeCategories = await db
      .select()
      .from(categories)
      .where(and(
        eq(categories.storeId, store.id),
        eq(categories.isActive, true)
      ))
      .orderBy(desc(categories.sortOrder), desc(categories.createdAt));

    return NextResponse.json({ categories: storeCategories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST /api/stores/[slug]/categories - Create a new category
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { name, description, image, color, sortOrder } = body;

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
    const categorySlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if category with this slug already exists
    const existingCategoryResult = await db
      .select()
      .from(categories)
      .where(and(
        eq(categories.storeId, store.id),
        eq(categories.slug, categorySlug)
      ))
      .limit(1);
    const existingCategory = existingCategoryResult[0];

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 400 }
      );
    }

    // Create the category
    const newCategory = await db.insert(categories).values({
      id: createId(),
      storeId: store.id,
      name,
      slug: categorySlug,
      description,
      image,
      color,
      sortOrder: sortOrder || 0,
    }).returning();

    return NextResponse.json({ category: newCategory[0] });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

// PUT /api/stores/[slug]/categories - Update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { id, name, description, image, color, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Find the store
    const storeResult = await db.select().from(stores).where(eq(stores.slug, slug)).limit(1);
    const store = storeResult[0];

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Check if category exists and belongs to this store
    const existingCategoryResult = await db
      .select()
      .from(categories)
      .where(and(
        eq(categories.id, id),
        eq(categories.storeId, store.id)
      ))
      .limit(1);
    const existingCategory = existingCategoryResult[0];

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Create slug from name
    const categorySlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if another category with this slug already exists (excluding current category)
    const duplicateCategoryResult = await db
      .select()
      .from(categories)
      .where(and(
        eq(categories.storeId, store.id),
        eq(categories.slug, categorySlug)
      ))
      .limit(1);

    const duplicateCategory = duplicateCategoryResult[0];
    if (duplicateCategory && duplicateCategory.id !== id) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 400 }
      );
    }

    // Update the category
    const updatedCategory = await db
      .update(categories)
      .set({
        name,
        slug: categorySlug,
        description,
        image,
        color,
        sortOrder: sortOrder || 0,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    return NextResponse.json({ category: updatedCategory[0] });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE /api/stores/[slug]/categories - Delete a category (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('id');

    if (!categoryId) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    // Find the store
    const storeResult = await db.select().from(stores).where(eq(stores.slug, slug)).limit(1);
    const store = storeResult[0];

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Check if category exists and belongs to this store
    const existingCategoryResult = await db
      .select()
      .from(categories)
      .where(and(
        eq(categories.id, categoryId),
        eq(categories.storeId, store.id)
      ))
      .limit(1);
    const existingCategory = existingCategoryResult[0];

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Soft delete the category by setting isActive to false
    await db
      .update(categories)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, categoryId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
