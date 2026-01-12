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
import { useFormatPrice } from "@/lib/utils/price";
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


const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
  onView,
}) => {
  const formatPrice = useFormatPrice();
  return (
    <>
      <div className="hidden md:block rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="font-semibold">Product</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Price</TableHead>
              <TableHead className="font-semibold">Stock</TableHead>
              <TableHead className="w-[120px] font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const status = statusConfig[product.status] || statusConfig.inactive;

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
                          <Package className="h-6 w-6 text-muted-foreground" />
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
                      <span
                        className={
                          Number(product.quantity) === 0
                            ? "text-red-500 font-medium"
                            : ""
                        }
                      >
                        {product.quantity}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onEdit && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit(product)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
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

      <div className="block md:hidden space-y-3">
        {products.map((product) => {
          const status = statusConfig[product.status] || statusConfig.inactive;

          return (
            <Card key={product.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {product.images?.[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate">{product.name}</h3>
                    {product.sku && (
                      <p className="text-xs text-muted-foreground mt-0.5">SKU: {product.sku}</p>
                    )}
                  </div>
                  <Badge variant="outline" className={status.className}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor} mr-1.5`} />
                    {status.label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t">
                  <div>
                    <div className="text-muted-foreground">Price</div>
                    <div className="font-semibold mt-1">{formatPrice(product.price)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Stock</div>
                    <div className="flex items-center gap-1 mt-1">
                      {Number(product.quantity) <= 5 && Number(product.quantity) > 0 && (
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      )}
                      <span
                        className={
                          Number(product.quantity) === 0
                            ? "text-red-500 font-medium"
                            : "font-medium"
                        }
                      >
                        {product.quantity}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onEdit(product)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onView?.(product)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="px-3">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onDelete?.(product.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
};

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onView,
}) => {
  const formatPrice = useFormatPrice();
  const status = statusConfig[product.status] || statusConfig.inactive;

  return (
    <Card className="group overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200 bg-card">
      <div className="aspect-[4/3] relative bg-muted overflow-hidden">
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <Package className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}

        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
          <Badge variant="outline" className={`text-xs ${status.className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor} mr-1`} />
            {status.label}
          </Badge>
          {product.featured && (
            <Badge className="text-xs bg-primary/90 backdrop-blur-sm">
              <TrendingUp className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>

        {product.categories?.length > 0 && (
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 text-xs bg-background/90 backdrop-blur-sm"
          >
            {product.categories[0].name}
          </Badge>
        )}

        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
          {onEdit && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onEdit(product)}
              className="backdrop-blur-sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onView?.(product)}
            className="backdrop-blur-sm"
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground line-clamp-1 text-base mb-1">
            {product.name}
          </h3>
          {product.sku && (
            <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
          )}
        </div>

        {(product.shortDescription || product.description) && (
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
            {product.shortDescription || product.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          <div
            className={`text-xs font-medium flex items-center gap-1 ${
              Number(product.quantity) === 0
                ? "text-red-500"
                : Number(product.quantity) <= 5
                  ? "text-amber-500"
                  : "text-muted-foreground"
            }`}
          >
            {Number(product.quantity) <= 5 && Number(product.quantity) > 0 && (
              <AlertTriangle className="h-3 w-3" />
            )}
            <span>{Number(product.quantity) === 0 ? "Out of stock" : `${product.quantity} in stock`}</span>
          </div>
        </div>
      </CardContent>

      <div className="p-4 pt-0 flex gap-2 md:hidden border-t">
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(product)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onView?.(product)}
        >
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="px-3">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
