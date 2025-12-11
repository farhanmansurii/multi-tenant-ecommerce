'use client';

import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { StorefrontFilters, StorefrontFiltersState } from './filters/storefront-filters';
import { Category } from '@/lib/db/schema';
import { useState } from 'react';
import StoreFrontContainer from '../layout/container';

interface StorefrontControlsProps {
  productCount: number;
  hasActiveFilters: boolean;
  filters: StorefrontFiltersState;
  categories: Category[];
  onUpdateFilters: (filters: StorefrontFiltersState) => void;
}

export default function StorefrontControls({
  productCount,
  hasActiveFilters,
  filters,
  categories,
  onUpdateFilters,
}: StorefrontControlsProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="sticky top-16 z-30 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <StoreFrontContainer className="py-0">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Count */}
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Index ({productCount})
            </span>
            {hasActiveFilters && (
              <Button
                variant="link"
                className="text-[10px] font-mono uppercase text-red-500 h-auto p-0"
                onClick={() =>
                  onUpdateFilters({
                    search: '',
                    sort: 'relevance',
                    categories: [],
                    priceRange: [0, 100000],
                    inStockOnly: false,
                  })
                }
              >
                [ Reset ]
              </Button>
            )}
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Sort Dropdown (Minimal) */}
            <div className="hidden md:block w-[180px]">
              <Select
                value={filters.sort}
                onValueChange={(val) =>
                  onUpdateFilters({ ...filters, sort: val as any })
                }
              >
                <SelectTrigger className="h-9 border-transparent hover:border-border rounded-none text-xs font-mono uppercase focus:ring-0">
                  <SelectValue placeholder="SORT ORDER" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator orientation="vertical" className="h-6 hidden md:block" />

            {/* Filter Trigger */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-none h-9 gap-2 text-xs font-mono uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                >
                  <Filter className="w-3 h-3" />
                  Filter
                  {hasActiveFilters && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:w-[400px] border-l border-border p-0">
                <div className="h-full flex flex-col">
                  <div className="p-6 border-b border-border">
                    <SheetHeader>
                      <SheetTitle className="text-xl font-black uppercase tracking-tighter">
                        Refine Selection
                      </SheetTitle>
                    </SheetHeader>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    <StorefrontFilters
                      categories={categories}
                      value={filters}
                      onChange={onUpdateFilters}
                    />
                  </div>

                  <div className="p-6 border-t border-border bg-muted/5">
                    <Button
                      className="w-full rounded-none h-12 uppercase font-bold tracking-widest"
                      onClick={() => setIsFilterOpen(false)}
                    >
                      View Results ({productCount})
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </StoreFrontContainer>
    </div>
  );
}
