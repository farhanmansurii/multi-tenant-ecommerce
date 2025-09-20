"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

import { useRequireAuth } from '@/lib/session-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const productFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().optional(),
  sku: z.string().optional(),
  type: z.enum(['physical', 'digital', 'service']),
  status: z.enum(['draft', 'active', 'inactive', 'out_of_stock']),
  price: z.number({ invalid_type_error: 'Price must be a number' }).min(0, 'Price must be positive'),
  compareAtPrice: z
    .number({ invalid_type_error: 'Compare at price must be a number' })
    .min(0, 'Compare at price must be positive')
    .optional(),
  quantity: z.number({ invalid_type_error: 'Quantity must be a number' }).min(0, 'Quantity must be positive'),
  requiresShipping: z.boolean(),
  taxable: z.boolean(),
  trackQuantity: z.boolean(),
  allowBackorder: z.boolean(),
  featured: z.boolean(),
  categories: z.string().optional(),
  tags: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface StoreData {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
}

interface StoreProductCreateProps {
  params: Promise<{ slug: string }>;
}

const PRODUCT_TYPE_OPTIONS = [
  { value: 'physical', label: 'Physical' },
  { value: 'digital', label: 'Digital' },
  { value: 'service', label: 'Service' },
];

const PRODUCT_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'out_of_stock', label: 'Out of Stock' },
];

export default function StoreProductCreate({ params }: StoreProductCreateProps) {
  const { isAuthenticated, user, isPending } = useRequireAuth();
  const router = useRouter();

  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState<string>('');
  const [isOwner, setIsOwner] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      shortDescription: '',
      sku: '',
      type: 'physical',
      status: 'draft',
      price: 0,
      compareAtPrice: undefined,
      quantity: 0,
      requiresShipping: true,
      taxable: true,
      trackQuantity: true,
      allowBackorder: false,
      featured: false,
      categories: '',
      tags: '',
    },
  });

  useEffect(() => {
    const unwrapParams = async () => {
      const { slug: resolvedSlug } = await params;
      setSlug(resolvedSlug);
    };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (isAuthenticated && user && slug) {
      void fetchStore(slug, user.id);
    }
  }, [isAuthenticated, user, slug]);

  const fetchStore = async (storeSlug: string, userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stores/${storeSlug}`);

      if (response.ok) {
        const data = await response.json();
        const storeData = data.store as StoreData;
        setStore(storeData);

        if (storeData.ownerId === userId) {
          setIsOwner(true);
        } else {
          setError("You don't have permission to create products for this store");
        }
      } else if (response.status === 404) {
        setError('Store not found');
      } else {
        setError('Failed to load store');
      }
    } catch (err) {
      console.error('Error fetching store:', err);
      setError('An error occurred while loading the store');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: ProductFormValues) => {
    if (!store) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/stores/${store.slug}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          shortDescription: values.shortDescription || null,
          sku: values.sku || null,
          type: values.type,
          status: values.status,
          price: values.price.toString(),
          compareAtPrice: values.compareAtPrice?.toString(),
          quantity: values.quantity.toString(),
          trackQuantity: values.trackQuantity,
          allowBackorder: values.allowBackorder,
          requiresShipping: values.requiresShipping,
          taxable: values.taxable,
          featured: values.featured,
          categories: values.categories
            ? values.categories.split(',').map((item) => item.trim()).filter(Boolean)
            : [],
          tags: values.tags
            ? values.tags.split(',').map((item) => item.trim()).filter(Boolean)
            : [],
          images: [],
          variants: [],
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'Failed to create product');
      }

      toast.success('Product created successfully');
      router.push(`/dashboard/stores/${store.slug}`);
      router.refresh();
    } catch (err) {
      console.error('Error creating product:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="">Preparing product creator...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Authentication Required</CardTitle>
            <CardDescription className="text-center">
              You must be logged in to create products.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Only the store owner can manage products for this store.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button asChild>
                <Link href={`/stores/${slug}`}>View Store</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Store Not Found</h1>
          <p className=" mb-6">
            The store you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 sm:px-6">
        {isOwner && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Creating a product for <span className="font-semibold">{store.name}</span>.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Create a New Product</CardTitle>
            <CardDescription>
              Add detailed information so customers know what they&apos;re buying.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <section className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input id="name" placeholder="Premium Mug" {...register('name')} />
                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" placeholder="SKU-001" {...register('sku')} />
                    {errors.sku && <p className="text-sm text-red-600">{errors.sku.message}</p>}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="shortDescription">Short Description</Label>
                    <Textarea
                      id="shortDescription"
                      rows={2}
                      placeholder="A concise overview for quick scans."
                      {...register('shortDescription')}
                    />
                    {errors.shortDescription && (
                      <p className="text-sm text-red-600">{errors.shortDescription.message}</p>
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      rows={5}
                      placeholder="Describe how this product delights your customers."
                      {...register('description')}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Product Type *</Label>
                    <Controller
                      control={control}
                      name="type"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {PRODUCT_TYPE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.type && <p className="text-sm text-red-600">{errors.type.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Status *</Label>
                    <Controller
                      control={control}
                      name="status"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {PRODUCT_STATUS_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.status && <p className="text-sm text-red-600">{errors.status.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="29.99"
                      {...register('price', { valueAsNumber: true })}
                    />
                    {errors.price && <p className="text-sm text-red-600">{errors.price.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="compareAtPrice">Compare at Price</Label>
                    <Input
                      id="compareAtPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="39.99"
                      {...register('compareAtPrice', { valueAsNumber: true })}
                    />
                    {errors.compareAtPrice && (
                      <p className="text-sm text-red-600">{errors.compareAtPrice.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Inventory *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      placeholder="10"
                      {...register('quantity', { valueAsNumber: true })}
                    />
                    {errors.quantity && <p className="text-sm text-red-600">{errors.quantity.message}</p>}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Controller
                    control={control}
                    name="requiresShipping"
                    render={({ field }) => (
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-medium text-foreground">Requires Shipping</p>
                          <p className="text-sm text-muted-foreground">Enable for physical goods that ship.</p>
                        </div>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </div>
                    )}
                  />
                  <Controller
                    control={control}
                    name="taxable"
                    render={({ field }) => (
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-medium text-foreground">Taxable</p>
                          <p className="text-sm text-muted-foreground">Collect sales tax on this product.</p>
                        </div>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </div>
                    )}
                  />
                  <Controller
                    control={control}
                    name="trackQuantity"
                    render={({ field }) => (
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-medium text-foreground">Track Quantity</p>
                          <p className="text-sm text-muted-foreground">Automatically adjust stock as orders close.</p>
                        </div>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </div>
                    )}
                  />
                  <Controller
                    control={control}
                    name="allowBackorder"
                    render={({ field }) => (
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-medium text-foreground">Allow Backorders</p>
                          <p className="text-sm text-muted-foreground">Accept orders when inventory hits zero.</p>
                        </div>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </div>
                    )}
                  />
                  <Controller
                    control={control}
                    name="featured"
                    render={({ field }) => (
                      <div className="flex items-center justify-between rounded-lg border p-4 md:col-span-2">
                        <div>
                          <p className="font-medium text-foreground">Feature this product</p>
                          <p className="text-sm text-muted-foreground">Highlight in featured sections and landing pages.</p>
                        </div>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </div>
                    )}
                  />
                </div>
              </section>

              <section className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="categories">Categories (comma separated)</Label>
                    <Input id="categories" placeholder="Home, Kitchen" {...register('categories')} />
                    {errors.categories && <p className="text-sm text-red-600">{errors.categories.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input id="tags" placeholder="Mugs, Gifts" {...register('tags')} />
                    {errors.tags && <p className="text-sm text-red-600">{errors.tags.message}</p>}
                  </div>
                </div>
              </section>

              <div className="flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Product...
                    </>
                  ) : (
                    'Create Product'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
