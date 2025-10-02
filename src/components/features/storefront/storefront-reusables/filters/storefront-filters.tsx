"use client";
import React, { useCallback, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Mock types for demo
type Category = {
  id: string;
  name: string;
  slug?: string;
};

type SortKey = "relevance" | "price_asc" | "price_desc" | "newest";

export interface StorefrontFiltersState {
  search: string;
  sort: SortKey;
  categories: string[];
  priceMin?: number;
  priceMax?: number;
  inStockOnly: boolean;
}

interface StorefrontFiltersProps {
  categories: Category[];
  value: StorefrontFiltersState;
  onChange: (next: StorefrontFiltersState) => void;
}

export function StorefrontFilters({ categories, value, onChange }: StorefrontFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showCategories, setShowCategories] = useState(true);

  const categoryLookup = useMemo(() => {
    return categories.reduce<Record<string, string>>((acc, c) => {
      acc[c.id] = c.name;
      if (c.slug) acc[c.slug] = c.name;
      return acc;
    }, {});
  }, [categories]);

  const toggleCategory = useCallback((id: string) => {
    const exists = value.categories.includes(id);
    const next = exists
      ? value.categories.filter((x) => x !== id)
      : [...value.categories, id];
    onChange({ ...value, categories: next });
  }, [value, onChange]);

  const clearAll = () => {
    onChange({
      search: "",
      sort: "relevance",
      categories: [],
      priceMin: 0,
      priceMax: 100000,
      inStockOnly: false,
    });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (value.categories.length > 0) count++;
    if ((value.priceMin ?? 0) > 0 || (value.priceMax ?? 100000) < 100000) count++;
    if (value.inStockOnly) count++;
    return count;
  }, [value.categories, value.priceMin, value.priceMax, value.inStockOnly]);

  return (
    <div className="w-full space-y-4">
      {/* Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            value={value.search}
            onChange={(e) => onChange({ ...value, search: e.target.value })}
            className="pl-10 pr-10"
          />
          {value.search && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onChange({ ...value, search: "" })}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Sort Dropdown */}
        <Select value={value.sort} onValueChange={(v: SortKey) => onChange({ ...value, sort: v })}>
          <SelectTrigger className="sm:w-64">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter Toggle Button */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="sm:w-auto"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="default" className="ml-2 rounded-full px-2 py-0">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Active Filters Pills */}
      {(value.categories.length > 0 || value.inStockOnly || activeFilterCount > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground font-medium">Active filters:</span>
          {value.categories.map((id) => (
            <Badge
              key={id}
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => toggleCategory(id)}
            >
              {categoryLookup[id]}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {value.inStockOnly && (
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => onChange({ ...value, inStockOnly: false })}
            >
              In Stock
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          {((value.priceMin ?? 0) > 0 || (value.priceMax ?? 100000) < 100000) && (
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => onChange({ ...value, priceMin: 0, priceMax: 100000 })}
            >
              ₹{value.priceMin ?? 0} - ₹{value.priceMax ?? 100000}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          <Button
            variant="link"
            onClick={clearAll}
            className="h-auto p-0 text-sm underline"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Expandable Filters Panel */}
      {showFilters && (
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Categories Section */}
            <Collapsible open={showCategories} onOpenChange={setShowCategories}>
              <div className="space-y-3">
                <CollapsibleTrigger className="flex items-center justify-between w-full group">
                  <h3 className="text-sm font-semibold uppercase tracking-wide">
                    Categories
                  </h3>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      showCategories ? "rotate-180" : ""
                    }`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {categories.map((c) => {
                      const id = c.slug || c.id;
                      const active = value.categories.includes(id);
                      return (
                        <Button
                          key={id}
                          variant={active ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleCategory(id)}
                          className="justify-center"
                        >
                          {categoryLookup[id] || c.name}
                        </Button>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            <Separator />

            {/* Price Range Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide">
                Price Range
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="price-min" className="text-xs text-muted-foreground">
                    Min
                  </Label>
                  <Input
                    id="price-min"
                    type="number"
                    value={value.priceMin ?? 0}
                    onChange={(e) => onChange({ ...value, priceMin: Number(e.target.value) })}
                    placeholder="₹0"
                  />
                </div>
                <span className="text-muted-foreground mt-7">—</span>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="price-max" className="text-xs text-muted-foreground">
                    Max
                  </Label>
                  <Input
                    id="price-max"
                    type="number"
                    value={value.priceMax ?? 100000}
                    onChange={(e) => onChange({ ...value, priceMax: Number(e.target.value) })}
                    placeholder="₹100000"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Stock Status */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide">
                Availability
              </h3>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in-stock"
                  checked={value.inStockOnly}
                  onCheckedChange={(checked) => onChange({ ...value, inStockOnly: Boolean(checked) })}
                />
                <Label
                  htmlFor="in-stock"
                  className="text-sm font-normal cursor-pointer"
                >
                  Show in-stock items only
                </Label>
              </div>
            </div>
          </CardContent>

          {/* Filter Actions */}
          <CardFooter className="bg-muted/50 border-t flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={clearAll}
            >
              Clear all filters
            </Button>
            <Button
              onClick={() => setShowFilters(false)}
            >
              Apply Filters
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

