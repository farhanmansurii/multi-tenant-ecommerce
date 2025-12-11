"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Grid3X3, List, Plus, Search, Filter, Download } from "lucide-react";
import { ProductViewMode } from "./types";
import { Separator } from "@/components/ui/separator";

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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-1">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-9 h-9 bg-background"
          />
        </div>
        <Button variant="outline" size="sm" className="h-9 px-3 lg:px-4">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <div className="flex items-center border rounded-md bg-background">
          <Button
            size="sm"
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            onClick={() => onViewModeChange("grid")}
            className="h-8 w-8 p-0 rounded-none first:rounded-l-md"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <Button
            size="sm"
            variant={viewMode === "list" ? "secondary" : "ghost"}
            onClick={() => onViewModeChange("list")}
            className="h-8 w-8 p-0 rounded-none last:rounded-r-md"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        <Button size="sm" variant="outline" className="h-9">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>

        <Button size="sm" onClick={onCreateProduct} className="h-9">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>
    </div>
  );
};

export default ProductToolbar;
