"use client";

import { useState } from "react";
import { ChevronRight, Star, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Category } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  storeName: string;
  storeDescription?: string;
  categories: Category[];
  featuredProducts?: Array<{
    id: string;
    name: string;
    price: string;
    image?: string;
    rating?: number;
  }>;
  showCategories?: boolean;
  heroImage?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

export function HeroSection({
  storeName,
  storeDescription,
  categories,
  featuredProducts = [],
  showCategories = true,
  heroImage,
  heroTitle,
  heroSubtitle,
  ctaText = "Shop Now",
  ctaLink = "#products",
}: HeroSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const displayTitle = heroTitle || `Welcome to ${storeName}`;
  const displaySubtitle = heroSubtitle || storeDescription || "Discover amazing products";

  return (
    <div className="relative min-h-[600px] overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0">
        {heroImage ? (
          <img
            src={heroImage}
            alt={storeName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Hero Text */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              {displayTitle}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow">
              {displaySubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <a href={ctaLink}>
                  {ctaText}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 border-white/20 text-white hover:bg-white/20">
                Learn More
              </Button>
            </div>
          </div>

          {/* Categories Section */}
          {showCategories && categories.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-6 drop-shadow">
                Shop by Category
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories.slice(0, 6).map((category) => (
                  <Card
                    key={category.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg bg-white/10 backdrop-blur-sm border-white/20",
                      selectedCategory === category.id && "ring-2 ring-white"
                    )}
                    onClick={() => setSelectedCategory(
                      selectedCategory === category.id ? null : category.id
                    )}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="aspect-square mb-3">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div
                            className="w-full h-full rounded-lg flex items-center justify-center text-white font-bold text-2xl"
                            style={{ backgroundColor: category.color || "#3b82f6" }}
                          >
                            {category.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <h3 className="font-medium text-white text-sm drop-shadow">
                        {category.name}
                      </h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Featured Products Preview */}
          {featuredProducts.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6 drop-shadow">
                Featured Products
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredProducts.slice(0, 3).map((product) => (
                  <Card key={product.id} className="bg-white/10 backdrop-blur-sm border-white/20 overflow-hidden">
                    <div className="aspect-square">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <ShoppingBag className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-white mb-2 drop-shadow">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-white drop-shadow">
                          ${product.price}
                        </span>
                        {product.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-white text-sm drop-shadow">
                              {product.rating}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Categories Badge */}
      {selectedCategory && (
        <div className="fixed bottom-6 right-6 z-20">
          <Badge
            variant="secondary"
            className="px-4 py-2 text-lg bg-white/90 text-gray-900 shadow-lg"
          >
            Viewing: {categories.find(c => c.id === selectedCategory)?.name}
          </Badge>
        </div>
      )}
    </div>
  );
}
