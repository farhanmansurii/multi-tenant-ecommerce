"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Grid3X3 } from "lucide-react";
import { Category } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

interface CategoriesSectionProps {
  categories: Category[];
  onCategorySelect?: (categoryId: string) => void;
  selectedCategory?: string | null;
  maxDisplay?: number;
  className?: string;
}

export function CategoriesSection({
  categories,
  onCategorySelect,
  selectedCategory,
  maxDisplay = 6,
  className,
}: CategoriesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayCategories = isExpanded ? categories : categories.slice(0, maxDisplay);
  const hasMoreCategories = categories.length > maxDisplay;

  if (categories.length === 0) {
    return null;
  }

  return (
    <section id="categories" className={cn("py-16 bg-gray-50", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our wide range of products organized by category
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {displayCategories.map((category) => (
            <Card
              key={category.id}
              className={cn(
                "group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-0 bg-white",
                selectedCategory === category.id && "ring-2 ring-primary shadow-lg"
              )}
              onClick={() => onCategorySelect?.(category.id)}
            >
              <CardContent className="p-4 text-center">
                {/* Category Image/Icon */}
                <div className="aspect-square mb-4 relative overflow-hidden rounded-lg">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-white font-bold text-2xl group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: category.color || "#3b82f6" }}
                    >
                      {category.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <ChevronRight className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Category Name */}
                <h3 className="font-semibold text-gray-900 text-sm group-hover:text-primary transition-colors">
                  {category.name}
                </h3>

                {/* Product Count Badge (if available) */}
                {(category as any).productCount && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {(category as any).productCount} products
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        {hasMoreCategories && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-8 py-3"
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              {isExpanded ? "Show Less" : `View All ${categories.length} Categories`}
            </Button>
          </div>
        )}

        {/* Selected Category Indicator */}
        {selectedCategory && (
          <div className="mt-8 text-center">
            <Badge
              variant="default"
              className="px-4 py-2 text-lg"
            >
              Viewing: {categories.find(c => c.id === selectedCategory)?.name}
            </Badge>
          </div>
        )}
      </div>
    </section>
  );
}
