"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X, ChevronDown, Check, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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
  priceRange: [number, number];
  inStockOnly: boolean;
}

interface StorefrontFiltersProps {
  categories: Category[];
  value: StorefrontFiltersState;
  onChange: (next: StorefrontFiltersState) => void;
  minPrice?: number;
  maxPrice?: number;
}
const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 100000;

export function StorefrontFilters({
  categories,
  value,
  onChange,
  minPrice = DEFAULT_MIN_PRICE,
  maxPrice = DEFAULT_MAX_PRICE,
}: StorefrontFiltersProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Local state for the slider to prevent layout thrashing while dragging
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(value.priceRange ?? [minPrice, maxPrice]);

  useEffect(() => {
    setLocalPriceRange(value.priceRange ?? [minPrice, maxPrice]);
  }, [value.priceRange, minPrice, maxPrice]);

  const categoryLookup = useMemo(() => {
    return categories.reduce<Record<string, string>>((acc, c) => {
      // Index by both ID and slug so lookups work with either
      acc[c.id] = c.name;
      if (c.slug) {
        acc[c.slug] = c.name;
      }
      return acc;
    }, {});
  }, [categories]);

  const handleCategoryToggle = (categoryId: string) => {
    // Find the actual category to ensure we use its ID
    const category = categories.find(c => c.id === categoryId || c.slug === categoryId);
    const id = category?.id || categoryId;
    const exists = value.categories.includes(id);
    const next = exists
      ? value.categories.filter((x) => x !== id)
      : [...value.categories, id];
    onChange({ ...value, categories: next });
  };

  const handleClearAll = () => {
    onChange({
      search: "",
      sort: "relevance",
      categories: [],
      priceRange: [minPrice, maxPrice],
      inStockOnly: false,
    });
    // setLocalPriceRange is handled by useEffect
    setIsSheetOpen(false);
  };

  const hasActiveFilters = useMemo(() => {
    const priceRange = value.priceRange ?? [minPrice, maxPrice];
    return (
      value.categories.length > 0 ||
      value.inStockOnly ||
      priceRange[0] > minPrice ||
      priceRange[1] < maxPrice
    );
  }, [value, minPrice, maxPrice]);

  const activeCount = useMemo(() => {
    const priceRange = value.priceRange ?? [minPrice, maxPrice];
    let count = value.categories.length;
    if (value.inStockOnly) count++;
    if (priceRange[0] > minPrice || priceRange[1] < maxPrice) count++;
    return count;
  }, [value, minPrice, maxPrice]);

  // Handle Slider Commit (when user lets go of the handle)
  const handlePriceCommit = (val: number[]) => {
    onChange({ ...value, priceRange: [val[0], val[1]] });
  };

  return (
    <div className="w-full space-y-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 py-4">

      {/* --- Top Bar: Search, Sort, Filter Trigger --- */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={value.search}
            onChange={(e) => onChange({ ...value, search: e.target.value })}
            className="pl-9 h-10 bg-muted/30 border-muted-foreground/20 focus-visible:ring-offset-0"
          />
          {value.search && (
            <button
              onClick={() => onChange({ ...value, search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
          <Select value={value.sort} onValueChange={(v: SortKey) => onChange({ ...value, sort: v })}>
            <SelectTrigger className="w-[160px] h-10 border-muted-foreground/20">
              <ArrowUpDown className="w-3 h-3 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest Arrivals</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter Sheet Trigger */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-10 border-muted-foreground/20 relative">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {activeCount > 0 && (
                  <Badge variant="default" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                    {activeCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col h-full overflow-hidden p-4">
              <SheetHeader className="px-1">
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Refine your search results.
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto py-6 px-1">
                <div className="space-y-8">

                  {/* Categories Group */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-foreground/70 uppercase tracking-wider">Categories</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((c) => {
                        const id = c.id; // Always use category ID for consistency
                        const isSelected = value.categories.includes(id);
                        return (
                          <div
                            key={id}
                            onClick={() => handleCategoryToggle(id)}
                            className={cn(
                              "cursor-pointer flex items-center justify-between px-3 py-2.5 rounded-md border text-sm transition-all",
                              isSelected
                                ? "border-primary bg-primary/5 text-primary font-medium"
                                : "border-transparent bg-muted/40 hover:bg-muted/60 text-foreground"
                            )}
                          >
                            <span>{c.name}</span>
                            {isSelected && <Check className="h-3.5 w-3.5" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Separator />

                  {/* Price Range Slider */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-foreground/70 uppercase tracking-wider">Price Range</h3>
                      <span className="text-sm font-medium tabular-nums">
                        ₹{localPriceRange[0]} - ₹{localPriceRange[1]}
                      </span>
                    </div>

                    <div className="px-1">
                      <Slider
                        min={minPrice}
                        max={maxPrice}
                        step={10}
                        value={localPriceRange}
                        onValueChange={(val) => setLocalPriceRange(val as [number, number])}
                        onValueCommit={handlePriceCommit}
                        className="my-6"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">Min Price</Label>
                        <Input
                          type="number"
                          value={localPriceRange[0]}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setLocalPriceRange([val, localPriceRange[1]]);
                          }}
                          onBlur={() => handlePriceCommit(localPriceRange)}
                          className="h-9"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">Max Price</Label>
                        <Input
                          type="number"
                          value={localPriceRange[1]}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setLocalPriceRange([localPriceRange[0], val]);
                          }}
                          onBlur={() => handlePriceCommit(localPriceRange)}
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Availability */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-foreground/70 uppercase tracking-wider">Availability</h3>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="in-stock"
                        checked={value.inStockOnly}
                        onCheckedChange={(c) => onChange({ ...value, inStockOnly: !!c })}
                        className="h-5 w-5"
                      />
                      <Label
                        htmlFor="in-stock"
                        className="text-sm font-normal cursor-pointer select-none"
                      >
                        Only show items currently in stock
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <SheetFooter className="border-t pt-4 px-1">
                <Button variant="outline" onClick={handleClearAll} className="w-full sm:w-auto">
                  Reset
                </Button>
                <Button onClick={() => setIsSheetOpen(false)} className="w-full sm:w-auto">
                  Show Results
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* --- Quick Categories Row (Horizontal Scroll) --- */}
      <ScrollArea className="w-full whitespace-nowrap pb-2">
        <div className="flex w-max space-x-2 p-1">
          <Badge
            variant={value.categories.length === 0 ? "default" : "outline"}
            className={cn(
              "cursor-pointer px-4 py-1.5 rounded-full text-sm font-normal transition-all",
              value.categories.length === 0 ? "hover:bg-primary/90" : "hover:bg-muted border-muted-foreground/20"
            )}
            onClick={() => onChange({ ...value, categories: [] })}
          >
            All Products
          </Badge>
          {categories.map((c) => {
            const id = c.id; // Always use category ID for consistency
            const isActive = value.categories.includes(id);
            return (
              <Badge
                key={id}
                variant={isActive ? "default" : "outline"}
                className={cn(
                  "cursor-pointer px-4 py-1.5 rounded-full text-sm font-normal transition-all",
                  isActive
                    ? "hover:bg-primary/90"
                    : "hover:bg-muted border-muted-foreground/20"
                )}
                onClick={() => handleCategoryToggle(id)}
              >
                {c.name}
              </Badge>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="invisible sm:visible" />
      </ScrollArea>

      {/* --- Active Filter Badges (Removable) --- */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center pt-2">
          {value.categories.map((id) => (
            <Badge key={id} variant="secondary" className="px-2 py-1 gap-1 hover:bg-muted">
              {categoryLookup[id]}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleCategoryToggle(id)} />
            </Badge>
          ))}

          {value.priceRange && (value.priceRange[0] > minPrice || value.priceRange[1] < maxPrice) && (
            <Badge variant="secondary" className="px-2 py-1 gap-1 hover:bg-muted">
              Price: ₹{value.priceRange[0]} - ₹{value.priceRange[1]}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onChange({ ...value, priceRange: [minPrice, maxPrice] })} />
            </Badge>
          )}

          {value.inStockOnly && (
            <Badge variant="secondary" className="px-2 py-1 gap-1 hover:bg-muted">
              In Stock
              <X className="h-3 w-3 cursor-pointer" onClick={() => onChange({ ...value, inStockOnly: false })} />
            </Badge>
          )}

          <Button
            variant="link"
            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            onClick={handleClearAll}
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}
