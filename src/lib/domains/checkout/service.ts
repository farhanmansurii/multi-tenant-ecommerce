import { businessRules, type BusinessRules } from "@/lib/config/business-rules";
import { getCartById } from "@/lib/domains/cart";
import {
  createOrder,
  getOrderById,
  updateOrderStatus,
} from "@/lib/domains/orders";
import { logger } from "@/lib/api/logger";
import { transactionCoordinator, type TransactionCallback } from "@/lib/transactions/coordinator";
import type { CheckoutResult, CheckoutSession, PaymentStatus } from "./types";
import type { InitiateCheckoutInput, ConfirmCheckoutInput } from "./validation";

export interface PaymentRequest {
  orderId: string;
  storeId: string;
  amountCents: number;
  currency: string;
  paymentMethod: string;
}

export interface PaymentResult {
  success: boolean;
  status: PaymentStatus;
  message: string;
}

export interface PaymentProcessor {
  process(request: PaymentRequest): Promise<PaymentResult>;
}

class MockPaymentProcessor implements PaymentProcessor {
  constructor(
    private readonly rules: Pick<BusinessRules, "mockPaymentDelayMs" | "mockPaymentSuccessRate">,
  ) {}

  async process(request: PaymentRequest): Promise<PaymentResult> {
    await new Promise((resolve) => setTimeout(resolve, this.rules.mockPaymentDelayMs));

    if (request.paymentMethod === "cod") {
      return {
        success: true,
        status: "pending",
        message: "Order placed successfully. Payment will be collected on delivery.",
      };
    }

    const success = Math.random() < this.rules.mockPaymentSuccessRate;
    return success
      ? { success: true, status: "succeeded", message: "Payment successful. Order confirmed." }
      : { success: false, status: "failed", message: "Payment failed. Please try again." };
  }
}

export interface CheckoutServiceDeps {
  paymentProcessor?: PaymentProcessor;
  rules?: Pick<BusinessRules, "maxCheckoutItems" | "mockPaymentDelayMs" | "mockPaymentSuccessRate">;
  runInTransaction?: <T>(callback: TransactionCallback<T>) => Promise<T>;
}

export class CheckoutService {
  constructor(private readonly deps: CheckoutServiceDeps = {}) {}

  private get rules() {
    return this.deps.rules ?? businessRules;
  }

  private get paymentProcessor(): PaymentProcessor {
    return this.deps.paymentProcessor ?? new MockPaymentProcessor(this.rules);
  }

  private run<T>(callback: TransactionCallback<T>): Promise<T> {
    return (this.deps.runInTransaction ?? transactionCoordinator.run)(callback);
  }

  async initiate(storeId: string, input: InitiateCheckoutInput): Promise<CheckoutSession> {
    const { cartId, customerId, shippingAddress, billingAddress, discountCode } = input;

    const cart = await getCartById(storeId, cartId);
    if (!cart) {
      throw new Error("Cart not found");
    }

    if (cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    if (cart.items.length > this.rules.maxCheckoutItems) {
      throw new Error(`Cart cannot exceed ${this.rules.maxCheckoutItems} items`);
    }

    const order = await createOrder(storeId, {
      cartId,
      customerId,
      shippingAddress,
      billingAddress,
      discountCode,
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: "pending",
      cart,
      amounts: order.amounts,
      currency: order.currency,
    };
  }

  async confirm(storeId: string, input: ConfirmCheckoutInput): Promise<CheckoutResult> {
    return this.run(async () => {
      const { orderId, paymentMethod } = input;

      const order = await getOrderById(storeId, orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      if (order.status !== "pending") {
        throw new Error(`Order is already ${order.status}`);
      }

      const payment = await this.paymentProcessor.process({
        orderId: order.id,
        storeId,
        amountCents: order.amounts.total,
        currency: order.currency,
        paymentMethod,
      });

      if (!payment.success) {
        logger.warn("Checkout payment failed", {
          storeId,
          orderId: order.id,
          paymentMethod,
          paymentStatus: payment.status,
        });

        return {
          success: false,
          order,
          paymentStatus: payment.status,
          message: payment.message,
        };
      }

      const updatedOrder = await updateOrderStatus(storeId, orderId, "confirmed");
      if (!updatedOrder) {
        throw new Error("Failed to update order status");
      }

      return {
        success: true,
        order: updatedOrder,
        paymentStatus: payment.status,
        message: payment.message,
      };
    });
  }

  async getSession(storeId: string, orderId: string): Promise<CheckoutSession | null> {
    const order = await getOrderById(storeId, orderId);
    if (!order) return null;

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.paymentStatus === "succeeded" ? "completed" : "pending",
      cart: {
        id: "",
        storeId,
        customerId: order.customerId,
        sessionId: null,
        status: "converted",
        currency: order.currency,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: [],
        subtotalCents: order.amounts.subtotal,
        itemCount: order.items.length,
      },
      amounts: order.amounts,
      currency: order.currency,
    };
  }
}

const defaultCheckoutService = new CheckoutService();

export async function initiateCheckout(
  storeId: string,
  input: InitiateCheckoutInput,
): Promise<CheckoutSession> {
  return defaultCheckoutService.initiate(storeId, input);
}

export async function confirmCheckout(
  storeId: string,
  input: ConfirmCheckoutInput,
): Promise<CheckoutResult> {
  return defaultCheckoutService.confirm(storeId, input);
}

export async function getCheckoutSession(
  storeId: string,
  orderId: string,
): Promise<CheckoutSession | null> {
  return defaultCheckoutService.getSession(storeId, orderId);
}
