'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Package, TrendingDown, Edit } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { toast } from 'sonner';

type Product = {
  id: string;
  name: string;
  slug: string;
  images: { url: string }[];
  stockQty: number;
  lowStockThreshold: number;
};

interface AdminInventoryAlertsProps {
  storeSlug: string;
}

const LOW_STOCK_THRESHOLD = 10;

export default function AdminInventoryAlerts({ storeSlug }: AdminInventoryAlertsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(LOW_STOCK_THRESHOLD);

  useEffect(() => {
    fetchProducts();
  }, [storeSlug]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stores/${storeSlug}/products?limit=100`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Filter products with low stock
  const lowStockProducts = products.filter(
    (p) => p.stockQty <= (p.lowStockThreshold || threshold)
  );

  const outOfStockProducts = products.filter((p) => p.stockQty === 0);
  const lowStockOnlyProducts = lowStockProducts.filter((p) => p.stockQty > 0);

  const stats = {
    total: products.length,
    outOfStock: outOfStockProducts.length,
    lowStock: lowStockOnlyProducts.length,
    healthy: products.length - lowStockProducts.length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Total Products</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className={stats.outOfStock > 0 ? 'border-red-500/50' : ''}>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Out of Stock
            </CardDescription>
            <CardTitle className="text-2xl text-red-600">{stats.outOfStock}</CardTitle>
          </CardHeader>
        </Card>
        <Card className={stats.lowStock > 0 ? 'border-yellow-500/50' : ''}>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-yellow-500" />
              Low Stock
            </CardDescription>
            <CardTitle className="text-2xl text-yellow-600">{stats.lowStock}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Healthy Stock</CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats.healthy}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Threshold Setting */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alert Threshold</CardTitle>
          <CardDescription>Products below this quantity will be flagged as low stock</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-24"
              min={1}
            />
            <span className="text-sm text-muted-foreground">units</span>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Table */}
      <Card className={lowStockProducts.length > 0 ? 'border-yellow-500/50' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Inventory Alerts
          </CardTitle>
          <CardDescription>
            Products that need restocking ({lowStockProducts.length} items)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : lowStockProducts.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Package className="h-12 w-12 text-green-500" />
              <h3 className="mt-4 font-semibold text-green-600">All products are well stocked!</h3>
              <p className="text-muted-foreground">No inventory alerts at this time.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Current Stock</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockProducts
                  .sort((a, b) => a.stockQty - b.stockQty)
                  .map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-muted overflow-hidden flex-shrink-0">
                            {product.images?.[0]?.url ? (
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Package className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-bold ${product.stockQty === 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                          {product.stockQty}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {product.stockQty === 0 ? (
                          <Badge variant="destructive">Out of Stock</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">
                            Low Stock
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/stores/${storeSlug}/products/${product.slug}/edit`}>
                            <Edit className="mr-1 h-4 w-4" />
                            Update Stock
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
