"use client";

import { useState } from "react";
import { Package, Star, ShoppingBag, Heart, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ProductData {
  id: string;
  name: string;
  description: string;
  price: string;
  images: Array<{ id: string; url: string; alt: string }>;
  status: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
}

interface ProductsSectionProps {
  products: ProductData[];
  isLoading?: boolean;
  onProductClick?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  selectedCategory?: string | null;
  className?: string;
}

type SortOption = "name" | "price-low" | "price-high" | "rating" | "newest";

export function ProductsSection({
  products,
  isLoading = false,
  onProductClick,
  onAddToCart,
  onAddToWishlist,
  selectedCategory,
  className,
}: ProductsSectionProps) {
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price-low":
          return Number(a.price) - Number(b.price);
        case "price-high":
          return Number(b.price) - Number(a.price);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "newest":
        default:
          return 0; // Keep original order for newest
      }
    });

  const formatPrice = (price: string) => {
    const numPrice = Number(price ?? 0);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number.isFinite(numPrice) ? numPrice : 0);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"
        )}
      />
    ));
  };

  if (isLoading) {
    return (
      <section id="products" className={cn("py-16", className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section id="products" className={cn("py-16", className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-dashed border-2">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-muted-foreground">
                <Package className="h-5 w-5" />
                No products found
              </CardTitle>
              <CardDescription>
                {selectedCategory
                  ? "No products available in this category yet."
                  : "This store hasn't published any products yet. Please check back later."}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className={cn("py-16", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {selectedCategory ? `Products in ${selectedCategory}` : "All Products"}
          </h2>
          <p className="text-lg text-gray-600">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {/* Search */}
          <div className="w-full sm:w-64">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Sort and View Controls */}
          <div className="flex gap-4 items-center">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Package className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        <div className={cn(
          "grid gap-6",
          viewMode === "grid"
            ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1"
        )}>
          {filteredProducts.map((product) => {
            const image = product.images?.[0];
            const formattedPrice = formatPrice(product.price);

            return (
              <Card
                key={product.id}
                className={cn(
                  "group h-full transition-all duration-300 hover:shadow-lg",
                  viewMode === "list" && "flex flex-row"
                )}
              >
                {/* Product Image */}
                <div className={cn(
                  "relative overflow-hidden bg-muted",
                  viewMode === "grid" ? "aspect-square" : "w-48 h-32 flex-shrink-0"
                )}>
                  {image ? (
                    <img
                      src={image.url}
                      alt={image.alt || product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Package className="h-8 w-8" />
                    </div>
                  )}

                  {/* Status Badge */}
                  {product.status && (
                    <Badge
                      variant={product.status === "active" ? "default" : "secondary"}
                      className="absolute top-2 left-2"
                    >
                      {product.status}
                    </Badge>
                  )}

                  {/* Quick Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0"
                      onClick={() => onAddToWishlist?.(product.id)}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0"
                      onClick={() => onProductClick?.(product.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Product Info */}
                <div className={cn(
                  "p-4 flex flex-col",
                  viewMode === "list" && "flex-1"
                )}>
                  <CardHeader className="p-0 mb-2">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-sm text-muted-foreground">
                      {product.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-0 flex-1 flex flex-col justify-between">
                    {/* Rating */}
                    {product.rating && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          {renderStars(product.rating)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({product.reviewCount || 0})
                        </span>
                      </div>
                    )}

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-lg font-semibold text-primary">
                        {formattedPrice}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => onAddToCart?.(product.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Load More Button (if needed) */}
        {filteredProducts.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Products
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
