import type { CheckoutResult, CheckoutSession } from "@/lib/domains/checkout/types";
import type { ConfirmCheckoutInput, InitiateCheckoutInput } from "@/lib/domains/checkout/validation";
import { CheckoutService, type CheckoutServiceDeps } from "@/lib/domains/checkout/service";
import { OrderService, type OrderServiceDeps } from "@/lib/domains/orders/service";
import type { Order, OrderStatus, OrderSummary } from "@/lib/domains/orders/types";
import type { CreateOrderInput, OrderQueryInput } from "@/lib/domains/orders/validation";
import {
  StoreMembershipService,
  type MembershipService,
  type StoreMemberRole,
} from "@/lib/domains/stores/membership-service";
import type { StoreSettings } from "@/lib/domains/stores/types";
import type { StoreMemberRecord, StoreRecord, StoreRepository } from "@/lib/repositories/stores";
import { DrizzleStoreRepository } from "@/lib/repositories/stores";
import {
  DrizzleOrderRepository,
  type OrderRepository,
} from "@/lib/repositories/orders";
import {
  DrizzleProductRepository,
  type ProductRepository,
} from "@/lib/repositories/products";
import { DrizzleVariantRepository, type VariantRepository } from "@/lib/repositories/variants";
import { ProductsService } from "@/lib/domains/products/products-service";
import { businessRules } from "@/lib/config/business-rules";

/**
 * Service wiring guide:
 * - Repositories own persistence concerns (Drizzle queries).
 * - Domain services orchestrate collaborators and business rules.
 * - Routes should depend on these interfaces/factories, not concrete DB helpers.
 */
export interface IOrderService {
  createFromCart(storeId: string, input: CreateOrderInput): Promise<Order>;
  getById(storeId: string, orderId: string): Promise<Order | null>;
  list(storeId: string, query: OrderQueryInput): Promise<{ orders: OrderSummary[]; total: number }>;
  updateStatus(storeId: string, orderId: string, status: OrderStatus): Promise<Order | null>;
  cancel(storeId: string, orderId: string): Promise<boolean>;
  getCustomerOrders(storeId: string, customerId: string): Promise<OrderSummary[]>;
}

export interface OrderServiceFactoryDeps extends OrderServiceDeps {
  orderRepository?: OrderRepository;
}

export function createOrderService(deps: OrderServiceFactoryDeps = {}): IOrderService {
  const orderService = new OrderService({
    ...deps,
    orderRepository: deps.orderRepository ?? new DrizzleOrderRepository(),
  });

  return {
    createFromCart(storeId, input) {
      return orderService.create(storeId, input);
    },
    getById(storeId, orderId) {
      return orderService.getById(storeId, orderId);
    },
    list(storeId, query) {
      return orderService.list(storeId, query);
    },
    updateStatus(storeId, orderId, status) {
      return orderService.updateStatus(storeId, orderId, status);
    },
    cancel(storeId, orderId) {
      return orderService.cancel(storeId, orderId);
    },
    getCustomerOrders(storeId, customerId) {
      return orderService.getCustomerOrders(storeId, customerId);
    },
  };
}

export interface AddStoreMemberInput {
  storeId: string;
  userId: string;
  role: StoreMemberRole;
}

export interface IStoreService {
  getBySlug(slug: string): Promise<StoreRecord | null>;
  getById(storeId: string): Promise<StoreRecord | null>;
  updateSettings(storeId: string, settings: Partial<StoreSettings>): Promise<StoreRecord | null>;
  listMembers(storeId: string): Promise<StoreMemberRecord[]>;
  addMember(member: AddStoreMemberInput): Promise<void>;
  isUserMember(storeId: string, userId: string): Promise<StoreMemberRecord | null>;
}

export interface StoreServiceDeps {
  storeRepository?: StoreRepository;
  membershipService?: MembershipService;
}

export function createStoreService(deps: StoreServiceDeps = {}): IStoreService {
  const storeRepository = deps.storeRepository ?? new DrizzleStoreRepository();
  const membershipService = deps.membershipService ?? new StoreMembershipService(storeRepository);

  return {
    getBySlug(slug) {
      return storeRepository.findBySlug(slug);
    },
    getById(storeId) {
      return storeRepository.getById(storeId);
    },
    async updateSettings(storeId, settings) {
      const normalized = {
        paymentMethods: settings.paymentMethods ?? [],
        codEnabled: settings.codEnabled ?? false,
        shippingEnabled: settings.shippingEnabled ?? true,
        freeShippingThreshold: settings.freeShippingThreshold ?? undefined,
        termsOfService: settings.termsOfService ?? "",
        privacyPolicy: settings.privacyPolicy ?? "",
        refundPolicy: settings.refundPolicy ?? "",
      };

      await storeRepository.updateSettings(storeId, normalized);
      return storeRepository.getById(storeId);
    },
    listMembers(storeId) {
      return membershipService.list(storeId);
    },
    addMember(member) {
      return membershipService.add(member.storeId, member.userId, member.role);
    },
    isUserMember(storeId, userId) {
      return membershipService.getForUser(storeId, userId);
    },
  };
}

export interface ICheckoutService {
  initiateCheckout(storeId: string, input: InitiateCheckoutInput): Promise<CheckoutSession>;
  confirmCheckout(storeId: string, input: ConfirmCheckoutInput): Promise<CheckoutResult>;
  getCheckoutSession(storeId: string, orderId: string): Promise<CheckoutSession | null>;
}

export interface CheckoutFactoryDeps extends CheckoutServiceDeps {}

export function createCheckoutService(deps: CheckoutFactoryDeps = {}): ICheckoutService {
  const checkoutService = new CheckoutService({
    ...deps,
    rules: deps.rules ?? businessRules,
  });
  return {
    initiateCheckout(storeId, input) {
      return checkoutService.initiate(storeId, input);
    },
    confirmCheckout(storeId, input) {
      return checkoutService.confirm(storeId, input);
    },
    getCheckoutSession(storeId, orderId) {
      return checkoutService.getSession(storeId, orderId);
    },
  };
}

export interface IProductsService extends ProductsService {}

export interface ProductsServiceDeps {
  productRepository?: ProductRepository;
  variantRepository?: VariantRepository;
}

export function createProductsService(deps: ProductsServiceDeps = {}): IProductsService {
  return new ProductsService({
    productRepository:
      (deps.productRepository as DrizzleProductRepository | undefined) ?? new DrizzleProductRepository(),
    variantRepository:
      (deps.variantRepository as DrizzleVariantRepository | undefined) ?? new DrizzleVariantRepository(),
  });
}
