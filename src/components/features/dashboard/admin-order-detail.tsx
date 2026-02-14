"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  User,
  MapPin,
  CreditCard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { formatPrice } from "@/lib/utils/price";
import { useOrder } from "@/hooks/queries/use-order";
import { useUpdateOrderStatus } from "@/hooks/mutations/use-order-mutations";
import { QuerySkeleton } from "@/lib/ui/query-skeleton";
import { NotFoundState } from "@/components/shared/common/not-found-state";

type OrderItem = {
  id: string;
  productId: string;
  qty: number;
  unitPriceCents: number;
  totalPriceCents: number;
  product?: {
    id: string;
    name: string;
    slug: string;
    images: { url: string; alt: string }[];
  };
};

type Order = {
  id: string;
  orderNumber: number;
  status: string;
  paymentStatus: string;
  amounts: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
  };
  currency: string;
  shippingAddress: {
    recipient: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  billingAddress?: {
    recipient: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

interface AdminOrderDetailProps {
  storeSlug: string;
  orderId: string;
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
  pending: <Clock className="h-4 w-4" />,
  confirmed: <CheckCircle className="h-4 w-4" />,
  processing: <Package className="h-4 w-4" />,
  shipped: <Truck className="h-4 w-4" />,
  delivered: <CheckCircle className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />,
};

export default function AdminOrderDetail({ storeSlug, orderId }: AdminOrderDetailProps) {
  const { data: order, isLoading: loading } = useOrder(storeSlug, orderId);
  const updateStatusMutation = useUpdateOrderStatus(storeSlug);

  const updateStatus = (newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus as any });
  };

  if (loading) {
    return <QuerySkeleton className="py-24" />;
  }

  if (!order) {
    return (
      <NotFoundState
        title="Order not found"
        message="The order you're looking for doesn't exist or has been removed."
        backHref={`/dashboard/stores/${storeSlug}/orders`}
        backLabel="Back to Orders"
        icon={Package}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border bg-card p-4 overflow-x-auto">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">Order #{order.orderNumber}</h2>
            <Badge
              variant={statusVariant[order.status] || "secondary"}
              className="gap-1 px-3 py-1 capitalize"
            >
              {statusIcons[order.status]}
              <span className="capitalize">{order.status}</span>
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="text-sm text-muted-foreground">Update Status:</span>
          <Select
            value={order.status}
            onValueChange={(value) => updateStatus(value)}
            disabled={updateStatusMutation.isPending}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Update status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>{order.items.length} item(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-4">
                    <div className="h-16 w-16 rounded-md bg-muted overflow-hidden flex-shrink-0">
                      {item.product?.images?.[0]?.url ? (
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.product?.name || "Product"}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.qty} × {formatPrice(item.unitPriceCents, order.currency)}
                      </p>
                    </div>
                    <p className="font-semibold flex-shrink-0">
                      {formatPrice(item.totalPriceCents, order.currency)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.amounts.subtotal, order.currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (GST)</span>
                <span>{formatPrice(order.amounts.tax, order.currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {order.amounts.shipping === 0
                    ? "Free"
                    : formatPrice(order.amounts.shipping, order.currency)}
                </span>
              </div>
              {order.amounts.discount > 0 && (
                <div className="flex justify-between text-sm text-foreground">
                  <span>Discount</span>
                  <span>-{formatPrice(order.amounts.discount, order.currency)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatPrice(order.amounts.total, order.currency)}</span>
              </div>
              <div className="pt-2">
                <Badge
                  variant="outline"
                  className={
                    order.paymentStatus === "succeeded"
                      ? "border-border/60 text-foreground"
                      : "border-border/60 text-foreground"
                  }
                >
                  Payment: {order.paymentStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Addresses */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-medium">{order.shippingAddress.recipient}</p>
              <p className="text-muted-foreground">{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && (
                <p className="text-muted-foreground">{order.shippingAddress.line2}</p>
              )}
              <p className="text-muted-foreground">
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p className="text-muted-foreground">{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && (
                <p className="pt-2 text-foreground">{order.shippingAddress.phone}</p>
              )}
            </CardContent>
          </Card>

          {order.billingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4" />
                  Billing Address
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">{order.billingAddress.recipient}</p>
                <p className="text-muted-foreground">{order.billingAddress.line1}</p>
                {order.billingAddress.line2 && (
                  <p className="text-muted-foreground">{order.billingAddress.line2}</p>
                )}
                <p className="text-muted-foreground">
                  {order.billingAddress.city}, {order.billingAddress.state}{" "}
                  {order.billingAddress.postalCode}
                </p>
                <p className="text-muted-foreground">{order.billingAddress.country}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
