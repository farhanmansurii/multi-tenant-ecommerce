"use client";

import { useRequireAuth } from '@/lib/session-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Store, Plus, Edit, Loader2, Package, CheckCircle, PauseCircle, Slash } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface StoreData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: 'draft' | 'active' | 'suspended';
  primaryColor?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export default function DashboardPage() {
  const { isAuthenticated, user, isPending } = useRequireAuth();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeLimit, setStoreLimit] = useState<{
    count: number;
    limit: number;
    canCreateMore: boolean;
  } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStores();
    }
  }, [isAuthenticated]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stores');

      if (response.ok) {
        const data = await response.json();
        setStores(data.stores);
        setStoreLimit({
          count: data.count,
          limit: data.limit,
          canCreateMore: data.canCreateMore,
        });
      } else {
        toast.error('Failed to fetch stores');
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('An error occurred while fetching stores');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Active
          </Badge>
        );
      case 'draft':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <PauseCircle className="h-3 w-3" /> Draft
          </Badge>
        );
      case 'suspended':
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <Slash className="h-3 w-3" /> Suspended
          </Badge>
        );
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className=" mb-4">You need to be logged in to access the dashboard.</p>
          <Button asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold ">Dashboard</h1>
          <p className="text-lg ">Welcome back, {user?.name}</p>
        </div>
        {storeLimit && (
          <div className="w-40">
            <Progress value={(storeLimit.count / storeLimit.limit) * 100} className="h-2 mb-1" />
            <p className="text-sm  text-right">
              {storeLimit.count}/{storeLimit.limit}
            </p>
          </div>
        )}
      </div>

      {/* Create Store Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 x gap-6">
        <Card className="border-dashed border-2  flex flex-col hover:shadow-lg transition-transform hover:scale-[1.02]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-6 w-6 " />
              Create New Store
            </CardTitle>
            <CardDescription>
              Set up a new online store for your business
              {storeLimit && !storeLimit.canCreateMore && (
                <span className="text-red-600 ml-2">
                  (Limit reached: {storeLimit.count}/{storeLimit.limit})
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto">
            <Button
              asChild
              className="w-full"
              disabled={storeLimit ? !storeLimit.canCreateMore : false}
            >
              <Link href="/dashboard/stores/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Store
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* My Stores */}
      <div>
        <h2 className="text-2xl font-bold  mb-4">My Stores</h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 x gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-4 animate-pulse flex flex-col h-60">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/3 mb-4" />
                <div className="h-20 bg-gray-200 rounded flex-1" />
              </Card>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <Card className="flex flex-col justify-center h-60">
            <CardContent className="text-center py-8">
              <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No stores yet</h3>
              <p className=" mb-4">
                Create your first store to start selling online.
              </p>
              <Button asChild>
                <Link href="/dashboard/stores/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Store
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 x gap-6">
            {stores.map((store) => (
              <Card
                key={store.id}
                className="flex flex-col h-60 hover:shadow-lg transition-transform hover:scale-[1.02]"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full ring-2 ring-offset-2"
                        style={{ backgroundColor: store.primaryColor || '#3B82F6' }}
                      />
                      <div>
                        <CardTitle className="text-lg">{store.name}</CardTitle>
                        <p className="text-sm text-gray-500">/{store.slug}</p>
                      </div>
                    </div>
                    {getStatusBadge(store.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 flex-1 overflow-hidden">
                  {store.description && (
                    <p
                      className=" text-sm line-clamp-2"
                      title={store.description}
                    >
                      {store.description}
                    </p>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm  font-medium">
                      <Package className="h-4 w-4" />
                      <span>{store._count?.products || 0} products</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Created: {formatDate(store.createdAt)}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2 mt-auto">
                  <Button size="sm" className="flex-1" asChild>
                    <Link href={`/dashboard/stores/${store.slug}`}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-full p-2" asChild>
                    <Link href={`/dashboard/stores/${store.slug}/products/new`}>
                      <Package className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
