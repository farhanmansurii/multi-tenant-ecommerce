import { createId } from "@paralleldrive/cuid2";
import type { StoreMemberRecord, StoreRepository } from "@/lib/repositories/stores";

export type StoreMemberRole = "owner" | "admin" | "member";

export interface MembershipService {
  list(storeId: string): Promise<StoreMemberRecord[]>;
  add(storeId: string, userId: string, role: StoreMemberRole): Promise<void>;
  getForUser(storeId: string, userId: string): Promise<StoreMemberRecord | null>;
}

export class StoreMembershipService implements MembershipService {
  constructor(private readonly storeRepository: StoreRepository) {}

  list(storeId: string): Promise<StoreMemberRecord[]> {
    return this.storeRepository.listMembers(storeId);
  }

  async add(storeId: string, userId: string, role: StoreMemberRole): Promise<void> {
    await this.storeRepository.addMember({
      id: createId(),
      storeId,
      userId,
      role,
      permissions: {
        canManageProducts: role !== "member",
        canManageOrders: role !== "member",
        canManageCustomers: role !== "member",
        canManageSettings: role === "owner" || role === "admin",
        canViewAnalytics: true,
      },
    });
  }

  async getForUser(storeId: string, userId: string): Promise<StoreMemberRecord | null> {
    const members = await this.storeRepository.listMembers(storeId);
    return members.find((member) => member.userId === userId) ?? null;
  }
}
