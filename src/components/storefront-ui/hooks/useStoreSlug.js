"use client";

import { useParams } from "next/navigation";

export function useStoreSlug() {
  const params = useParams();
  const slug = params?.slug;
  return typeof slug === "string" ? slug : null;
}

