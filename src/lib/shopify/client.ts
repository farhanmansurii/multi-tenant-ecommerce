import { shopifyConfigs } from "@/lib/db/schema/shopify";

export interface ShopifyConfig {
  id: string;
  storeId: string;
  domain: string;
  accessToken: string;
  apiVersion: string;
  webhookSecret?: string;
  enabled: boolean;
  lastSyncAt?: Date | null;
  syncStatus: string;
  settings: {
    syncProducts: boolean;
    syncInventory: boolean;
    syncOrders: boolean;
    autoPublish: boolean;
  };
}

export class ShopifyClient {
  constructor(private config: ShopifyConfig) {}

  private get baseUrl(): string {
    return `https://${this.config.domain}/admin/api/${this.config.apiVersion}`;
  }

  private get headers(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': this.config.accessToken,
    };
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Shopify API error: ${response.status} ${error}`);
    }

    return response.json();
  }

  // Products
  async getProducts(params: { limit?: number; since_id?: string } = {}) {
    const query = new URLSearchParams();
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.since_id) query.set('since_id', params.since_id);

    return this.request<{ products: ShopifyProduct[] }>(`/products.json?${query}`);
  }

  async getProduct(productId: string) {
    return this.request<{ product: ShopifyProduct }>(`/products/${productId}.json`);
  }

  // Inventory
  async getInventoryLevels(params: { inventory_item_ids?: string[]; location_ids?: string[] } = {}) {
    const query = new URLSearchParams();
    if (params.inventory_item_ids) {
      query.set('inventory_item_ids', params.inventory_item_ids.join(','));
    }
    if (params.location_ids) {
      query.set('location_ids', params.location_ids.join(','));
    }

    return this.request<{ inventory_levels: ShopifyInventoryLevel[] }>(`/inventory_levels.json?${query}`);
  }

  // Webhooks
  async createWebhook(webhook: {
    topic: string;
    address: string;
    format?: 'json' | 'xml';
  }) {
    return this.request<{ webhook: ShopifyWebhook }>(`/webhooks.json`, {
      method: 'POST',
      body: JSON.stringify({ webhook }),
    });
  }

  async deleteWebhook(webhookId: string) {
    return this.request(`/webhooks/${webhookId}.json`, {
      method: 'DELETE',
    });
  }
}

// Shopify API Types (simplified)
export interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: string;
  handle: string;
  updated_at: string;
  published_at: string | null;
  status: 'active' | 'draft' | 'archived';
  tags: string;
  variants: ShopifyVariant[];
  images: ShopifyImage[];
  options: ShopifyOption[];
}

export interface ShopifyVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  sku: string;
  position: number;
  inventory_policy: 'deny' | 'continue';
  compare_at_price: string | null;
  fulfillment_service: string;
  inventory_management: string | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  created_at: string;
  updated_at: string;
  taxable: boolean;
  grams: number;
  weight: number;
  weight_unit: string;
  inventory_item_id: number;
  inventory_quantity: number;
  requires_shipping: boolean;
  image_id: number | null;
}

export interface ShopifyImage {
  id: number;
  product_id: number;
  position: number;
  created_at: string;
  updated_at: string;
  src: string;
  variant_ids: number[];
}

export interface ShopifyOption {
  id: number;
  product_id: number;
  name: string;
  position: number;
  values: string[];
}

export interface ShopifyInventoryLevel {
  inventory_item_id: number;
  location_id: number;
  available: number;
  updated_at: string;
}

export interface ShopifyWebhook {
  id: number;
  address: string;
  topic: string;
  created_at: string;
  updated_at: string;
  format: string;
}
