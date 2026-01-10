"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useRequireAuth } from '@/lib/session';
import { fetchStores } from '@/lib/domains/stores/service';

import EditStoreForm from '@/components/forms/store/edit-store-form';
import { Loader } from '@/components/shared/common/loader';
import { PageCard } from '@/components/shared/layout/page-card';
import { AlertCircle, Info } from 'lucide-react';
import { StoreFormData } from '@/lib/domains/stores';
import { storeFormValuesToPayload } from '@/lib/domains/stores/form';

export default function StoreCreate() {
  const { isAuthenticated, user, isPending } = useRequireAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Use React Query to fetch stores (will deduplicate with other components using same query key)
  const { data: storesData } = useQuery({
    queryKey: ["stores"],
    queryFn: fetchStores,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const storeLimit = storesData
    ? {
        count: storesData.count,
        limit: storesData.limit,
        canCreateMore: storesData.canCreateMore,
      }
    : null;

  const handleSave = async (values: StoreFormData): Promise<void> => {
    if (!isAuthenticated || !user) {
      toast.error('You must be logged in to create a store');
      throw new Error('Authentication required');
    }

    if (storeLimit && !storeLimit.canCreateMore) {
      toast.error('You have reached the maximum number of stores');
      throw new Error('Store limit reached');
    }

    setIsSaving(true);
    setIsSuccess(false);

    try {
      const payload = storeFormValuesToPayload(values);
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok) {
        // Invalidate stores query to refetch updated list
        await queryClient.invalidateQueries({ queryKey: ["stores"] });
        setIsSuccess(true);
        toast.success('Store created successfully!');

        // Show success state briefly before redirecting
        setTimeout(() => {
          const targetSlug = result.store?.slug ?? '';
          if (targetSlug) {
            router.push(`/dashboard/stores/${targetSlug}`);
          } else {
            router.push('/dashboard');
          }
          router.refresh();
        }, 1500);
      } else {
        setIsSuccess(false);
        const errorMessage = result.message || result.error || 'Failed to create store';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error creating store:', error);
      setIsSuccess(false);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while creating the store';
      toast.error(errorMessage);
      throw error; // Re-throw to let form know submission failed
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  if (isPending) {
    return (
       <Loader text="Loading Store"/>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageCard
          title="Authentication Required"
          description="You must be logged in to create a store."
          variant="outlined"
          className="max-w-md"
        >
          <div className="text-center">
            <button
              onClick={() => router.push('/sign-in')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Sign In
            </button>
          </div>
        </PageCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {storeLimit && !storeLimit.canCreateMore && (
        <PageCard
          variant="outlined"
          className="border-red-200 bg-red-50"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Store Limit Reached</h3>
              <p className="mt-1 text-sm text-red-700">
                You have reached the maximum limit of {storeLimit.limit} stores. Please delete an existing store to create a new one.
              </p>
            </div>
          </div>
        </PageCard>
      )}

      {storeLimit && storeLimit.canCreateMore && (
        <PageCard
          variant="outlined"
          className="border-blue-200 bg-blue-50"
        >
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" />
            <p className="text-sm text-blue-800">
              You have {storeLimit.count} of {storeLimit.limit} stores. {storeLimit.limit - storeLimit.count} stores remaining.
            </p>
          </div>
        </PageCard>
      )}

      <EditStoreForm
        mode="create"
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving}
        isSuccess={isSuccess}
      />
    </div>
  );
}
