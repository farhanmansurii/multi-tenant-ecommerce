import { Category, Tag } from "@/lib/db/schema";

export const fetchCategories = async (storeSlug: string): Promise<Category[]> => {
  const response = await fetch(`/api/stores/${storeSlug}/categories`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || "Failed to fetch categories");
  }

  const result = await response.json();
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
  const response = await fetch(`/api/stores/${storeSlug}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || "Failed to create category");
  }

  const result = await response.json();
  return result.category;
};

export const fetchTags = async (storeSlug: string): Promise<Tag[]> => {
  const response = await fetch(`/api/stores/${storeSlug}/tags`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || "Failed to fetch tags");
  }

  const result = await response.json();
  return result.tags;
};

export const createTag = async (
  storeSlug: string,
  data: {
    name: string;
    color?: string;
  }
): Promise<Tag> => {
  const response = await fetch(`/api/stores/${storeSlug}/tags`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || "Failed to create tag");
  }

  const result = await response.json();
  return result.tag;
};
