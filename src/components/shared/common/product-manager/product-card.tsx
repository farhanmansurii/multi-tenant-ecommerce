"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductData, ProductViewMode } from "./types";
import {
  DollarSign,
  Edit,
  Eye,
  Hash,
  MoreHorizontal,
  Package,
  Package2,
  Trash2,
} from "lucide-react";

interface ProductCardProps {
  product: ProductData;
  onEdit?: (product: ProductData) => void;
  onDelete?: (productId: string) => void;
  onView?: (product: ProductData) => void;
  viewMode: ProductViewMode;
}

interface ProductTableProps {
  products: ProductData[];
  onEdit?: (product: ProductData) => void;
  onDelete?: (productId: string) => void;
  onView?: (product: ProductData) => void;
}

const statusVariantMap: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  active: "default",
  draft: "secondary",
  inactive: "outline",
  out_of_stock: "destructive",
};

const typeEmojiMap: Record<string, string> = {
  digital: "💾",
  service: "🔧",
  physical: "📦",
};

const formatPrice = (price: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(parseFloat(price || "0"));

// New ProductTable component for list view
const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
  onView,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => {
          const statusVariant = statusVariantMap[product.status] ?? "outline";
          const typeEmoji = typeEmojiMap[product.type] ?? "📦";

          return (
            <TableRow key={product.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{typeEmoji}</span>
                  <div>
                    <h3 className="font-medium text-foreground">
                      {product.name}
                    </h3>
                    {product.sku && (
                      <p className="text-xs text-muted-foreground">
                        SKU: {product.sku}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant}>
                  {product.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="font-medium">
                  {formatPrice(product.price)}
                </span>
              </TableCell>
              <TableCell>
                <span>{product.quantity}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView?.(product)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete?.(product.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

// Updated ProductCard component (now only handles grid view)
const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onView,
  viewMode,
}) => {
  console.log("(log) ~ ProductCard ~ product:", product);
  const statusVariant = statusVariantMap[product.status] ?? "outline";
  const typeEmoji = typeEmojiMap[product.type] ?? "📦";

  // Only render grid view now
  return (
    <Card className="hover:shadow-md transition-shadow group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{typeEmoji}</span>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg line-clamp-1 text-foreground">
                {product.name}
              </CardTitle>
              {product.sku && (
                <p className="text-xs text-muted-foreground">
                  SKU: {product.sku}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {product.featured && (
              <Badge variant="secondary" className="text-xs">
                Featured
              </Badge>
            )}
            <Badge variant={statusVariant}>
              {product.status.replace("_", " ")}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center overflow-hidden">
          {product.images.length > 0 ? (
            <img
              src={product.images[0].url}
              alt={product.images[0].alt}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}
          <Package className="h-12 w-12 text-muted-foreground" />
        </div>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {product.shortDescription || product.description}
        </p>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Hash className="h-4 w-4" />
            <span>Stock: {product.quantity}</span>
          </div>
          {product.categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.categories.slice(0, 2).map((category, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
              {product.categories.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{product.categories.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {onEdit && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onEdit(product)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => onView?.(product)}>
            <Eye className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onDelete?.(product.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
export { ProductTable };
