import type { Category, Tag } from "@/lib/db/schema";
import { withBaseUrl } from "@/lib/utils/url";
import { parseApiResponse } from "@/lib/query/api-response";

export const fetchCategories = async (storeSlug: string): Promise<Category[]> => {
  const response = await fetch(withBaseUrl(`/api/stores/${storeSlug}/categories`));
  const result = await parseApiResponse<{ categories: Category[] }>(response, "Failed to fetch categories");
  return result.categories;
};

export const createCategory = async (
  storeSlug: string,
  data: {
    name: string;
    description?: string;
    image?: string;
    color?: string;
    sortOrder?: number;
  }
): Promise<Category> => {
  const response = await fetch(withBaseUrl(`/api/stores/${storeSlug}/categories`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await parseApiResponse<{ category: Category }>(response, "Failed to create category");
  return result.category;
};

export const fetchTags = async (storeSlug: string): Promise<Tag[]> => {
  const response = await fetch(withBaseUrl(`/api/stores/${storeSlug}/tags`));

  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }
    await parseApiResponse<never>(response, "Failed to fetch tags");
  }

  const result = await parseApiResponse<{ tags: Tag[] }>(response, "Failed to fetch tags");
  return result.tags;
};

export const createTag = async (
  storeSlug: string,
  data: {
    name: string;
    color?: string;
  }
): Promise<Tag> => {
  const response = await fetch(withBaseUrl(`/api/stores/${storeSlug}/tags`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await parseApiResponse<{ tag: Tag }>(response, "Failed to create tag");
  return result.tag;
};

export const updateCategory = async (
  storeSlug: string,
  categoryId: string,
  data: {
    name: string;
    description?: string;
    image?: string;
    color?: string;
    sortOrder?: number;
  }
): Promise<Category> => {
  const response = await fetch(withBaseUrl(`/api/stores/${storeSlug}/categories`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: categoryId, ...data }),
  });
  const result = await parseApiResponse<{ category: Category }>(response, "Failed to update category");
  return result.category;
};

export const deleteCategory = async (
  storeSlug: string,
  categoryId: string
): Promise<void> => {
  const response = await fetch(withBaseUrl(`/api/stores/${storeSlug}/categories?id=${categoryId}`), {
    method: "DELETE",
  });

  if (!response.ok) {
    await parseApiResponse<never>(response, "Failed to delete category");
  }
};
