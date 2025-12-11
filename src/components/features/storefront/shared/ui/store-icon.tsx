/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import React from "react";

type Props = {
  src: string;
  alt?: string;
  isLink?: boolean;
  href?: string;
  width?: number;
  height?: number;
  className?: string;
};

export default function StoreLogo({
  src,
  alt = "Store Logo",
  isLink = false,
  href = "/",
  width,
  height,
  className,
}: Props) {
  const logo = (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );

  if (isLink) {
    return <Link href={href}>{logo}</Link>;
  }

  return logo;
}
