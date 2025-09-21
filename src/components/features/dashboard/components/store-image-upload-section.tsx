/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback } from "react";
import { X, Store } from "lucide-react";
import { toast } from "sonner";
import { UploadDropzone } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface UploadedFile {
  url: string;
  name: string;
  size: number;
}

interface StoreImageUploadSectionProps {
  logo: string | undefined;
  setLogo: (logo: string | undefined) => void;
  heroImages: UploadedFile[];
  setHeroImages: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
}

const MAX_HERO_IMAGES = 5;

export const StoreImageUploadSection = ({
  logo,
  setLogo,
  heroImages,
  setHeroImages,
}: StoreImageUploadSectionProps) => {
  const removeHeroImage = useCallback(
    (indexToRemove: number) => {
      setHeroImages((prev) =>
        prev.filter((_, index) => index !== indexToRemove)
      );
    },
    [setHeroImages]
  );

  const canUploadMoreHero = heroImages.length < MAX_HERO_IMAGES;

  return (
    <div className="space-y-8">
      {/* Logo Upload Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Store Logo</Label>
          <span className="text-sm text-muted-foreground">
            Recommended: 200x200px
          </span>
        </div>

        {logo ? (
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden">
                <img
                  src={logo}
                  alt="Store logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={() => setLogo(undefined)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Logo uploaded successfully
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setLogo(undefined)}
                className="mt-2"
              >
                Remove Logo
              </Button>
            </div>
          </div>
        ) : (
          <UploadDropzone
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              if (res && res.length > 0) {
                setLogo(res[0].url);
                toast.success("Logo uploaded successfully");
              }
            }}
            onUploadError={(error: Error) => {
              console.error("Upload error:", error);
              toast.error(`Upload failed: ${error.message}`);
            }}
            className="p-4"
            config={{
              mode: "auto",
            }}
            appearance={{
              uploadIcon: "text-foreground",
              label: "text-foreground",
              allowedContent: "text-foreground text-sm",
            }}
            content={{
              label: "Drop logo here or click to upload",
              allowedContent: "Images up to 4MB",
            }}
          />
        )}
      </div>

      {/* Hero Images Upload Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Hero Images</Label>
          <span className="text-sm text-muted-foreground">
            {heroImages.length}/{MAX_HERO_IMAGES} images
          </span>
        </div>

        {canUploadMoreHero && (
          <UploadDropzone
          className="p-4"
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              const newFiles = res.map((file) => ({
                url: file.url,
                name: file.name,
                size: file.size,
              }));

              setHeroImages((prev) => {
                const combined = [...prev, ...newFiles];
                return combined.slice(0, MAX_HERO_IMAGES);
              });

              toast.success(`${newFiles.length} image(s) uploaded successfully`);
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
              label: canUploadMoreHero
                ? `Drop images here or click to upload (${
                    MAX_HERO_IMAGES - heroImages.length
                  } remaining)`
                : "Maximum images reached",
              allowedContent: "Images up to 4MB each",
            }}
          />
        )}

        {heroImages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {heroImages.map((file, index) => (
              <div key={`${file.url}-${index}`} className="relative group">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeHeroImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 rounded-b-lg">
                  <p className="truncate">{file.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {heroImages.length === 0 && (
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Store className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              No hero images uploaded yet
            </p>
            <p className="text-xs text-muted-foreground">
              Upload up to {MAX_HERO_IMAGES} images to showcase your store
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
