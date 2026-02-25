"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  Package,
  Search,
  Filter,
  ChevronDown,
  Eye,
  CheckCircle,
  CheckCircle2,
  Truck,
  XCircle,
  Clock,
  ShoppingCart,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/shared/common/metric-card";
import { EmptyState } from "@/components/shared/common/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { formatPrice } from "@/lib/utils/price";
import { useOrders } from "@/hooks/queries/use-orders";
import { useUpdateOrderStatus } from "@/hooks/mutations/use-order-mutations";
import { QueryListSkeleton } from "@/lib/ui/query-skeleton";

interface AdminOrdersListProps {
  storeSlug: string;
  currency?: string;
}

const statusVariant: Record<string, "secondary" | "info" | "success" | "warning" | "destructive"> = {
  pending: "warning",
  confirmed: "info",
  processing: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "destructive",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  confirmed: <CheckCircle className="h-3 w-3" />,
  processing: <Package className="h-3 w-3" />,
  shipped: <Truck className="h-3 w-3" />,
  delivered: <CheckCircle className="h-3 w-3" />,
  cancelled: <XCircle className="h-3 w-3" />,
};

export default function AdminOrdersList({ storeSlug, currency = "INR" }: AdminOrdersListProps) {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading: loading } = useOrders(storeSlug, {
    status: statusFilter !== "all" ? statusFilter : undefined,
    limit: 50,
  });

  const orders = data?.orders || [];
  const updateOrderStatusMutation = useUpdateOrderStatus(storeSlug);

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    updateOrderStatusMutation.mutate({ orderId, status: newStatus as any });
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    return order.orderNumber.toString().includes(searchQuery);
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => ["confirmed", "processing"].includes(o.status)).length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Orders" value={stats.total} icon={ShoppingCart} color="blue" />
        <MetricCard label="Pending" value={stats.pending} icon={Clock} color="yellow" />
        <MetricCard label="Processing" value={stats.processing} icon={Loader2} color="purple" />
        <MetricCard label="Delivered" value={stats.delivered} icon={CheckCircle2} color="emerald" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by order #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          onClick={() => queryClient.refetchQueries({ queryKey: ["orders", storeSlug] })}
          disabled={updateOrderStatusMutation.isPending}
        >
          Refresh
        </Button>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Manage and track all orders for your store</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <QueryListSkeleton count={5} />
          ) : filteredOrders.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No orders yet"
              description={
                searchQuery || statusFilter !== "all"
                  ? "No orders match your current filters. Try adjusting your search or filter criteria."
                  : "When customers place orders, they'll appear here."
              }
              variant={searchQuery || statusFilter !== "all" ? "search" : "default"}
              secondaryAction={
                searchQuery || statusFilter !== "all"
                  ? {
                      label: "Clear filters",
                      onClick: () => {
                        setSearchQuery("");
                        setStatusFilter("all");
                      },
                    }
                  : undefined
              }
            />
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-3">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-lg">#{order.orderNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge
                          variant={statusVariant[order.status] || "secondary"}
                          className="capitalize"
                        >
                          <span className="mr-1">{statusIcons[order.status]}</span>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-muted-foreground">Items</div>
                          <div className="font-medium">{order.itemCount} items</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Total</div>
                          <div className="font-medium">
                            {formatPrice(order.totalAmount, currency)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Payment</div>
                          <Badge variant="outline" className="border-border/60 text-foreground">
                            {order.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2 border-t">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link href={`/dashboard/stores/${storeSlug}/orders/${order.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              disabled={updateOrderStatusMutation.isPending}
                            >
                              Update
                              <ChevronDown className="ml-1 h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => updateOrderStatus(order.id, "confirmed")}
                              disabled={updateOrderStatusMutation.isPending}
                            >
                              Mark as Confirmed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateOrderStatus(order.id, "processing")}
                              disabled={updateOrderStatusMutation.isPending}
                            >
                              Mark as Processing
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateOrderStatus(order.id, "shipped")}
                              disabled={updateOrderStatusMutation.isPending}
                            >
                              Mark as Shipped
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateOrderStatus(order.id, "delivered")}
                              disabled={updateOrderStatusMutation.isPending}
                            >
                              Mark as Delivered
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateOrderStatus(order.id, "cancelled")}
                              variant="destructive"
                              disabled={updateOrderStatusMutation.isPending}
                            >
                              Cancel Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{order.itemCount} items</TableCell>
                        <TableCell className="font-medium">
                          {formatPrice(order.totalAmount, currency)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-border/60 text-foreground">
                            {order.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={statusVariant[order.status] || "secondary"}
                            className="capitalize"
                          >
                            <span className="mr-1">{statusIcons[order.status]}</span>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/dashboard/stores/${storeSlug}/orders/${order.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={updateOrderStatusMutation.isPending}
                                >
                                  Update
                                  <ChevronDown className="ml-1 h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => updateOrderStatus(order.id, "confirmed")}
                                  disabled={updateOrderStatusMutation.isPending}
                                >
                                  Mark as Confirmed
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => updateOrderStatus(order.id, "processing")}
                                  disabled={updateOrderStatusMutation.isPending}
                                >
                                  Mark as Processing
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => updateOrderStatus(order.id, "shipped")}
                                  disabled={updateOrderStatusMutation.isPending}
                                >
                                  Mark as Shipped
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => updateOrderStatus(order.id, "delivered")}
                                  disabled={updateOrderStatusMutation.isPending}
                                >
                                  Mark as Delivered
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => updateOrderStatus(order.id, "cancelled")}
                                  variant="destructive"
                                  disabled={updateOrderStatusMutation.isPending}
                                >
                                  Cancel Order
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
