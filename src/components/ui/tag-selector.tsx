"use client";

import { GeneralSelector } from "@/components/ui/general-selector";
import { createTag, fetchTags } from "@/lib/domains/products/category-service";



interface TagSelectorProps {
  value: string[];
  onChange: (tagIds: string[]) => void;
  storeSlug: string;
  disabled?: boolean;
  placeholder?: string;
}

export function TagSelector({
  value = [],
  onChange,
  storeSlug,
  disabled = false,
  placeholder = "Select tags...",
}: TagSelectorProps) {
  return (
    <GeneralSelector
      value={value}
      onChange={onChange}
      storeSlug={storeSlug}
      disabled={disabled}
      placeholder={placeholder}
      label="Tags"
      type="tags"
      fetchItems={fetchTags}
      createItem={createTag}
      queryKey="tags"
      showImage={false}
      showDescription={false}
      showColor={true}
      showSortOrder={false}
    />
  );
}
