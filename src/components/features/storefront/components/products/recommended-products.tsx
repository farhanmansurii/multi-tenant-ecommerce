"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRecommendations } from "@/lib/domains/products/service";
import type { ProductData } from "@/lib/domains/products/types";
import StoreFrontContainer from '../../shared/layout/container';
import ProductGrid from "./product-grid";


interface Props {
  storeSlug: string;
  current: ProductData;
}

export default function RecommendedProducts({ storeSlug, current }: Props) {
  const { data: recommended = [] } = useQuery({
    queryKey: ["recommendations", storeSlug, current.id],
    queryFn: () => fetchRecommendations(storeSlug, current.slug),
  });

  if (recommended.length === 0) return null;

  return (
    <StoreFrontContainer>
      <ProductGrid
        products={recommended}
        layout="grid"
        title={"Youd also like"}
        subtitle={undefined}
        storeSlug={storeSlug}
      />
    </StoreFrontContainer>
  );
}


