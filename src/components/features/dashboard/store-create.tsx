"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { useRequireAuth } from '@/lib/session-context';

import { StoreFormData } from '@/lib/validations/store';
import DualStoreForm from '@/components/forms/store/edit-store-form';

interface StoreLimitInfo {
  count: number;
  limit: number;
  canCreateMore: boolean;
}

export default function StoreCreate() {
  const { isAuthenticated, user, isPending } = useRequireAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [storeLimit, setStoreLimit] = useState<StoreLimitInfo | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      void checkStoreLimit();
    }
  }, [isAuthenticated, user]);

  const checkStoreLimit = async () => {
    try {
      const response = await fetch('/api/stores');
      if (response.ok) {
        const data = await response.json();
        setStoreLimit({
          count: data.count,
          limit: data.limit,
          canCreateMore: data.canCreateMore,
        });
      }
    } catch (error) {
      console.error('Failed to check store limit:', error);
    }
  };

  const handleSave = async (data: StoreFormData) => {
    if (!isAuthenticated || !user) {
      toast.error('You must be logged in to create a store');
      return;
    }

    if (storeLimit && !storeLimit.canCreateMore) {
      toast.error('You have reached the maximum number of stores');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success('Store created successfully!');
        const targetSlug = result.store?.slug ?? '';
        if (targetSlug) {
          router.push(`/dashboard/stores/${targetSlug}`);
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      } else {
        toast.error(result.message || 'Failed to create store');
      }
    } catch (error) {
      console.error('Error creating store:', error);
      toast.error('An error occurred while creating the store');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  if (isPending) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className=" mb-4">You must be logged in to create a store.</p>
          <button
            onClick={() => router.push('/sign-in')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {storeLimit && !storeLimit.canCreateMore && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Store Limit Reached</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      You have reached the maximum limit of {storeLimit.limit} stores. Please delete an existing store to create a new one.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {storeLimit && storeLimit.canCreateMore && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <p className="text-sm text-blue-800 text-center">
              You have {storeLimit.count} of {storeLimit.limit} stores. {storeLimit.limit - storeLimit.count} stores remaining.
            </p>
          </div>
        </div>
      )}

      <DualStoreForm storeData={{}} onSave={handleSave} onCancel={handleCancel} isSaving={isSaving} />
    </div>
  );
}
