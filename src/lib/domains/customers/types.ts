import { orderStatusEnum } from "../../db/schema/ecommerce/orders";
import type { orders } from "../../db/schema/ecommerce/orders";

export type OrderStatus = (typeof orderStatusEnum)["enumValues"][number];
type OrderRow = typeof orders.$inferSelect;

export interface CustomerData {
  name?: string;
  phone?: string;
  preferences?: Record<string, unknown>;
}

export interface SavedAddress {
  id: string;
  label: string;
  recipient: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface WishlistItem {
  productId: string;
  productSlug: string;
  addedAt: string;
}

export interface CustomerOrderSummary {
  id: string;
  orderNumber: OrderRow["orderNumber"];
  status: OrderRow["status"];
  totalAmount: number;
  currency: OrderRow["currency"];
  items: number;
  placedAt: OrderRow["createdAt"];
}

export interface Customer {
  id: string;
  storeId: string;
  userId: string | null;
  email: string;
  data: CustomerData;
  wishlist: WishlistItem[];
  savedAddresses: SavedAddress[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerSummary {
  id: string;
  email: string;
  name?: string;
  orderCount: number;
  createdAt: Date;
}
