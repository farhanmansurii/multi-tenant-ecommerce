import { createId } from "@paralleldrive/cuid2";
import type { CreateProductData } from "./helpers";
import type { ProductFilters } from "./helpers";
import {
  DrizzleProductRepository,
  type ProductRecord,
} from "@/lib/repositories/products";
import {
  DrizzleVariantRepository,
  type VariantInsertInput,
} from "@/lib/repositories/variants";

export interface CreateProductWithVariantsInput extends CreateProductData {
  variants?: VariantInsertInput[];
}

export interface ProductsServiceDeps {
  productRepository?: DrizzleProductRepository;
  variantRepository?: DrizzleVariantRepository;
}

export class ProductsService {
  constructor(private readonly deps: ProductsServiceDeps = {}) {}

  private get productRepository() {
    return this.deps.productRepository ?? new DrizzleProductRepository();
  }

  private get variantRepository() {
    return this.deps.variantRepository ?? new DrizzleVariantRepository();
  }

  async createProduct(storeId: string, data: CreateProductData): Promise<ProductRecord> {
    const id = crypto.randomUUID();
    await this.productRepository.insert({
      id,
      storeId,
      ...data,
      type: data.type || "physical",
      status: data.status || "draft",
      trackQuantity: data.trackQuantity ?? true,
      quantity: data.quantity || "0",
      allowBackorder: data.allowBackorder ?? false,
      images: data.images || [],
      categories: data.categories || [],
      tags: data.tags || [],
      featured: data.featured ?? false,
      requiresShipping: data.requiresShipping ?? true,
      taxable: data.taxable ?? true,
    });

    const created = await this.productRepository.findById(storeId, id);
    if (!created) {
      throw new Error("Failed to create product");
    }

    return created;
  }

  async createProductWithVariants(
    storeId: string,
    data: CreateProductWithVariantsInput,
  ): Promise<ProductRecord> {
    const product = await this.createProduct(storeId, data);
    if (data.variants && data.variants.length > 0) {
      await this.variantRepository.bulkInsert(
        data.variants.map((variant) => ({
          ...variant,
          id: variant.id || createId(),
          storeId,
          productId: product.id,
        })),
      );
    }
    return product;
  }

  async listForStore(storeId: string): Promise<ProductRecord[]> {
    return this.productRepository.listForStore(storeId);
  }

  async getBySlug(storeId: string, slug: string): Promise<ProductRecord | null> {
    return this.productRepository.findBySlug(storeId, slug);
  }

  async updateProduct(id: string, data: Partial<CreateProductData>): Promise<ProductRecord> {
    const { storeId: _storeId, slug: _slug, ...updateData } = data as Partial<CreateProductData> & {
      storeId?: string;
      slug?: string;
    };

    const updatedProduct = await this.productRepository.updateById(id, updateData);

    if (!updatedProduct) {
      throw new Error("Product not found or update failed");
    }

    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.productRepository.deleteById(id);
  }

  async countForStore(storeId: string, _filters: ProductFilters = {}): Promise<number> {
    const rows = await this.productRepository.listForStore(storeId);
    return rows.length;
  }
}

export const productsService = new ProductsService();
