import "server-only";
import { eq, and } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/lib/db";
import { stores, storeMembers } from "@/lib/db/schema";
import { setTenantContext } from "@/lib/middleware/tenant";

export interface CreateStoreData {
  ownerUserId: string;
  name: string;
  slug: string;
  description: string;
  contactEmail: string;
  businessType: string;
  businessName: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  primaryColor: string;
  currency?: string;
  timezone?: string;
  language?: string;
}

/**
 * Create a new store
 */
export async function createStore(data: CreateStoreData) {
  const [store] = await db
    .insert(stores)
    .values({
      id: crypto.randomUUID(),
      ownerUserId: data.ownerUserId,
      name: data.name,
      slug: data.slug,
      description: data.description,
      contactEmail: data.contactEmail,
      businessType: data.businessType,
      businessName: data.businessName,
      addressLine1: data.addressLine1,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      country: data.country,
      primaryColor: data.primaryColor,
      currency: data.currency || "INR",
      timezone: data.timezone || "Asia/Kolkata",
      language: data.language || "en",
      status: "draft",
      featured: false,
      settings: {
        paymentMethods: [],
        shippingRates: [],
        upiId: undefined,
        codEnabled: true,
        stripeAccountId: undefined,
        paypalEmail: undefined,
        shippingEnabled: true,
        freeShippingThreshold: undefined,
        termsOfService: "",
        privacyPolicy: "",
        refundPolicy: "",
      },
    })
    .returning();

  // Add owner as store member
  await db.insert(storeMembers).values({
    id: crypto.randomUUID(),
    storeId: store.id,
    userId: data.ownerUserId,
    role: "owner",
    permissions: {
      canManageProducts: true,
      canManageOrders: true,
      canManageCustomers: true,
      canManageSettings: true,
      canViewAnalytics: true,
    },
  });

  return store;
}

/**
 * Get store by slug (uncached - for internal use)
 */
async function _getStoreBySlug(slug: string) {
  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.slug, slug))
    .limit(1);

  return store || null;
}

/**
 * Get store by slug - cached per request to avoid redundant queries
 * Uses React's cache() to deduplicate calls within the same request
 */
export const getStoreBySlug = cache(_getStoreBySlug);

/**
 * Get store by ID
 */
export async function getStoreById(id: string) {
  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.id, id))
    .limit(1);

  return store || null;
}

/**
 * Update store
 */
export async function updateStore(id: string, data: Partial<CreateStoreData>) {
  const [updatedStore] = await db
    .update(stores)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(stores.id, id))
    .returning();

  return updatedStore;
}

/**
 * Check if user is store member
 */
export async function isUserMember(storeId: string, userId: string) {
  const [member] = await db
    .select()
    .from(storeMembers)
    .where(
      and(
        eq(storeMembers.storeId, storeId),
        eq(storeMembers.userId, userId)
      )
    )
    .limit(1);

  return member || null;
}

/**
 * Get user's role in store
 */
export async function getUserRole(storeId: string, userId: string) {
  const member = await isUserMember(storeId, userId);
  return member?.role || null;
}

/**
 * List stores owned by user
 */
export async function getStoresByOwner(userId: string) {
  return await db
    .select()
    .from(stores)
    .where(eq(stores.ownerUserId, userId));
}

/**
 * List stores where user is a member
 */
export async function getStoresByMember(userId: string) {
  return await db
    .select({
      id: stores.id,
      name: stores.name,
      slug: stores.slug,
      description: stores.description,
      status: stores.status,
      featured: stores.featured,
      createdAt: stores.createdAt,
      updatedAt: stores.updatedAt,
      role: storeMembers.role,
      permissions: storeMembers.permissions,
    })
    .from(stores)
    .innerJoin(storeMembers, eq(stores.id, storeMembers.storeId))
    .where(eq(storeMembers.userId, userId));
}

/**
 * Get store with tenant context (for RLS)
 */
export async function getStoreWithContext(storeId: string) {
  await setTenantContext(storeId);
  return await getStoreById(storeId);
}

/**
 * List members for a store
 */
export async function listStoreMembers(storeId: string) {
  return await db
    .select({
      userId: storeMembers.userId,
      role: storeMembers.role,
      permissions: storeMembers.permissions,
      createdAt: storeMembers.createdAt,
    })
    .from(storeMembers)
    .where(eq(storeMembers.storeId, storeId));
}

/**
 * Add a member to a store
 */
export async function addStoreMember(storeId: string, userId: string, role: "owner" | "admin" | "member") {
  const [inserted] = await db
    .insert(storeMembers)
    .values({
      id: crypto.randomUUID(),
      storeId,
      userId,
      role,
      permissions: {
        canManageProducts: role !== "member" || false,
        canManageOrders: role !== "member" || false,
        canManageCustomers: role !== "member" || false,
        canManageSettings: role === "owner" || role === "admin",
        canViewAnalytics: true,
      },
    })
    .returning();
  return inserted;
}

/**
 * Update a member's role
 */
export async function updateStoreMemberRole(storeId: string, userId: string, role: "owner" | "admin" | "member") {
  const [updated] = await db
    .update(storeMembers)
    .set({ role })
    .where(and(eq(storeMembers.storeId, storeId), eq(storeMembers.userId, userId)))
    .returning();
  return updated;
}

/**
 * Remove a member from a store
 */
export async function removeStoreMember(storeId: string, userId: string) {
  const [deleted] = await db
    .delete(storeMembers)
    .where(and(eq(storeMembers.storeId, storeId), eq(storeMembers.userId, userId)))
    .returning();
  return deleted;
}
