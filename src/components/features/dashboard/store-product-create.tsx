"use client";

import { useEffect, useState } from "react";
import ProductForm from "./product-form";

interface StoreProductCreateProps {
  params: Promise<{ slug: string }>;
}

export default function StoreProductCreate({ params }: StoreProductCreateProps) {
  const [resolvedParams, setResolvedParams] = useState<{ slug: string } | null>(null);

  // Resolve params
  useEffect(() => {
    let isCancelled = false;

    params.then((resolved) => {
      if (!isCancelled) {
        setResolvedParams(resolved);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [params]);

  const { slug } = resolvedParams || {};

  if (!slug) {
    return null; // Will be handled by ProductForm
  }

  return <ProductForm mode="create" storeSlug={slug} />;
}
