"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { ProductData, ProductFormValues, ProductImage, ProductStatus, ProductType } from "./types";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ProductFormValues) => Promise<void> | void;
  isSubmitting: boolean;
  editingProduct: ProductData | null;
}

const emptyFormValues: ProductFormValues = {
  name: "",
  description: "",
  shortDescription: "",
  sku: "",
  type: "physical",
  status: "draft",
  price: "",
  compareAtPrice: "",
  quantity: "0",
  categories: [],
  tags: [],
  featured: false,
  requiresShipping: true,
  taxable: true,
  trackQuantity: true,
  allowBackorder: false,
  images: [],
};

const createFormValuesFromProduct = (product: ProductData): ProductFormValues => ({
  name: product.name,
  description: product.description,
  shortDescription: product.shortDescription ?? "",
  sku: product.sku ?? "",
  type: product.type,
  status: product.status,
  price: product.price,
  compareAtPrice: product.compareAtPrice ?? "",
  quantity: product.quantity,
  categories: product.categories,
  tags: product.tags,
  featured: product.featured,
  requiresShipping: true,
  taxable: true,
  trackQuantity: true,
  allowBackorder: false,
  images: product.images ?? [],
});

const ensurePrimary = (images: ProductImage[]) => {
  if (images.length === 0) {
    return images;
  }

  const currentPrimary = images.find((image) => image.isPrimary);
  if (currentPrimary) {
    return images.map((image) => ({
      ...image,
      isPrimary: image.id === currentPrimary.id,
    }));
  }

  const [first, ...rest] = images;
  return [{ ...first, isPrimary: true }, ...rest.map((image) => ({ ...image, isPrimary: false }))];
};

const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  editingProduct,
}) => {
  const [formValues, setFormValues] = useState<ProductFormValues>(emptyFormValues);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageAlt, setNewImageAlt] = useState("");

  const isEditMode = useMemo(() => Boolean(editingProduct), [editingProduct]);

  useEffect(() => {
    if (open) {
      if (editingProduct) {
        setFormValues(createFormValuesFromProduct(editingProduct));
      } else {
        setFormValues(emptyFormValues);
      }
      setNewImageUrl("");
      setNewImageAlt("");
      return;
    }

    // Reset when dialog closes
    setFormValues(emptyFormValues);
    setNewImageUrl("");
    setNewImageAlt("");
  }, [open, editingProduct]);

  const handleImageAdd = () => {
    if (!newImageUrl.trim()) {
      return;
    }

    setFormValues((prev) => {
      const image: ProductImage = {
        id: Date.now().toString(),
        url: newImageUrl.trim(),
        alt: newImageAlt.trim() || "Product image",
        isPrimary: prev.images.length === 0,
      };

      return {
        ...prev,
        images: ensurePrimary([...prev.images, image]),
      };
    });

    setNewImageUrl("");
    setNewImageAlt("");
  };

  const handleImageRemove = (imageId: string) => {
    setFormValues((prev) => {
      const updated = prev.images.filter((img) => img.id !== imageId);
      const removedWasPrimary = prev.images.find((img) => img.id === imageId)?.isPrimary;

      if (!removedWasPrimary) {
        return { ...prev, images: updated };
      }

      if (updated.length === 0) {
        return { ...prev, images: [] };
      }

      const [first, ...rest] = updated;
      return {
        ...prev,
        images: [{ ...first, isPrimary: true }, ...rest.map((img) => ({ ...img, isPrimary: false }))],
      };
    });
  };

  const handlePrimarySelect = (imageId: string) => {
    setFormValues((prev) => ({
      ...prev,
      images: prev.images.map((img) => ({
        ...img,
        isPrimary: img.id === imageId,
      })),
    }));
  };

  const handleSubmit = async () => {
    if (!formValues.name || !formValues.description || !formValues.price) {
      return;
    }

    await onSubmit(formValues);
  };

  const updateField = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=" max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Product" : "Create New Product"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update your product information below." : "Add a new product to your store."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Basic Information</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formValues.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Enter product name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formValues.sku}
                  onChange={(event) => updateField("sku", event.target.value)}
                  placeholder="Product SKU"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formValues.description}
                onChange={(event) => updateField("description", event.target.value)}
                placeholder="Describe your product"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                value={formValues.shortDescription}
                onChange={(event) => updateField("shortDescription", event.target.value)}
                placeholder="Brief product summary"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Product Settings</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formValues.type}
                  onValueChange={(value: ProductType) => updateField("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physical">Physical</SelectItem>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formValues.status}
                  onValueChange={(value: ProductStatus) => updateField("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formValues.quantity}
                  onChange={(event) => updateField("quantity", event.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Pricing</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formValues.price}
                  onChange={(event) => updateField("price", event.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="compareAtPrice">Compare at Price</Label>
                <Input
                  id="compareAtPrice"
                  type="number"
                  step="0.01"
                  value={formValues.compareAtPrice}
                  onChange={(event) => updateField("compareAtPrice", event.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Product Images</h4>

            <div className="space-y-3 p-4 border rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={newImageUrl}
                    onChange={(event) => setNewImageUrl(event.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageAlt">Alt Text</Label>
                  <Input
                    id="imageAlt"
                    value={newImageAlt}
                    onChange={(event) => setNewImageAlt(event.target.value)}
                    placeholder="Product image description"
                  />
                </div>
              </div>
              <Button type="button" onClick={handleImageAdd} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Image
              </Button>
            </div>

            {formValues.images.length > 0 && (
              <div className="space-y-3">
                <Label>Current Images</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {formValues.images.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="w-full h-full object-cover"
                          onError={(event) => {
                            event.currentTarget.src =
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2U8L3RleHQ+PC9zdmc+";
                          }}
                        />
                      </div>
                      {image.isPrimary && (
                        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
                          Primary
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handlePrimarySelect(image.id)}
                            disabled={image.isPrimary}
                          >
                            {image.isPrimary ? "Primary" : "Set Primary"}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleImageRemove(image.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Options</h4>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formValues.featured}
                  onCheckedChange={(checked) => updateField("featured", checked)}
                />
                <Label htmlFor="featured">Featured Product</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="requiresShipping"
                  checked={formValues.requiresShipping}
                  onCheckedChange={(checked) => updateField("requiresShipping", checked)}
                />
                <Label htmlFor="requiresShipping">Requires Shipping</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="taxable"
                  checked={formValues.taxable}
                  onCheckedChange={(checked) => updateField("taxable", checked)}
                />
                <Label htmlFor="taxable">Taxable</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : isEditMode ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
