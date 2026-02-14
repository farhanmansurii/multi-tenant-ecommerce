"use client";

import Image from "next/image";
import { TrendingUp, Eye, ShoppingCart, DollarSign } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ProductAnalytics {
  productId: string;
  productName: string;
  views: number;
  addToCarts: number;
  purchases: number;
  revenue: number;
  conversionRate: number;
}

interface TopProductsTableProps {
  products: ProductAnalytics[];
}

export function TopProductsTable({ products }: TopProductsTableProps) {
  if (!products || products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
          <CardDescription>Your best performing products by revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No product data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top Products
        </CardTitle>
        <CardDescription>Your best performing products ranked by revenue</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Product</TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Eye className="h-3 w-3" />
                  Views
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <ShoppingCart className="h-3 w-3" />
                  Cart Adds
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Revenue
                </div>
              </TableHead>
              <TableHead className="text-center">Conversion Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product, index) => (
              <TableRow key={product.productId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full text-sm font-medium">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{product.productName}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.purchases} purchases
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center font-medium">
                  {product.views.toLocaleString()}
                </TableCell>
                <TableCell className="text-center font-medium">
                  {product.addToCarts.toLocaleString()}
                </TableCell>
                <TableCell className="text-center">
                  <div className="font-medium text-foreground">${product.revenue.toFixed(2)}</div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={
                      product.conversionRate >= 10
                        ? "default"
                        : product.conversionRate >= 5
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {product.conversionRate.toFixed(1)}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {products.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No product analytics data available for the selected period.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
