import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mockGetApiContext = vi.fn();
const mockGetApiContextOrNull = vi.fn();
const mockCreateProduct = vi.fn();
const mockGetProductBySlug = vi.fn();
const mockUpdateProduct = vi.fn();
const mockDeleteProduct = vi.fn();
const mockRevalidateProductCache = vi.fn();

vi.mock("@/lib/api/context", () => ({
  getApiContext: mockGetApiContext,
  getApiContextOrNull: mockGetApiContextOrNull,
}));

vi.mock("@/lib/domains/products", () => ({
  productHelpers: {
    createProduct: mockCreateProduct,
    getProductBySlug: mockGetProductBySlug,
    updateProduct: mockUpdateProduct,
    deleteProduct: mockDeleteProduct,
  },
}));

vi.mock("@/lib/api/cache-revalidation", () => ({
  CACHE_TAGS: {
    store: (slug: string) => `store:${slug}`,
    products: (slug: string) => `store:${slug}:products`,
    product: (slug: string, productSlug: string) => `store:${slug}:products:${productSlug}`,
    categories: (slug: string) => `store:${slug}:categories`,
    analytics: (slug: string) => `store:${slug}:analytics`,
    orders: (slug: string) => `store:${slug}:orders`,
  },
  revalidateProductCache: mockRevalidateProductCache,
}));

vi.mock("@/lib/db", () => ({
  db: {},
}));

type ErrorResponse = { error: { code: string; message: string } };
type ProductCreateResponse = { data: { product: { slug: string } } };

function nextRequest(url: string, init: RequestInit): NextRequest {
  return new Request(url, init) as unknown as NextRequest;
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

function ensureResponse(response: Response | undefined): Response {
  if (!response) {
    throw new Error("Expected route handler to return a response");
  }
  return response;
}

function validProductPayload() {
  return {
    name: "Keyboard",
    slug: "keyboard",
    description: "Mechanical keyboard with tactile switches",
    price: "129.99",
    images: [{ id: "img-1", url: "https://example.com/image.png", alt: "Keyboard", isPrimary: true }],
    categories: ["cat-1"],
    tags: ["electronics"],
  };
}

describe("products API regression coverage", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns validation error envelope for invalid product create payload", async () => {
    mockGetApiContext.mockResolvedValue({
      storeId: "store-1",
      userId: "owner-1",
      store: { id: "store-1", slug: "demo-store", ownerUserId: "owner-1" },
      session: { user: { id: "owner-1", email: "owner@example.com" } },
    });
    const route = await import("./[slug]/products/route");

    const response = await route.POST(
      nextRequest("http://localhost/api/stores/demo-store/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "x" }),
      }),
      { params: Promise.resolve({ slug: "demo-store" }) },
    );
    const body = await readJson<ErrorResponse>(response);

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toBe("Invalid payload");
  });

  it("returns not-found envelope when product detail target does not exist", async () => {
    mockGetApiContextOrNull.mockResolvedValue({
      storeId: "store-1",
      userId: "viewer-1",
      store: { id: "store-1", slug: "demo-store", ownerUserId: "owner-1" },
      session: { user: { id: "viewer-1", email: "viewer@example.com" } },
    });
    mockGetProductBySlug.mockResolvedValue(null);
    const route = await import("./[slug]/products/[productSlug]/route");

    const response = ensureResponse(await route.GET(
      nextRequest("http://localhost/api/stores/demo-store/products/missing", { method: "GET" }),
      { params: Promise.resolve({ slug: "demo-store", productSlug: "missing" }) },
    ));
    const body = await readJson<ErrorResponse>(response);

    expect(response.status).toBe(404);
    expect(body.error.code).toBe("NOT_FOUND");
    expect(body.error.message).toContain("Product not found");
  });

  it("returns standardized success envelope and mutation cache behavior for product create", async () => {
    mockGetApiContext.mockResolvedValue({
      storeId: "store-1",
      userId: "owner-1",
      store: { id: "store-1", slug: "demo-store", ownerUserId: "owner-1" },
      session: { user: { id: "owner-1", email: "owner@example.com" } },
    });
    mockCreateProduct.mockResolvedValue({ id: "prod-1", slug: "keyboard" });
    const route = await import("./[slug]/products/route");

    const response = await route.POST(
      nextRequest("http://localhost/api/stores/demo-store/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validProductPayload()),
      }),
      { params: Promise.resolve({ slug: "demo-store" }) },
    );
    const body = await readJson<ProductCreateResponse>(response);

    expect(response.status).toBe(201);
    expect(body.data.product.slug).toBe("keyboard");
    expect(response.headers.get("cache-control")).toBe("no-store, no-cache, must-revalidate");
    expect(mockRevalidateProductCache).toHaveBeenCalledWith("demo-store");
  });
});
