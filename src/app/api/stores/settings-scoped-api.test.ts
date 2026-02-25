import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mockGetApiContext = vi.fn();
const mockRevalidateStoreCache = vi.fn();
const mockDbUpdate = vi.fn();
const mockDb = {
  update: mockDbUpdate,
};

vi.mock("@/lib/api/context", () => ({
  getApiContext: mockGetApiContext,
  getApiContextOrNull: vi.fn(),
}));

vi.mock("@/lib/api/cache-revalidation", () => ({
  revalidateStoreCache: mockRevalidateStoreCache,
}));

vi.mock("@/lib/db", () => ({
  db: mockDb,
}));

type ErrorResponse = { error: { code: string; message: string } };
type StoreResponse = { data: { store: { id: string; settings: Record<string, unknown> } } };

function nextRequest(url: string, init: RequestInit): NextRequest {
  return new Request(url, init) as unknown as NextRequest;
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

function mockDbReturning(updatedSettings: Record<string, unknown>) {
  const setMock = vi.fn().mockReturnValue({
    where: () => ({
      returning: async () => [{ id: "store-1", settings: updatedSettings }],
    }),
  });

  mockDbUpdate.mockReturnValue({ set: setMock });
  return setMock;
}

describe("scoped store settings API routes", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("updates only checkout settings and preserves unrelated settings keys", async () => {
    const setMock = mockDbReturning({
      paymentMethods: ["stripe"],
      codEnabled: false,
      shippingEnabled: true,
      freeShippingThreshold: 250,
      termsOfService: "keep-me",
    });
    mockGetApiContext.mockResolvedValue({
      storeId: "store-1",
      userId: "owner-1",
      store: {
        id: "store-1",
        slug: "demo-store",
        ownerUserId: "owner-1",
        settings: {
          paymentMethods: ["stripe", "cod"],
          codEnabled: true,
          shippingEnabled: true,
          freeShippingThreshold: 250,
          termsOfService: "keep-me",
        },
      },
    });
    const route = await import("./[slug]/settings/checkout/route");

    const response = await route.PATCH(
      nextRequest("http://localhost/api/stores/demo-store/settings/checkout", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ codEnabled: false }),
      }),
      { params: Promise.resolve({ slug: "demo-store" }) },
    );
    const body = await readJson<StoreResponse>(response);

    expect(response.status).toBe(200);
    const setArg = setMock.mock.calls[0][0] as { settings: Record<string, unknown> };
    expect(setArg.settings.codEnabled).toBe(false);
    expect(setArg.settings.termsOfService).toBe("keep-me");
    expect(body.data.store.settings.codEnabled).toBe(false);
    expect(mockRevalidateStoreCache).toHaveBeenCalledWith("demo-store");
  });

  it("returns validation envelope for empty checkout payload", async () => {
    mockGetApiContext.mockResolvedValue({
      storeId: "store-1",
      userId: "owner-1",
      store: { id: "store-1", slug: "demo-store", ownerUserId: "owner-1", settings: {} },
    });
    const route = await import("./[slug]/settings/checkout/route");

    const response = await route.PATCH(
      nextRequest("http://localhost/api/stores/demo-store/settings/checkout", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ slug: "demo-store" }) },
    );
    const body = await readJson<ErrorResponse>(response);

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("updates only policy settings and preserves unrelated settings keys", async () => {
    const setMock = mockDbReturning({
      paymentMethods: ["stripe"],
      codEnabled: true,
      termsOfService: "updated-terms",
      privacyPolicy: "old-privacy",
      refundPolicy: "old-refund",
    });
    mockGetApiContext.mockResolvedValue({
      storeId: "store-1",
      userId: "owner-1",
      store: {
        id: "store-1",
        slug: "demo-store",
        ownerUserId: "owner-1",
        settings: {
          paymentMethods: ["stripe"],
          codEnabled: true,
          termsOfService: "old-terms",
          privacyPolicy: "old-privacy",
          refundPolicy: "old-refund",
        },
      },
    });
    const route = await import("./[slug]/settings/policies/route");

    const response = await route.PATCH(
      nextRequest("http://localhost/api/stores/demo-store/settings/policies", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ termsOfService: "updated-terms" }),
      }),
      { params: Promise.resolve({ slug: "demo-store" }) },
    );
    const body = await readJson<StoreResponse>(response);

    expect(response.status).toBe(200);
    const setArg = setMock.mock.calls[0][0] as { settings: Record<string, unknown> };
    expect(setArg.settings.termsOfService).toBe("updated-terms");
    expect(setArg.settings.codEnabled).toBe(true);
    expect(body.data.store.settings.privacyPolicy).toBe("old-privacy");
  });

  it("passes through owner auth failures from scoped settings endpoints", async () => {
    mockGetApiContext.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: { code: "FORBIDDEN", message: "Only the store owner can perform this action." },
        }),
        { status: 403, headers: { "content-type": "application/json" } },
      ),
    );
    const route = await import("./[slug]/settings/policies/route");

    const response = await route.PATCH(
      nextRequest("http://localhost/api/stores/demo-store/settings/policies", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ refundPolicy: "x" }),
      }),
      { params: Promise.resolve({ slug: "demo-store" }) },
    );
    const body = await readJson<ErrorResponse>(response);

    expect(response.status).toBe(403);
    expect(body.error.code).toBe("FORBIDDEN");
  });

  it("updates store status through danger endpoint for owner actions", async () => {
    const setMock = mockDbReturning({
      id: "store-1",
      status: "suspended",
      settings: { paymentMethods: ["stripe"] },
    } as unknown as Record<string, unknown>);
    mockGetApiContext.mockResolvedValue({
      storeId: "store-1",
      userId: "owner-1",
      store: { id: "store-1", slug: "demo-store", ownerUserId: "owner-1", settings: {} },
    });
    const route = await import("./[slug]/settings/danger/route");

    const response = await route.PATCH(
      nextRequest("http://localhost/api/stores/demo-store/settings/danger", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "suspend" }),
      }),
      { params: Promise.resolve({ slug: "demo-store" }) },
    );

    expect(response.status).toBe(200);
    const setArg = setMock.mock.calls[0][0] as Record<string, unknown>;
    expect(setArg.status).toBe("suspended");
  });

  it("returns validation error for invalid danger action payload", async () => {
    mockGetApiContext.mockResolvedValue({
      storeId: "store-1",
      userId: "owner-1",
      store: { id: "store-1", slug: "demo-store", ownerUserId: "owner-1", settings: {} },
    });
    const route = await import("./[slug]/settings/danger/route");

    const response = await route.PATCH(
      nextRequest("http://localhost/api/stores/demo-store/settings/danger", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "destroy" }),
      }),
      { params: Promise.resolve({ slug: "demo-store" }) },
    );
    const body = await readJson<ErrorResponse>(response);

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("updates only brand fields and preserves settings payload", async () => {
    const setMock = mockDbReturning({
      id: "store-1",
      name: "New Name",
      description: "Existing long store description",
      contactEmail: "new@example.com",
      settings: { paymentMethods: ["stripe"], codEnabled: true },
    } as unknown as Record<string, unknown>);
    mockGetApiContext.mockResolvedValue({
      storeId: "store-1",
      userId: "owner-1",
      store: {
        id: "store-1",
        slug: "demo-store",
        ownerUserId: "owner-1",
        name: "Old Name",
        description: "Existing long store description",
        contactEmail: "owner@example.com",
        settings: { paymentMethods: ["stripe"], codEnabled: true },
      },
    });
    const route = await import("./[slug]/settings/brand/route");

    const response = await route.PATCH(
      nextRequest("http://localhost/api/stores/demo-store/settings/brand", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ storeName: "New Name", email: "new@example.com" }),
      }),
      { params: Promise.resolve({ slug: "demo-store" }) },
    );

    expect(response.status).toBe(200);
    const setArg = setMock.mock.calls[0][0] as Record<string, unknown>;
    expect(setArg.name).toBe("New Name");
    expect(setArg.contactEmail).toBe("new@example.com");
    expect(setArg.updatedAt).toBeTruthy();
  });

  it("updates storefront settings and preserves unrelated keys", async () => {
    const setMock = mockDbReturning({
      storefrontContentMode: "custom",
      storefrontContent: { heroTitle: "Launch Week" },
      paymentMethods: ["stripe"],
    });
    mockGetApiContext.mockResolvedValue({
      storeId: "store-1",
      userId: "owner-1",
      store: {
        id: "store-1",
        slug: "demo-store",
        ownerUserId: "owner-1",
        settings: {
          storefrontContentMode: "store",
          storefrontContent: {},
          paymentMethods: ["stripe"],
        },
      },
    });
    const route = await import("./[slug]/settings/storefront/route");

    const response = await route.PATCH(
      nextRequest("http://localhost/api/stores/demo-store/settings/storefront", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          storefrontContentMode: "custom",
          storefrontContent: { heroTitle: "Launch Week" },
        }),
      }),
      { params: Promise.resolve({ slug: "demo-store" }) },
    );

    expect(response.status).toBe(200);
    const setArg = setMock.mock.calls[0][0] as { settings: Record<string, unknown> };
    expect(setArg.settings.storefrontContentMode).toBe("custom");
    expect((setArg.settings.storefrontContent as Record<string, unknown>).heroTitle).toBe("Launch Week");
    expect(setArg.settings.paymentMethods).toEqual(["stripe"]);
  });
});
