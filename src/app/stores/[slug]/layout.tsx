import React from "react";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function layout({ children, params }: Props) {
  const { slug } = await params;

  return (
    <div className="overflow-hidden storefront-theme">
      {children}
    </div>
  );
}
