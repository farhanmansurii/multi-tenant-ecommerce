"use client";

import React from "react";
import { StoreFormData } from "@/lib/domains/stores/validation";
import StoreForm from "@/components/features/dashboard/store-form";

interface StoreFormProps {
  mode?: "create" | "edit";
  initialValues?: Partial<StoreFormData>;
  onSave: (data: StoreFormData) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
  isAuthenticated?: boolean;
  isOwner?: boolean;
  storeLoading?: boolean;
  storeError?: Error | null;
  isSuccess?: boolean;
  slug?: string;
}

export default function EditStoreForm({
  mode = "edit",
  initialValues,
  onSave,
  onCancel,
  isSaving = false,
  isAuthenticated = true,
  isOwner = true,
  storeLoading = false,
  storeError = null,
  isSuccess = false,
  slug,
}: StoreFormProps) {
  return (
    <StoreForm
      mode={mode}
      initialValues={initialValues}
      onSave={onSave}
      onCancel={onCancel}
      isSaving={isSaving}
      isAuthenticated={isAuthenticated}
      isOwner={isOwner}
      storeLoading={storeLoading}
      storeError={storeError}
      isSuccess={isSuccess}
      slug={slug}
    />
  );
}
