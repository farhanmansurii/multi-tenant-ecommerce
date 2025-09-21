import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StoreData } from "@/lib/types/store";
import { formatDate } from "@/lib/utils";
import {
  Calendar,
  CheckCircle,
  Edit,
  ExternalLink,
  Package,
  PauseCircle,
  PlusIcon,
  Settings,
  Slash,
  Store,
} from "lucide-react";
import Link from "next/link";
import React from "react";

interface StoreCardProps {
  store: StoreData;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return (
        <Badge
          variant="secondary"
          className="text-green-700 bg-green-50 border-green-200"
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    case "draft":
      return (
        <Badge
          variant="secondary"
          className="text-amber-700 bg-amber-50 border-amber-200"
        >
          <PauseCircle className="h-3 w-3 mr-1" />
          Draft
        </Badge>
      );
    case "suspended":
      return (
        <Badge variant="destructive">
          <Slash className="h-3 w-3 mr-1" />
          Suspended
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export default function StoreCard({ store }: StoreCardProps) {
  return (
    <Card
      key={store.id}
      className="flex flex-col h-full border rounded-2xl transition-all duration-200 hover:shadow-lg hover:border-primary/30"
    >
      <CardHeader className="pb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: store.primaryColor || "hsl(var(--primary))",
              }}
            >
              <Store className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg font-semibold leading-snug truncate">
                {store.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground truncate">
                /{store.slug}
              </p>
            </div>
          </div>
          {getStatusBadge(store.status)}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between pb-6">
        {store.description && (
          <p className="text-sm text-muted-foreground mb-5 line-clamp-3">
            {store.description}
          </p>
        )}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span>{store.productCount || 0} products</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(store.createdAt)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-5 border-t mt-auto grid grid-cols-2 gap-3">
        <Button size="sm" className="w-full" asChild>
          <Link
            href={`/dashboard/stores/${store.slug}`}
            className="flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Manage Store
          </Link>
        </Button>

        <Button variant="outline" className="w-full" asChild>
          <Link
            href={`/dashboard/stores/${store.slug}/products/new`}
            className="flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>

        <Button variant="ghost" className="w-full" asChild>
          <Link
            href={`/stores/${store.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Store
          </Link>
        </Button>

        <Button variant="ghost" className="w-full" asChild>
          <Link
            href={`/dashboard/stores/${store.slug}/settings`}
            className="flex items-center"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
