/* eslint-disable @next/next/no-img-element */
"use client";


import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadDropzone } from "@/lib/utils/uploadthing";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 10,
  disabled = false,
  className,
}: ImageUploadProps) {
  const canUploadMore = value.length < maxFiles;

  const removeUploadedImage = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Uploaded Images Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div key={`uploaded-${index}`} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border">
                <img
                  src={url}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeUploadedImage(index)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canUploadMore && (
        <UploadDropzone
          endpoint="imageUploader"
          onClientUploadComplete={(res) => {
            const newUrls = res.map(file => file.url);
            onChange([...value, ...newUrls]);
            toast.success(`${newUrls.length} file(s) uploaded successfully`);
          }}
          onUploadError={(error: Error) => {
            console.error("Upload error:", error);
            toast.error(`Upload failed: ${error.message}`);
          }}
          config={{
            mode: "auto",
          }}
          appearance={{
            container: "border-dashed border-2 border-gray-300 rounded-lg p-6",
            uploadIcon: "text-gray-400",
            label: "text-gray-600",
            allowedContent: "text-gray-500",
          }}
          content={{
            label: canUploadMore
              ? `Drop files here or click to upload (${maxFiles - value.length} remaining)`
              : "Maximum files reached",
            allowedContent: "Images up to 4MB",
          }}
        />
      )}

      {/* Empty State */}
      {value.length === 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="aspect-square rounded-lg overflow-hidden border border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
        </div>
      )}
    </div>
  );
}
