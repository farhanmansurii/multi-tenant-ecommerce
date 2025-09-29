"use client";

import { GeneralSelector } from "@/components/ui/general-selector";
import { createCategory, fetchCategories } from "@/lib/domains/products/category-service";


interface CategorySelectorProps {
  value: string[];
  onChange: (categoryIds: string[]) => void;
  storeSlug: string;
  disabled?: boolean;
  placeholder?: string;
}

export function CategorySelector({
  value = [],
  onChange,
  storeSlug,
  disabled = false,
  placeholder = "Select categories...",
}: CategorySelectorProps) {
  return (
    <GeneralSelector
      value={value}
      onChange={onChange}
      storeSlug={storeSlug}
      disabled={disabled}
      placeholder={placeholder}
      label="Categories"
      type="categories"
      fetchItems={fetchCategories}
      createItem={createCategory}
      queryKey="categories"
      showImage={true}
      showDescription={true}
      showColor={true}
      showSortOrder={true}
    />
  );
}
