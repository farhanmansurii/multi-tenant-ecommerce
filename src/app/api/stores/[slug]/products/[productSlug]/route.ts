import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { products, stores } from "@/lib/db/schema";
import { requireAuthOrNull } from "@/lib/session-helpers";
import { deleteUploadThingFiles } from "@/lib/uploadthing-delete";
import { ProductImage } from "@/lib/db/schema/product";

interface RouteParams {
  params: Promise<{
    slug: string;
    productSlug: string;
  }>;
}

async function getStoreBySlug(slug: string) {
  const result = await db
    .select()
    .from(stores)
    .where(eq(stores.slug, slug))
    .limit(1);

  return result[0] ?? null;
}

async function getProductBySlug(storeId: string, productSlug: string) {
  const result = await db
    .select()
    .from(products)
    .where(and(eq(products.storeId, storeId), eq(products.slug, productSlug)))
    .limit(1);

  return result[0] ?? null;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { slug, productSlug } = await params;

  try {
    const store = await getStoreBySlug(slug);
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const product = await getProductBySlug(store.id, productSlug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await requireAuthOrNull();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, productSlug } = await params;

  try {
    const store = await getStoreBySlug(slug);
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    if (store.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const currentProduct = await getProductBySlug(store.id, productSlug);
    if (!currentProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const payload = await request.json();

    // Handle image changes - delete old images that are no longer in the new images
    const newImages = Array.isArray(payload.images) ? payload.images : currentProduct.images;
    const oldImages = currentProduct.images as ProductImage[] || [];

    if (oldImages.length > 0 && newImages.length > 0) {
      const oldImageUrls = oldImages.map(img => img.url);
      const newImageUrls = (newImages as ProductImage[]).map(img => img.url);
      const imagesToDelete = oldImageUrls.filter(url => !newImageUrls.includes(url));

      if (imagesToDelete.length > 0) {
        try {
          const deleteResult = await deleteUploadThingFiles(imagesToDelete);
          if (deleteResult.success) {
          } else {
            console.error("Failed to delete some old product images:", deleteResult.errors);
          }
        } catch (error) {
          console.error("Failed to delete old product images from UploadThing:", error);
          // Continue with update even if old image deletion fails
        }
      }
    }

    const updateData = {
      name: payload.name ?? currentProduct.name,
      slug: payload.slug ?? currentProduct.slug,
      description: payload.description ?? currentProduct.description,
      shortDescription: payload.shortDescription ?? currentProduct.shortDescription,
      sku: payload.sku ?? currentProduct.sku,
      type: payload.type ?? currentProduct.type,
      status: payload.status ?? currentProduct.status,
      price: payload.price !== undefined ? String(payload.price) : currentProduct.price,
      compareAtPrice:
        payload.compareAtPrice !== undefined && payload.compareAtPrice !== null
          ? String(payload.compareAtPrice)
          : currentProduct.compareAtPrice,
      quantity: payload.quantity !== undefined ? String(payload.quantity) : currentProduct.quantity,
      trackQuantity:
        payload.trackQuantity !== undefined ? Boolean(payload.trackQuantity) : currentProduct.trackQuantity,
      allowBackorder:
        payload.allowBackorder !== undefined ? Boolean(payload.allowBackorder) : currentProduct.allowBackorder,
      requiresShipping:
        payload.requiresShipping !== undefined ? Boolean(payload.requiresShipping) : currentProduct.requiresShipping,
      taxable: payload.taxable !== undefined ? Boolean(payload.taxable) : currentProduct.taxable,
      featured: payload.featured !== undefined ? Boolean(payload.featured) : currentProduct.featured,
      categories: Array.isArray(payload.categories) ? payload.categories : currentProduct.categories,
      tags: Array.isArray(payload.tags) ? payload.tags : currentProduct.tags,
      images: newImages,
      updatedAt: new Date(),
    };

    await db
      .update(products)
      .set(updateData)
      .where(and(eq(products.storeId, store.id), eq(products.id, currentProduct.id)));

    const updatedProduct = await getProductBySlug(store.id, payload.slug ?? currentProduct.slug);

    return NextResponse.json({ success: true, product: updatedProduct ?? currentProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await requireAuthOrNull();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, productSlug } = await params;

  try {
    const store = await getStoreBySlug(slug);
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    if (store.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const product = await getProductBySlug(store.id, productSlug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete product images from UploadThing if they exist
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      try {
        const imageUrls = (product.images as ProductImage[]).map(img => img.url);
        const deleteResult = await deleteUploadThingFiles(imageUrls);

        if (deleteResult.success) {
        } else {
          console.error("Failed to delete some product images:", deleteResult.errors);
        }
      } catch (error) {
        console.error("Failed to delete product images from UploadThing:", error);
        // Continue with product deletion even if image deletion fails
      }
    }

    await db
      .delete(products)
      .where(and(eq(products.storeId, store.id), eq(products.id, product.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
