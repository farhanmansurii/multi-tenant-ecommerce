"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Grid3X3, List, Plus, Search, Filter } from "lucide-react";
import { ProductViewMode } from "./types";
import { Separator } from "@/components/ui/separator";

interface ProductToolbarProps {
  productCount: number;
  viewMode: ProductViewMode;
  searchQuery: string;
  statusFilter: string;
  onViewModeChange: (viewMode: ProductViewMode) => void;
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (filter: string) => void;
  onCreateProduct: () => void;
}

const ProductToolbar: React.FC<ProductToolbarProps> = ({
  productCount,
  viewMode,
  searchQuery,
  statusFilter,
  onViewModeChange,
  onSearchChange,
  onStatusFilterChange,
  onCreateProduct,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products by name, SKU..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10 w-full"
          />
        </div>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px] h-10">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center border rounded-md bg-background w-fit">
          <Button
            size="sm"
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            onClick={() => onViewModeChange("grid")}
            className="h-9 px-3 rounded-none first:rounded-l-md"
            aria-label="Grid view"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <Button
            size="sm"
            variant={viewMode === "list" ? "secondary" : "ghost"}
            onClick={() => onViewModeChange("list")}
            className="h-9 px-3 rounded-none last:rounded-r-md"
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        <Button
          size="sm"
          onClick={onCreateProduct}
          className="w-full sm:w-auto h-10"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>
    </div>
  );
};

export default ProductToolbar;
