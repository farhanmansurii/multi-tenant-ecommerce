"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { useRequireAuth } from '@/lib/session-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DualStoreForm from '@/components/reusables/edit-store-form';

interface StoreSettingsProps {
  params: Promise<{ slug: string }>;
}

interface StoreData {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  tagline?: string | null;
  description: string;
  contactEmail: string;
  contactPhone?: string | null;
  website?: string | null;
  businessType: 'individual' | 'business' | 'nonprofit';
  businessName: string;
  taxId?: string | null;
  addressLine1?: string | null;
  address?: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  primaryColor: string;
  secondaryColor?: string | null;
  currency: string;
  timezone: string;
  language: string;
  paymentMethods: string[];
  shippingEnabled: boolean;
  freeShippingThreshold?: string | number | null;
  shippingRates?: Array<{ name: string; price: number; estimatedDays: string }> | null;
  termsOfService: string;
  privacyPolicy: string;
  refundPolicy: string;
  status: 'draft' | 'active' | 'suspended';
  featured: boolean;
  logo?: string | null;
  favicon?: string | null;
  stripeAccountId?: string | null;
  paypalEmail?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface StoreFormPayload {
  storeName: string;
  storeSlug: string;
  tagline?: string;
  description: string;
  email: string;
  phone?: string;
  website?: string;
  businessType: 'individual' | 'business' | 'nonprofit';
  businessName: string;
  taxId?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor?: string;
  currency: string;
  timezone: string;
  language: string;
  paymentMethods: string[];
  stripeAccountId?: string;
  paypalEmail?: string;
  shippingEnabled: boolean;
  freeShippingThreshold?: number;
  shippingRates?: Array<{ name: string; price: number; estimatedDays: string }>;
  termsOfService: string;
  privacyPolicy: string;
  refundPolicy: string;
  status: 'draft' | 'active' | 'suspended';
  featured: boolean;
}

function mapStoreToForm(store: StoreData): StoreFormPayload {
  return {
    storeName: store.name ?? '',
    storeSlug: store.slug ?? '',
    tagline: store.tagline ?? '',
    description: store.description ?? '',
    email: store.contactEmail ?? '',
    phone: store.contactPhone ?? '',
    website: store.website ?? '',
    businessType: store.businessType ?? 'individual',
    businessName: store.businessName ?? '',
    taxId: store.taxId ?? '',
    address: store.addressLine1 ?? store.address ?? '',
    city: store.city ?? '',
    state: store.state ?? '',
    zipCode: store.zipCode ?? '',
    country: store.country ?? '',
    logo: store.logo ?? '',
    favicon: store.favicon ?? '',
    primaryColor: store.primaryColor ?? '#3B82F6',
    secondaryColor: store.secondaryColor ?? '#1E40AF',
    currency: store.currency ?? 'USD',
    timezone: store.timezone ?? 'America/New_York',
    language: store.language ?? 'en',
    paymentMethods: Array.isArray(store.paymentMethods) ? store.paymentMethods : [],
    stripeAccountId: store.stripeAccountId ?? '',
    paypalEmail: store.paypalEmail ?? '',
    shippingEnabled: store.shippingEnabled ?? false,
    freeShippingThreshold:
      typeof store.freeShippingThreshold === 'number'
        ? store.freeShippingThreshold
        : store.freeShippingThreshold
        ? Number(store.freeShippingThreshold)
        : 0,
    shippingRates: store.shippingRates ?? [],
    termsOfService: store.termsOfService ?? '',
    privacyPolicy: store.privacyPolicy ?? '',
    refundPolicy: store.refundPolicy ?? '',
    status: store.status ?? 'draft',
    featured: store.featured ?? false,
  };
}

export default function StoreSettings({ params }: StoreSettingsProps) {
  const { isAuthenticated, user, isPending } = useRequireAuth();
  const router = useRouter();

  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState<string>('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const unwrapParams = async () => {
      const { slug: resolvedSlug } = await params;
      setSlug(resolvedSlug);
    };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (isAuthenticated && user && slug) {
      fetchStore(slug, user.id);
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
          setError("You don't have permission to edit this store");
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

  const handleSave = async (values: Partial<StoreFormPayload>) => {
    if (!store) return;

    const base = mapStoreToForm(store);
    const payload: StoreFormPayload = {
      ...base,
      ...values,
      paymentMethods: values.paymentMethods ?? base.paymentMethods,
      shippingRates: values.shippingRates ?? base.shippingRates,
      stripeAccountId: values.stripeAccountId ?? base.stripeAccountId,
      paypalEmail: values.paypalEmail ?? base.paypalEmail,
      freeShippingThreshold:
        values.freeShippingThreshold !== undefined ? values.freeShippingThreshold : base.freeShippingThreshold,
    };

    setSaving(true);
    try {
      const response = await fetch(`/api/stores/${store.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'Failed to update store');
      }

      const data = await response.json();
      setStore(data.store as StoreData);
      toast.success('Store updated successfully!');
      router.refresh();
    } catch (err) {
      console.error('Error saving store:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update store');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!store) return;

    const confirmed = window.confirm(
      'Deleting this store will permanently remove the store and all products under it. This action cannot be undone. Are you sure you want to continue?'
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/stores/${store.slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'Failed to delete store');
      }

      toast.success('Store deleted successfully');
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error('Error deleting store:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete store');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="">Loading store...</p>
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
              You must be logged in to edit stores.
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
                Only the store owner can edit this store.
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

  const formData = mapStoreToForm(store);

  return (
    <div className="min-h-screen  py-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 sm:px-6">
        {isOwner && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              You are the owner of this store and can edit its settings.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Edit Store</CardTitle>
            <CardDescription>
              Choose the setup experience that fits your workflow. Your latest settings will be shown when you open each mode.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <DualStoreForm
              storeData={formData}
              isEditPage
              onSave={handleSave}
              onCancel={() => router.back()}
              isSaving={saving}
            />
          </CardContent>
        </Card>

        {isOwner && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Deleting this store will also remove all associated products. This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="w-full justify-center"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting Store...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Store
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
