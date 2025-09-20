import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stores, products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { slug } = await params;

  try {
    // First, find the store by slug
    const store = await db
      .select()
      .from(stores)
      .where(eq(stores.slug, slug))
      .limit(1);

    if (store.length === 0) {
      return NextResponse.json(
        {
          error: "Store not found",
          message: `No store found with slug: ${slug}`
        },
        { status: 404 }
      );
    }

    const storeData = store[0];

    // Get products for this store
    const storeProducts = await db
      .select()
      .from(products)
      .where(eq(products.storeId, storeData.id));

    // Return the products data
    return NextResponse.json({
      success: true,
      store: {
        id: storeData.id,
        name: storeData.name,
        slug: storeData.slug,
      },
      products: storeProducts,
      count: storeProducts.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An error occurred while fetching the products"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  const { slug } = await params;

  try {
    // First, find the store by slug
    const store = await db
      .select()
      .from(stores)
      .where(eq(stores.slug, slug))
      .limit(1);

    if (store.length === 0) {
      return NextResponse.json(
        {
          error: "Store not found",
          message: `No store found with slug: ${slug}`
        },
        { status: 404 }
      );
    }

    const storeData = store[0];
    const body = await request.json();

    // Create new product
    const [newProduct] = await db
      .insert(products)
      .values({
        id: crypto.randomUUID(),
        storeId: storeData.id,
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
        description: body.description,
        shortDescription: body.shortDescription,
        sku: body.sku,
        type: body.type || 'physical',
        status: body.status || 'draft',
        price: body.price,
        compareAtPrice: body.compareAtPrice,
        costPrice: body.costPrice,
        trackQuantity: body.trackQuantity !== false,
        quantity: body.quantity || 0,
        allowBackorder: body.allowBackorder || false,
        weight: body.weight,
        length: body.length,
        width: body.width,
        height: body.height,
        downloadUrl: body.downloadUrl,
        downloadExpiry: body.downloadExpiry,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        images: body.images || [],
        variants: body.variants || [],
        categories: body.categories || [],
        tags: body.tags || [],
        featured: body.featured || false,
        requiresShipping: body.requiresShipping !== false,
        taxable: body.taxable !== false,
      })
      .returning();

    return NextResponse.json({
      success: true,
      product: newProduct,
      message: "Product created successfully"
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An error occurred while creating the product"
      },
      { status: 500 }
    );
  }
}
