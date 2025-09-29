import React from "react";
import StoreJoiner from "@/components/features/storefront/storefront-auth/store-joiner";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function layout({ children, params }: Props) {
  const { slug } = await params;

  return (
    <div className="overflow-hidden">
      <StoreJoiner storeSlug={slug} />
      {children}
    </div>
  );
}
