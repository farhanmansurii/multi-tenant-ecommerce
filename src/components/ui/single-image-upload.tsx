"use client";

import { ImageUpload } from "@/components/ui/image-upload";
import { cn } from "@/lib/utils";

interface SingleImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  disabled?: boolean;
  className?: string;
}

export function SingleImageUpload({
  value,
  onChange,
  disabled = false,
  className,
}: SingleImageUploadProps) {
  const handleImageChange = (urls: string[]) => {
    onChange(urls[0] || undefined);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <ImageUpload
        value={value ? [value] : []}
        onChange={handleImageChange}
        maxFiles={1}
        disabled={disabled}

      />
    </div>
  );
}
