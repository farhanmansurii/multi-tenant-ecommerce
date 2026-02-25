import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import { z } from "zod";

const mockGetApiContextOrNull = vi.fn();
const mockGetApiContext = vi.fn();
const mockListOrders = vi.fn();
const mockCreateOrder = vi.fn();
const mockGetCustomerByUserId = vi.fn();
const mockRevalidateOrderCache = vi.fn();
const mockRevalidateCategoryCache = vi.fn();

const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  execute: vi.fn(),
};

vi.mock("@/lib/api/context", () => ({
  getApiContextOrNull: mockGetApiContextOrNull,
  getApiContext: mockGetApiContext,
}));

vi.mock("@/lib/domains/orders", () => ({
  listOrders: mockListOrders,
  createOrder: mockCreateOrder,
  createOrderSchema: z.object({
    cartId: z.string().min(1),
    customerId: z.string().min(1),
    shippingAddress: z.object({
      recipient: z.string().min(1),
      line1: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().min(1),
      line2: z.string().optional(),
      phone: z.string().optional(),
    }),
    billingAddress: z
      .object({
        recipient: z.string().min(1),
        line1: z.string().min(1),
        city: z.string().min(1),
        state: z.string().min(1),
        postalCode: z.string().min(1),
        country: z.string().min(1),
        line2: z.string().optional(),
        phone: z.string().optional(),
      })
      .optional(),
    discountCode: z.string().optional(),
  }),
  orderQuerySchema: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: z
      .enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"])
      .optional(),
    customerId: z.string().optional(),
  }),
  updateOrderStatusSchema: { safeParseAsync: vi.fn() },
  getOrderById: vi.fn(),
  updateOrderStatus: vi.fn(),
  cancelOrder: vi.fn(),
}));

vi.mock("@/lib/domains/customers", () => ({
  getCustomerByUserId: mockGetCustomerByUserId,
}));

vi.mock("@/lib/db", () => ({
  db: mockDb,
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
  buildCacheTags: (scope: string, slug: string, resourceSlug?: string) => {
    if (scope === "product" && resourceSlug) {
      return [`store:${slug}:products:${resourceSlug}`, `store:${slug}:products`, `store:${slug}`];
    }
    if (scope === "store") {
      return [`store:${slug}`];
    }
    return [`store:${slug}:${scope}`, `store:${slug}`];
  },
  revalidateOrderCache: mockRevalidateOrderCache,
  revalidateCategoryCache: mockRevalidateCategoryCache,
}));

type ErrorResponse = { error: { code: string; message: string } };
type OrdersListResponse = { data: { orders: unknown[]; total: number } };
type CategoriesListResponse = { data: { categories: Array<{ id: string; name: string }> } };

function nextRequest(url: string, init: RequestInit): NextRequest {
  return new Request(url, init) as unknown as NextRequest;
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

function mockCategoryRows(rows: Array<{ id: string; name: string }>) {
  mockDb.select.mockReturnValue({
    from: () => ({
      where: () => ({
        orderBy: () => Promise.resolve(rows),
      }),
    }),
  });
}

describe("orders and categories API regression coverage", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns standardized orders list envelope with orders cache headers", async () => {
    mockGetApiContextOrNull.mockResolvedValue({
      storeId: "store-1",
      userId: "viewer-1",
      store: { id: "store-1", slug: "demo-store", ownerUserId: "owner-1" },
      session: { user: { id: "viewer-1", email: "viewer@example.com" } },
    });
    mockGetCustomerByUserId.mockResolvedValue(null);
    mockListOrders.mockResolvedValue({ orders: [{ id: "o-1" }], total: 1 });
    const route = await import("./[slug]/orders/route");

    const response = await route.GET(
      nextRequest("http://localhost/api/stores/demo-store/orders?page=1&limit=20", { method: "GET" }),
      { params: Promise.resolve({ slug: "demo-store" }) },
    );
    const body = await readJson<OrdersListResponse>(response);

    expect(response.status).toBe(200);
    expect(body.data.total).toBe(1);
    expect(response.headers.get("cache-control")).toBe("private, s-maxage=60, stale-while-revalidate=120");
    expect(response.headers.get("cache-tag")).toContain("store:demo-store:orders");
  });

  it("returns validation error envelope for invalid order creation payload", async () => {
    mockGetApiContextOrNull.mockResolvedValue({
      storeId: "store-1",
      userId: "viewer-1",
      store: { id: "store-1", slug: "demo-store", ownerUserId: "owner-1" },
      session: { user: { id: "viewer-1", email: "viewer@example.com" } },
    });
    const route = await import("./[slug]/orders/route");

    const response = await route.POST(
      nextRequest("http://localhost/api/stores/demo-store/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cartId: "" }),
      }),
      { params: Promise.resolve({ slug: "demo-store" }) },
    );
    const body = await readJson<ErrorResponse>(response);

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns auth error response when category mutation context denies access", async () => {
    mockGetApiContext.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: { code: "NOT_AUTHENTICATED", message: "Unauthorized" },
          meta: { requestId: "test-auth" },
        }),
        { status: 401, headers: { "content-type": "application/json" } },
      ),
    );
    const route = await import("./[slug]/categories/route");

    const response = await route.POST(
      nextRequest("http://localhost/api/stores/demo-store/categories", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Category A" }),
      }),
      { params: Promise.resolve({ slug: "demo-store" }) },
    );
    const body = await readJson<ErrorResponse>(response);

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("NOT_AUTHENTICATED");
  });

  it("returns standardized categories list envelope with cache headers", async () => {
    mockGetApiContextOrNull.mockResolvedValue({
      storeId: "store-1",
      userId: "viewer-1",
      store: { id: "store-1", slug: "demo-store", ownerUserId: "owner-1" },
      session: { user: { id: "viewer-1", email: "viewer@example.com" } },
    });
    mockCategoryRows([{ id: "cat-1", name: "Category A" }]);
    const route = await import("./[slug]/categories/route");

    const response = await route.GET(
      nextRequest("http://localhost/api/stores/demo-store/categories", { method: "GET" }),
      { params: Promise.resolve({ slug: "demo-store" }) },
    );
    const body = await readJson<CategoriesListResponse>(response);

    expect(response.status).toBe(200);
    expect(body.data.categories).toHaveLength(1);
    expect(response.headers.get("cache-control")).toBe("public, s-maxage=300, stale-while-revalidate=600");
    expect(response.headers.get("cache-tag")).toContain("store:demo-store:categories");
  });
});
