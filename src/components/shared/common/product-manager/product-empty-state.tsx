"use client";

import React from "react";
import { Package, Plus, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/shared/common/empty-state";

interface ProductEmptyStateProps {
  onCreateProduct: () => void;
}

const ProductEmptyState: React.FC<ProductEmptyStateProps> = ({ onCreateProduct }) => (
  <EmptyState
    icon={Package}
    title="No products yet"
    description="Start building your store by adding your first product. You can add details, images, pricing, and more."
    action={{
      label: "Create Your First Product",
      onClick: onCreateProduct,
      icon: Plus,
    }}
    variant="default"
  />
);

export default ProductEmptyState;
