/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UploadedFile } from "@/lib/domains/products/types";
import { MAX_UPLOAD_FILES } from "@/lib/constants/product";
import { UploadDropzone } from "@/lib/utils/uploadthing";


interface ImageUploadSectionProps {
  uploadedFiles: UploadedFile[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
}

export const ImageUploadSection = ({
  uploadedFiles,
  setUploadedFiles,
}: ImageUploadSectionProps) => {
  const removeFile = useCallback(
    (indexToRemove: number) => {
      setUploadedFiles((prev) =>
        prev.filter((_, index) => index !== indexToRemove)
      );
    },
    [setUploadedFiles]
  );

  const canUploadMore = uploadedFiles.length < MAX_UPLOAD_FILES;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Product Images</Label>
        <span className="text-sm text-muted-foreground">
          {uploadedFiles.length}/{MAX_UPLOAD_FILES} files
        </span>
      </div>

      {canUploadMore && (
        <UploadDropzone
          endpoint="imageUploader"
          onClientUploadComplete={(res) => {
            const newFiles = res.map((file) => ({
              url: file.url,
              name: file.name,
              size: file.size,
            }));

            setUploadedFiles((prev) => {
              const combined = [...prev, ...newFiles];
              return combined.slice(0, MAX_UPLOAD_FILES);
            });

            toast.success(`${newFiles.length} file(s) uploaded successfully`);
          }}
          onUploadError={(error: Error) => {
            console.error("Upload error:", error);
            toast.error(`Upload failed: ${error.message}`);
          }}
          config={{
            mode: "auto",
          }}
          appearance={{
            uploadIcon: "text-foreground",
            label: "text-foreground",
            allowedContent: "text-foreground text-sm",
          }}
          content={{
            label: canUploadMore
              ? `Drop files here or click to upload (${
                  MAX_UPLOAD_FILES - uploadedFiles.length
                } remaining)`
              : "Maximum files reached",
            allowedContent: "Images up to 4MB",
          }}
        />
      )}
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {uploadedFiles.map((file, index) => (
            <div key={`${file.url}-${index}`} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant={"secondary"}
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 cursor-pointer"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
