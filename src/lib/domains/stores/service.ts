import { withBaseUrl } from "@/lib/utils/url";
import type { StoreData, StoreFormPayload } from "./types";
import { parseApiResponse, unwrapApiData } from "@/lib/query/api-response";

interface ProductsResponse {
  count: number;
  products?: unknown[];
}

interface DashboardAnalyticsData {
  revenue: { total: number };
  orders: { total: number };
  customers: { total: number };
  salesOverTime: Array<{ name: string; total: number }>;
  recentActivity: Array<{
    id: string;
    customerName: string;
    customerEmail: string;
    amount: number;
    status: string;
    createdAt: Date;
  }>;
}

interface StoreAnalyticsResponse {
  analytics: DashboardAnalyticsData;
  currency: string;
  storeName?: string;
}

export interface CheckoutSettingsPayload {
  paymentMethods?: Array<"stripe" | "cod">;
  codEnabled?: boolean;
  shippingEnabled?: boolean;
  freeShippingThreshold?: number | null;
}

export interface PoliciesSettingsPayload {
  termsOfService?: string;
  privacyPolicy?: string;
  refundPolicy?: string;
}

export interface BrandSettingsPayload {
  storeName?: string;
  description?: string;
  email?: string;
  logo?: string | null;
  primaryColor?: string;
  currency?: string;
}

export interface StorefrontSettingsPayload {
  storefrontContentMode?: "defaults" | "store" | "custom";
  storefrontContent?: Record<string, unknown>;
}

export interface DangerSettingsPayload {
  action: "suspend" | "activate";
}

export interface StoreMemberData {
  userId: string;
  role: "owner" | "admin" | "member";
  permissions?: {
    canManageProducts?: boolean;
    canManageOrders?: boolean;
    canManageCustomers?: boolean;
    canManageSettings?: boolean;
    canViewAnalytics?: boolean;
  };
  createdAt?: string;
}

export async function fetchStores() {
  const response = await fetch(withBaseUrl("/api/stores"));
  return parseApiResponse<{
    stores: StoreData[];
    count: number;
    limit: number;
    canCreateMore: boolean;
    totalRevenue: number;
  }>(response, response.status === 404 ? "Stores not found" : "Failed to load stores");
}

export const fetchStore = async (slug: string): Promise<StoreData> => {
  const response = await fetch(withBaseUrl(`/api/stores/${slug}`));
  const data = await parseApiResponse<{ store: StoreData }>(
    response,
    response.status === 404 ? "Store not found" : "Failed to load store",
  );
  return data.store;
};

export async function createStore(data: StoreFormPayload): Promise<StoreData> {
  const response = await fetch(withBaseUrl("/api/stores"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await parseApiResponse<{ store: StoreData }>(response, "Failed to create store");
  return result.store;
}

export async function updateStore(slug: string, data: StoreFormPayload): Promise<StoreData> {
  const response = await fetch(withBaseUrl(`/api/stores/${slug}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await parseApiResponse<{ store: StoreData }>(response, "Failed to update store");
  return result.store;
}

export async function updateCheckoutSettings(
  slug: string,
  data: CheckoutSettingsPayload,
): Promise<StoreData> {
  const response = await fetch(withBaseUrl(`/api/stores/${slug}/settings/checkout`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await parseApiResponse<{ store: StoreData }>(
    response,
    "Failed to update checkout settings",
  );
  return result.store;
}

export async function updatePoliciesSettings(
  slug: string,
  data: PoliciesSettingsPayload,
): Promise<StoreData> {
  const response = await fetch(withBaseUrl(`/api/stores/${slug}/settings/policies`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await parseApiResponse<{ store: StoreData }>(
    response,
    "Failed to update policies settings",
  );
  return result.store;
}

export async function updateBrandSettings(
  slug: string,
  data: BrandSettingsPayload,
): Promise<StoreData> {
  const response = await fetch(withBaseUrl(`/api/stores/${slug}/settings/brand`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await parseApiResponse<{ store: StoreData }>(
    response,
    "Failed to update brand settings",
  );
  return result.store;
}

export async function updateStorefrontSettings(
  slug: string,
  data: StorefrontSettingsPayload,
): Promise<StoreData> {
  const response = await fetch(withBaseUrl(`/api/stores/${slug}/settings/storefront`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await parseApiResponse<{ store: StoreData }>(
    response,
    "Failed to update storefront settings",
  );
  return result.store;
}

export async function updateDangerSettings(
  slug: string,
  data: DangerSettingsPayload,
): Promise<StoreData> {
  const response = await fetch(withBaseUrl(`/api/stores/${slug}/settings/danger`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await parseApiResponse<{ store: StoreData }>(
    response,
    "Failed to update danger settings",
  );
  return result.store;
}

export async function fetchStoreMembers(slug: string): Promise<StoreMemberData[]> {
  const response = await fetch(withBaseUrl(`/api/stores/${slug}/members`));
  const data = await parseApiResponse<{ members: StoreMemberData[] }>(
    response,
    "Failed to load store members",
  );
  return data.members;
}

export async function addStoreMember(
  slug: string,
  data: { userId: string; role: "admin" | "member" },
): Promise<StoreMemberData> {
  const response = await fetch(withBaseUrl(`/api/stores/${slug}/members`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await parseApiResponse<{ member: StoreMemberData }>(
    response,
    "Failed to add store member",
  );
  return result.member;
}

export async function updateStoreMemberRole(
  slug: string,
  userId: string,
  role: "admin" | "member",
): Promise<StoreMemberData> {
  const response = await fetch(withBaseUrl(`/api/stores/${slug}/members/${userId}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  const result = await parseApiResponse<{ member: StoreMemberData }>(
    response,
    "Failed to update member role",
  );
  return result.member;
}

export async function removeStoreMember(slug: string, userId: string): Promise<StoreMemberData> {
  const response = await fetch(withBaseUrl(`/api/stores/${slug}/members/${userId}`), {
    method: "DELETE",
  });
  const result = await parseApiResponse<{ member: StoreMemberData }>(
    response,
    "Failed to remove store member",
  );
  return result.member;
}

export async function fetchProductStats(slug: string): Promise<number> {
  const res = await fetch(withBaseUrl(`/api/stores/${slug}/products`));
  if (!res.ok) return 0;
  const payload = (await res.json()) as unknown;
  const data = unwrapApiData<ProductsResponse>(payload);
  if (Array.isArray(data.products)) return data.products.length;
  return 0;
}

export async function fetchStoreAnalytics(slug: string): Promise<StoreAnalyticsResponse> {
  const response = await fetch(withBaseUrl(`/api/stores/${slug}/analytics`));
  const data = await parseApiResponse<{
    analytics?: Partial<DashboardAnalyticsData>;
    summary?: {
      totalRevenue?: number;
      totalPurchases?: number;
    };
    revenueByPeriod?: Array<{ period?: string; revenue?: number }>;
    recentActivity?: DashboardAnalyticsData["recentActivity"];
    currency?: string;
    storeName?: string;
  }>(
    response,
    "Failed to load analytics",
  );

  const salesOverTime = Array.isArray(data.revenueByPeriod)
    ? data.revenueByPeriod.map((item) => ({
        name: String(item.period ?? ""),
        total: Number(item.revenue ?? 0),
      }))
    : data.analytics?.salesOverTime ?? [];

  const normalizedAnalytics: DashboardAnalyticsData = {
    revenue: {
      total: Number(data.analytics?.revenue?.total ?? data.summary?.totalRevenue ?? 0),
    },
    orders: {
      total: Number(data.analytics?.orders?.total ?? data.summary?.totalPurchases ?? 0),
    },
    customers: {
      total: Number(data.analytics?.customers?.total ?? 0),
    },
    salesOverTime,
    recentActivity: data.recentActivity ?? data.analytics?.recentActivity ?? [],
  };

  return {
    analytics: normalizedAnalytics,
    currency: data.currency || "INR",
    storeName: data.storeName,
  };
}
