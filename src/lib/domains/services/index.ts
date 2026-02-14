import type { Order, OrderSummary, OrderStatus } from "@/lib/domains/orders/types";
import type { CreateOrderInput, OrderQueryInput } from "@/lib/domains/orders/validation";
import {
  createOrder,
  getOrderById,
  listOrders,
  updateOrderStatus,
  cancelOrder,
  getCustomerOrders,
} from "@/lib/domains/orders";
import {
  getStoreBySlug,
  getStoreById,
  updateStore,
  listStoreMembers,
  addStoreMember,
  isUserMember,
} from "@/lib/domains/stores/helpers";
import type { StoreSettings } from "@/lib/domains/stores/types";
import {
  initiateCheckout,
  confirmCheckout,
  getCheckoutSession,
} from "@/lib/domains/checkout/service";
import type { CheckoutResult, CheckoutSession } from "@/lib/domains/checkout/types";
import type {
  InitiateCheckoutInput,
  ConfirmCheckoutInput,
} from "@/lib/domains/checkout/validation";
import type { OrderRepository, StoreRepository, StoreRecord } from "@/lib/repositories";

type UpdatableStoreSettings = Omit<StoreSettings, "freeShippingThreshold"> & {
  freeShippingThreshold?: number;
};

export interface IOrderService {
  createFromCart(storeId: string, input: CreateOrderInput): Promise<Order>;
  getById(storeId: string, orderId: string): Promise<Order | null>;
  list(storeId: string, query: OrderQueryInput): Promise<{ orders: OrderSummary[]; total: number }>;
  updateStatus(storeId: string, orderId: string, status: OrderStatus): Promise<Order | null>;
  cancel(storeId: string, orderId: string): Promise<boolean>;
  getCustomerOrders(storeId: string, customerId: string): Promise<OrderSummary[]>;
}

export interface OrderServiceDeps {
  orderRepository?: OrderRepository;
}

export function createOrderService(deps: OrderServiceDeps = {}): IOrderService {
  const { orderRepository } = deps;

  return {
    createFromCart(storeId, input) {
      return createOrder(storeId, input);
    },
    getById(storeId, orderId) {
      if (orderRepository) {
        return orderRepository.findByIdWithItems(storeId, orderId);
      }
      return getOrderById(storeId, orderId);
    },
    list(storeId, query) {
      if (orderRepository) {
        return orderRepository.list(storeId, query);
      }
      return listOrders(storeId, query);
    },
    updateStatus(storeId, orderId, status) {
      if (orderRepository) {
        return orderRepository.updateStatus(storeId, orderId, status);
      }
      return updateOrderStatus(storeId, orderId, status);
    },
    cancel(storeId, orderId) {
      return cancelOrder(storeId, orderId);
    },
    async getCustomerOrders(storeId, customerId) {
      if (orderRepository) {
        const result = await orderRepository.list(storeId, { page: 1, limit: 20, customerId });
        return result.orders;
      }
      return getCustomerOrders(storeId, customerId);
    },
  };
}

export type StoreMemberSummary = Awaited<ReturnType<typeof listStoreMembers>>[number];

export type AddStoreMemberInput = {
  storeId: string;
  userId: string;
  role: "owner" | "admin" | "member";
};

export interface IStoreService {
  getBySlug(slug: string): Promise<StoreRecord | null>;
  updateSettings(storeId: string, settings: Partial<StoreSettings>): Promise<StoreRecord | null>;
  listMembers(storeId: string): Promise<StoreMemberSummary[]>;
  addMember(member: AddStoreMemberInput): Promise<void>;
  isUserMember(storeId: string, userId: string): Promise<StoreMemberSummary | null>;
}

export interface StoreServiceDeps {
  storeRepository?: StoreRepository;
}

export function createStoreService(deps: StoreServiceDeps = {}): IStoreService {
  const { storeRepository } = deps;

  return {
    getBySlug(slug) {
      if (storeRepository) {
        return storeRepository.findBySlug(slug);
      }
      return getStoreBySlug(slug);
    },
    async updateSettings(storeId, settings) {
      const normalized: UpdatableStoreSettings = {
        paymentMethods: settings.paymentMethods ?? [],
        codEnabled: settings.codEnabled ?? false,
        shippingEnabled: settings.shippingEnabled ?? true,
        freeShippingThreshold: settings.freeShippingThreshold ?? undefined,
        termsOfService: settings.termsOfService ?? "",
        privacyPolicy: settings.privacyPolicy ?? "",
        refundPolicy: settings.refundPolicy ?? "",
      };
      if (storeRepository) {
        await storeRepository.updateSettings(storeId, normalized as StoreRecord["settings"]);
        return storeRepository.getById(storeId);
      }
      await updateStore(storeId, { settings: normalized as StoreSettings });
      return getStoreById(storeId);
    },
    listMembers(storeId) {
      return listStoreMembers(storeId);
    },
    async addMember(input) {
      await addStoreMember(input.storeId, input.userId, input.role);
    },
    isUserMember(storeId, userId) {
      return isUserMember(storeId, userId);
    },
  };
}

export interface ICheckoutService {
  initiateCheckout(storeId: string, input: InitiateCheckoutInput): Promise<CheckoutSession>;
  confirmCheckout(storeId: string, input: ConfirmCheckoutInput): Promise<CheckoutResult>;
  getCheckoutSession(storeId: string, orderId: string): Promise<CheckoutSession | null>;
}

export interface CheckoutServiceDeps {
  // Future dependencies can be injected here (e.g., PaymentProcessor)
}

export function createCheckoutService(_deps: CheckoutServiceDeps = {}): ICheckoutService {
  return {
    initiateCheckout(storeId, input) {
      return initiateCheckout(storeId, input);
    },
    confirmCheckout(storeId, input) {
      return confirmCheckout(storeId, input);
    },
    getCheckoutSession(storeId, orderId) {
      return getCheckoutSession(storeId, orderId);
    },
  };
}
