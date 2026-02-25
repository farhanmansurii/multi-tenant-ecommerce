import { createId } from "@paralleldrive/cuid2";

import { businessRules, type BusinessRules } from "@/lib/config/business-rules";
import {
  DrizzleOrderRepository,
  type OrderCreationPayload,
  type OrderRepository,
} from "@/lib/repositories/orders";
import {
  transactionCoordinator,
  type TransactionCallback,
  type TransactionExecutor,
} from "@/lib/transactions/coordinator";
import { DiscountCalculator } from "./discount-calculator";
import { OrderValidator } from "./order-validator";
import type { Order, OrderSummary, OrderStatus } from "./types";
import type { CreateOrderInput, OrderQueryInput } from "./validation";

export interface OrderServiceDeps {
  orderRepository?: OrderRepository;
  orderValidator?: OrderValidator;
  discountCalculator?: DiscountCalculator;
  rules?: Pick<BusinessRules, "taxRate" | "discountThreshold">;
  runInTransaction?: <T>(callback: TransactionCallback<T>) => Promise<T>;
}

export class OrderService {
  constructor(private readonly deps: OrderServiceDeps = {}) {}

  private get repository(): OrderRepository {
    return this.deps.orderRepository ?? new DrizzleOrderRepository();
  }

  private get validator(): OrderValidator {
    return this.deps.orderValidator ?? new OrderValidator();
  }

  private get calculator(): DiscountCalculator {
    return this.deps.discountCalculator ?? new DiscountCalculator();
  }

  private get rules(): Pick<BusinessRules, "taxRate" | "discountThreshold"> {
    return this.deps.rules ?? businessRules;
  }

  private run<T>(callback: TransactionCallback<T>): Promise<T> {
    return (this.deps.runInTransaction ?? transactionCoordinator.run)(callback);
  }

  async create(storeId: string, input: CreateOrderInput): Promise<Order> {
    return this.run(async (executor: TransactionExecutor) => {
      const { cart, items } = await this.validator.validate(executor, storeId, input.cartId);

      const subtotal = items.reduce((sum, item) => sum + item.unitPriceCents * item.qty, 0);
      const discount = await this.calculator.calculate(executor, {
        storeId,
        discountCode: input.discountCode,
        subtotal,
      });

      const effectiveDiscount =
        subtotal >= this.rules.discountThreshold ? discount : 0;
      const tax = Math.round(subtotal * this.rules.taxRate);
      const shipping = 0;
      const total = Math.max(0, subtotal + tax + shipping - effectiveDiscount);

      const orderPayload: OrderCreationPayload = {
        id: createId(),
        storeId,
        customerId: input.customerId,
        orderNumber: await this.repository.getNextOrderNumber(storeId, { executor }),
        status: "pending",
        amounts: {
          subtotal,
          tax,
          shipping,
          discount: effectiveDiscount,
          total,
        },
        currency: cart.currency,
        paymentStatus: "pending",
        shippingAddress: input.shippingAddress,
        billingAddress: input.billingAddress || input.shippingAddress,
        items: items.map((item) => ({
          id: createId(),
          storeId,
          orderId: "",
          productId: item.productId,
          variantId: item.variantId,
          qty: item.qty,
          unitPriceCents: item.unitPriceCents,
          totalPriceCents: item.unitPriceCents * item.qty,
        })),
      };

      orderPayload.items = orderPayload.items.map((item) => ({
        ...item,
        orderId: orderPayload.id,
      }));

      const order = await this.repository.create(orderPayload, { executor });
      await this.repository.markCartAsConverted(input.cartId, { executor });
      return order;
    });
  }

  getById(storeId: string, orderId: string): Promise<Order | null> {
    return this.repository.findByIdWithItems(storeId, orderId);
  }

  list(storeId: string, query: OrderQueryInput): Promise<{ orders: OrderSummary[]; total: number }> {
    return this.repository.list(storeId, query);
  }

  updateStatus(storeId: string, orderId: string, status: OrderStatus): Promise<Order | null> {
    return this.repository.updateStatus(storeId, orderId, status);
  }

  cancel(storeId: string, orderId: string): Promise<boolean> {
    return this.repository.cancel(storeId, orderId);
  }

  async getCustomerOrders(storeId: string, customerId: string, limit = 10): Promise<OrderSummary[]> {
    const result = await this.repository.list(storeId, { page: 1, limit, customerId });
    return result.orders;
  }
}

const defaultOrderService = new OrderService();

export async function createOrder(storeId: string, input: CreateOrderInput): Promise<Order> {
  return defaultOrderService.create(storeId, input);
}

export async function getOrderById(storeId: string, orderId: string): Promise<Order | null> {
  return defaultOrderService.getById(storeId, orderId);
}

export async function listOrders(
  storeId: string,
  query: OrderQueryInput,
): Promise<{ orders: OrderSummary[]; total: number }> {
  return defaultOrderService.list(storeId, query);
}

export async function updateOrderStatus(
  storeId: string,
  orderId: string,
  status: OrderStatus,
): Promise<Order | null> {
  return defaultOrderService.updateStatus(storeId, orderId, status);
}

export async function cancelOrder(storeId: string, orderId: string): Promise<boolean> {
  return defaultOrderService.cancel(storeId, orderId);
}

export async function getCustomerOrders(
  storeId: string,
  customerId: string,
  limit = 10,
): Promise<OrderSummary[]> {
  return defaultOrderService.getCustomerOrders(storeId, customerId, limit);
}
