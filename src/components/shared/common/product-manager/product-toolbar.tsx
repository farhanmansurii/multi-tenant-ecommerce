"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Grid3X3, List, Plus } from "lucide-react";
import { ProductViewMode } from "./types";

interface ProductToolbarProps {
  productCount: number;
  viewMode: ProductViewMode;
  onViewModeChange: (viewMode: ProductViewMode) => void;
  onCreateProduct: () => void;
}

const ProductToolbar: React.FC<ProductToolbarProps> = ({
  productCount,
  viewMode,
  onViewModeChange,
  onCreateProduct,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Products</h3>
        <p className="text-sm text-muted-foreground">
          Manage your store&apos;s products ({productCount} total)
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center border rounded-lg p-1">
          <Button
            size="sm"
            variant={viewMode === "grid" ? "default" : "ghost"}
            onClick={() => onViewModeChange("grid")}
            className="h-8 w-8 p-0"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === "list" ? "default" : "ghost"}
            onClick={() => onViewModeChange("list")}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={onCreateProduct}>
          <Plus className="h-4 w-4 mr-2" />
          Create Product
        </Button>
      </div>
    </div>
  );
};

export default ProductToolbar;
