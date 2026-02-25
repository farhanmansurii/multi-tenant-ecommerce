import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mockRequireAuthOrNull = vi.fn();
const mockGetStoresByOwner = vi.fn();
const mockCreateStore = vi.fn();
const mockGetUserRole = vi.fn();
const mockAddStoreMember = vi.fn();
const mockGetApiContext = vi.fn();
const mockRevalidateStoreCache = vi.fn();

vi.mock("@/lib/session/helpers", () => ({
  requireAuthOrNull: mockRequireAuthOrNull,
}));

vi.mock("@/lib/domains/stores", () => ({
  storeHelpers: {
    getStoresByOwner: mockGetStoresByOwner,
    createStore: mockCreateStore,
    getUserRole: mockGetUserRole,
    addStoreMember: mockAddStoreMember,
  },
}));

vi.mock("@/lib/api/context", () => ({
  getApiContext: mockGetApiContext,
  getApiContextOrNull: vi.fn(),
}));

vi.mock("@/lib/api/cache-revalidation", () => ({
  revalidateStoreCache: mockRevalidateStoreCache,
}));

vi.mock("@/lib/db", () => ({
  db: {},
}));

vi.mock("@/lib/api/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

function validStorePayload() {
  return {
    storeName: "Acme Store",
    storeSlug: "acme-store",
    description: "A fully valid store description.",
    email: "owner@example.com",
    logo: "",
    primaryColor: "#112233",
    currency: "USD",
    paymentMethods: ["stripe"],
    codEnabled: false,
    shippingEnabled: true,
    freeShippingThreshold: 100,
    termsOfService: "Terms of service content",
    privacyPolicy: "Privacy policy content",
    refundPolicy: "Refund policy content",
  };
}

type ErrorResponse = { error: { code: string; message: string } };
type StoreCreateResponse = { data: { store: { slug: string } } };

function nextRequest(init: RequestInit, url = "http://localhost/api/stores"): NextRequest {
  return new Request(url, init) as unknown as NextRequest;
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

describe("stores management API regression coverage", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns structured auth error when listing stores without a session", async () => {
    mockRequireAuthOrNull.mockResolvedValue(null);
    const route = await import("./route");

    const response = await route.GET();
    const body = await readJson<ErrorResponse>(response);

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("NOT_AUTHENTICATED");
    expect(body.error.message).toBe("Unauthorized");
  });

  it("returns validation error envelope for invalid store creation payload", async () => {
    mockRequireAuthOrNull.mockResolvedValue({ user: { id: "u-1" } });
    mockGetStoresByOwner.mockResolvedValue([]);
    const route = await import("./route");

    const response = await route.POST(
      nextRequest({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ storeName: "x" }),
      }),
    );
    const body = await readJson<ErrorResponse>(response);

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toBe("Invalid payload");
  });

  it("returns success envelope and mutation cache policy for store creation", async () => {
    mockRequireAuthOrNull.mockResolvedValue({ user: { id: "u-1" } });
    mockGetStoresByOwner.mockResolvedValue([]);
    mockCreateStore.mockResolvedValue({ id: "s-1", slug: "acme-store", name: "Acme Store" });
    const route = await import("./route");

    const response = await route.POST(
      nextRequest({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validStorePayload()),
      }),
    );
    const body = await readJson<StoreCreateResponse>(response);

    expect(response.status).toBe(201);
    expect(body.data.store.slug).toBe("acme-store");
    expect(response.headers.get("cache-control")).toBe("no-store, no-cache, must-revalidate");
    expect(mockRevalidateStoreCache).toHaveBeenCalledWith("acme-store");
  });

  it("returns structured conflict error envelope on duplicate store slug", async () => {
    mockRequireAuthOrNull.mockResolvedValue({ user: { id: "u-1" } });
    mockGetStoresByOwner.mockResolvedValue([]);
    mockCreateStore.mockRejectedValue(
      new Error("duplicate key value violates unique constraint stores_slug_unique"),
    );
    const route = await import("./route");

    const response = await route.POST(
      nextRequest({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validStorePayload()),
      }),
    );
    const body = await readJson<ErrorResponse>(response);

    expect(response.status).toBe(409);
    expect(body.error.code).toBe("CONFLICT");
    expect(body.error.message).toContain("already exists");
  });

  it("returns validation envelope for invalid add-member payload", async () => {
    mockGetApiContext.mockResolvedValue({
      storeId: "s-1",
      userId: "u-owner",
      store: { ownerUserId: "u-owner" },
      session: { user: { id: "u-owner", email: "owner@example.com" } },
    });
    mockGetUserRole.mockResolvedValue("owner");
    const route = await import("./[slug]/members/route");

    const response = await route.POST(
      nextRequest(
        {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId: "" }),
        },
        "http://localhost/api/stores/acme-store/members",
      ),
      { params: Promise.resolve({ slug: "acme-store" }) },
    );
    const body = await readJson<ErrorResponse>(response);

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toBe("Invalid payload");
  });
});
