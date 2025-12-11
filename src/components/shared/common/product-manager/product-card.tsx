/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  Edit,
  Eye,
  MoreHorizontal,
  Package,
  Trash2,
  TrendingUp,
  AlertTriangle,
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

const statusConfig: Record<string, { label: string; className: string; dotColor: string }> = {
  active: { label: "Active", className: "bg-emerald-500/10 text-emerald-600 border-emerald-200", dotColor: "bg-emerald-500" },
  draft: { label: "Draft", className: "bg-amber-500/10 text-amber-600 border-amber-200", dotColor: "bg-amber-500" },
  inactive: { label: "Inactive", className: "bg-slate-500/10 text-slate-600 border-slate-200", dotColor: "bg-slate-400" },
  out_of_stock: { label: "Out of Stock", className: "bg-red-500/10 text-red-600 border-red-200", dotColor: "bg-red-500" },
};

const typeIcons: Record<string, string> = {
  digital: "💾",
  service: "🔧",
  physical: "📦",
};

const formatPrice = (price: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(parseFloat(price || "0"));

// ProductTable component for list view
const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
  onView,
}) => {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="font-semibold">Product</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Price</TableHead>
            <TableHead className="font-semibold">Stock</TableHead>
            <TableHead className="w-[100px] font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const status = statusConfig[product.status] || statusConfig.inactive;
            const typeIcon = typeIcons[product.type] || "📦";

            return (
              <TableRow key={product.id} className="group">
                <TableCell>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {product.images?.[0]?.url ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">{typeIcon}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{product.name}</p>
                      {product.sku && (
                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={status.className}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor} mr-1.5`} />
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-semibold">{formatPrice(product.price)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {Number(product.quantity) <= 5 && Number(product.quantity) > 0 && (
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    )}
                    <span className={Number(product.quantity) === 0 ? "text-red-500 font-medium" : ""}>
                      {product.quantity}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                      <Button size="sm" variant="ghost" onClick={() => onEdit(product)}>
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
                          <Eye className="h-4 w-4 mr-2" /> View
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete?.(product.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
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
    </div>
  );
};

// ProductCard component for grid view - Premium design
const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onView,
}) => {
  const status = statusConfig[product.status] || statusConfig.inactive;
  const typeIcon = typeIcons[product.type] || "📦";

  return (
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card via-card to-muted/10">
      {/* Image */}
      <div className="aspect-[4/3] relative bg-muted overflow-hidden">
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <Package className="h-16 w-16 text-muted-foreground/40" />
          </div>
        )}

        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="outline" className={`backdrop-blur-md ${status.className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor} mr-1.5`} />
            {status.label}
          </Badge>
          {product.categories?.length > 0 && (
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-md shadow-sm border-border/20">
              {product.categories[0].name}
            </Badge>
          )}
        </div>

        {product.featured && (
          <Badge className="absolute top-3 right-3 bg-primary/90 backdrop-blur-md">
            <TrendingUp className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        )}

        {/* Quick actions overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          {onEdit && (
            <Button size="sm" variant="secondary" onClick={() => onEdit(product)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={() => onView?.(product)}>
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground line-clamp-1 text-base">{product.name}</h3>
            {product.sku && (
              <p className="text-xs text-muted-foreground mt-0.5">SKU: {product.sku}</p>
            )}
          </div>
          <span className="text-xl shrink-0">{typeIcon}</span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[2.5rem]">
          {product.shortDescription || product.description || "No description"}
        </p>

        {/* Price and stock */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-foreground">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          <div className={`text-sm font-medium flex items-center gap-1 ${Number(product.quantity) === 0 ? "text-red-500" : Number(product.quantity) <= 5 ? "text-amber-500" : "text-muted-foreground"}`}>
            {Number(product.quantity) <= 5 && Number(product.quantity) > 0 && (
              <AlertTriangle className="h-3.5 w-3.5" />
            )}
            {Number(product.quantity) === 0 ? "Out of stock" : `${product.quantity} in stock`}
          </div>
        </div>


      </CardContent>

      {/* Footer actions - visible on mobile, hidden on desktop hover */}
      <div className="p-4 pt-0 flex gap-2 md:hidden">
        {onEdit && (
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(product)}>
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView?.(product)}>
              <Eye className="h-4 w-4 mr-2" /> View
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete?.(product.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};

export default ProductCard;
export { ProductTable };
