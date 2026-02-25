import type { Order } from "@/lib/domains/orders/types";
import type { Cart } from "@/lib/domains/cart/types";
import { orderPaymentStatusEnum } from "../../db/schema/ecommerce/orders";
import type { orders } from "../../db/schema/ecommerce/orders";

export type CheckoutStatus = "pending" | "processing" | "completed" | "failed";

type OrderRow = typeof orders.$inferSelect;
export type PaymentStatus = OrderRow["paymentStatus"] | (typeof orderPaymentStatusEnum)["enumValues"][number];

export interface CheckoutSession {
  orderId: string;
  orderNumber: number;
  status: CheckoutStatus;
  cart: Cart;
  amounts: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
  };
  currency: string;
}

export interface CheckoutResult {
  success: boolean;
  order: Order;
  paymentStatus: PaymentStatus;
  message: string;
}
