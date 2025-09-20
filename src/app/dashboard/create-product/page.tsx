/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, Plus, DollarSign, Package, Image as ImageIcon, FileText } from "lucide-react";
import { toast } from "sonner";

// Product schema validation
const productSchema = z.object({
  // Basic Information
  name: z.string().min(1, "Product name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description must be less than 2000 characters"),
  shortDescription: z.string().max(160, "Short description must be less than 160 characters").optional(),

  // Pricing
  price: z.number().min(0, "Price must be positive"),
  compareAtPrice: z.number().min(0, "Compare at price must be positive").optional(),
  costPerItem: z.number().min(0, "Cost per item must be positive").optional(),

  // Inventory
  sku: z.string().optional(),
  trackQuantity: z.boolean(),
  quantity: z.number().min(0, "Quantity must be non-negative").optional(),
  allowBackorder: z.boolean(),

  // Physical Product
  isPhysical: z.boolean(),
  weight: z.number().min(0, "Weight must be positive").optional(),
  weightUnit: z.string().optional(),
  length: z.number().min(0, "Length must be positive").optional(),
  width: z.number().min(0, "Width must be positive").optional(),
  height: z.number().min(0, "Height must be positive").optional(),
  dimensionUnit: z.string().optional(),

  // Digital Product
  isDigital: z.boolean(),
  digitalFile: z.string().optional(),
  downloadLimit: z.number().min(1, "Download limit must be at least 1").optional(),

  // SEO & Marketing
  seoTitle: z.string().max(60, "SEO title must be less than 60 characters").optional(),
  seoDescription: z.string().max(160, "SEO description must be less than 160 characters").optional(),

  // Status
  status: z.enum(["draft", "active", "archived"]),
  featured: z.boolean(),

  // Categories & Tags
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional(),

  // Images
  images: z.array(z.string()).min(1, "At least one image is required"),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function CreateProductPage() {
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      trackQuantity: true,
      allowBackorder: false,
      isPhysical: true,
      isDigital: false,
      status: "draft",
      featured: false,
      images: [],
      tags: [],
    },
  });

  const { watch, setValue } = form;
  const isPhysical = watch("isPhysical");
  const isDigital = watch("isDigital");
  const trackQuantity = watch("trackQuantity");

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages]);
      setValue("images", [...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setValue("images", newImages);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const newTags = [...tags, newTag.trim()];
      setTags(newTags);
      setValue("tags", newTags);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setValue("tags", newTags);
  };

  const onSubmit = (data: ProductFormData) => {
    console.log("Product data:", data);
    toast.success("Product created successfully!");
    // Here you would typically send the data to your API
  };

  return (
    <div className="min-h-screen  py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
          <p className="mt-2 ">
            Add a new product to your store and start selling to customers.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Pricing
              </TabsTrigger>
              <TabsTrigger value="inventory" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Inventory
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Media & SEO
              </TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                  <CardDescription>
                    Basic details about your product that customers will see.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="Enter product name"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shortDescription">Short Description</Label>
                    <Textarea
                      id="shortDescription"
                      {...form.register("shortDescription")}
                      placeholder="Brief description for product cards and search results"
                      rows={3}
                    />
                    {form.formState.errors.shortDescription && (
                      <p className="text-sm text-red-600">{form.formState.errors.shortDescription.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Full Description *</Label>
                    <Textarea
                      id="description"
                      {...form.register("description")}
                      placeholder="Detailed description of your product"
                      rows={6}
                    />
                    {form.formState.errors.description && (
                      <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select onValueChange={(value) => setValue("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="clothing">Clothing & Accessories</SelectItem>
                          <SelectItem value="home">Home & Garden</SelectItem>
                          <SelectItem value="books">Books & Media</SelectItem>
                          <SelectItem value="sports">Sports & Outdoors</SelectItem>
                          <SelectItem value="beauty">Beauty & Health</SelectItem>
                          <SelectItem value="toys">Toys & Games</SelectItem>
                          <SelectItem value="automotive">Automotive</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.category && (
                        <p className="text-sm text-red-600">{form.formState.errors.category.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                      <Input
                        id="sku"
                        {...form.register("sku")}
                        placeholder="e.g., PROD-001"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Type</CardTitle>
                  <CardDescription>
                    Choose whether this is a physical or digital product.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPhysical"
                      checked={isPhysical}
                      onCheckedChange={(checked) => {
                        setValue("isPhysical", checked);
                        if (checked) setValue("isDigital", false);
                      }}
                    />
                    <Label htmlFor="isPhysical">Physical Product</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isDigital"
                      checked={isDigital}
                      onCheckedChange={(checked) => {
                        setValue("isDigital", checked);
                        if (checked) setValue("isPhysical", false);
                      }}
                    />
                    <Label htmlFor="isDigital">Digital Product</Label>
                  </div>

                  {isPhysical && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight</Label>
                        <div className="flex gap-2">
                          <Input
                            id="weight"
                            type="number"
                            step="0.01"
                            {...form.register("weight", { valueAsNumber: true })}
                            placeholder="0.0"
                          />
                          <Select onValueChange={(value) => setValue("weightUnit", value)}>
                            <SelectTrigger className="w-20">
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kg">kg</SelectItem>
                              <SelectItem value="lbs">lbs</SelectItem>
                              <SelectItem value="g">g</SelectItem>
                              <SelectItem value="oz">oz</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Dimensions (L × W × H)</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            {...form.register("length", { valueAsNumber: true })}
                            placeholder="Length"
                          />
                          <Input
                            type="number"
                            step="0.01"
                            {...form.register("width", { valueAsNumber: true })}
                            placeholder="Width"
                          />
                          <Input
                            type="number"
                            step="0.01"
                            {...form.register("height", { valueAsNumber: true })}
                            placeholder="Height"
                          />
                          <Select onValueChange={(value) => setValue("dimensionUnit", value)}>
                            <SelectTrigger className="w-16">
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cm">cm</SelectItem>
                              <SelectItem value="in">in</SelectItem>
                              <SelectItem value="m">m</SelectItem>
                              <SelectItem value="ft">ft</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {isDigital && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label htmlFor="digitalFile">Digital File</Label>
                        <Input
                          id="digitalFile"
                          type="file"
                          {...form.register("digitalFile")}
                          accept=".pdf,.zip,.mp4,.mp3,.doc,.docx"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="downloadLimit">Download Limit</Label>
                        <Input
                          id="downloadLimit"
                          type="number"
                          {...form.register("downloadLimit", { valueAsNumber: true })}
                          placeholder="Number of times customer can download"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                  <CardDescription>
                    Set your product pricing and profit margins.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="price">Selling Price *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          {...form.register("price", { valueAsNumber: true })}
                          placeholder="0.00"
                          className="pl-10"
                        />
                      </div>
                      {form.formState.errors.price && (
                        <p className="text-sm text-red-600">{form.formState.errors.price.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="compareAtPrice">Compare at Price</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="compareAtPrice"
                          type="number"
                          step="0.01"
                          {...form.register("compareAtPrice", { valueAsNumber: true })}
                          placeholder="0.00"
                          className="pl-10"
                        />
                      </div>
                      <p className="text-xs text-gray-500">Shows as &quot;was $X, now $Y&quot;</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="costPerItem">Cost per Item</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="costPerItem"
                          type="number"
                          step="0.01"
                          {...form.register("costPerItem", { valueAsNumber: true })}
                          placeholder="0.00"
                          className="pl-10"
                        />
                      </div>
                      <p className="text-xs text-gray-500">For profit calculation</p>
                    </div>
                  </div>

                  <Alert>
                    <AlertDescription>
                      <strong>Pricing Tips:</strong> Your compare at price should be higher than your selling price to show a discount.
                      The cost per item helps you track your profit margins.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inventory Tab */}
            <TabsContent value="inventory" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Management</CardTitle>
                  <CardDescription>
                    Control stock levels and availability.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="trackQuantity"
                      checked={trackQuantity}
                      onCheckedChange={(checked) => setValue("trackQuantity", checked)}
                    />
                    <Label htmlFor="trackQuantity">Track quantity</Label>
                  </div>

                  {trackQuantity && (
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity in Stock</Label>
                      <Input
                        id="quantity"
                        type="number"
                        {...form.register("quantity", { valueAsNumber: true })}
                        placeholder="0"
                      />
                      {form.formState.errors.quantity && (
                        <p className="text-sm text-red-600">{form.formState.errors.quantity.message}</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allowBackorder"
                      {...form.register("allowBackorder")}
                    />
                    <Label htmlFor="allowBackorder">Allow customers to purchase this product when it&quot;s out of stock</Label>
                  </div>

                  <Alert>
                    <AlertDescription>
                      <strong>Inventory Tips:</strong> When track quantity is enabled, customers won&quot;t be able to purchase
                      when stock reaches zero. Enable backorder to allow purchases even when out of stock.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Status</CardTitle>
                  <CardDescription>
                    Control when and how your product appears to customers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select onValueChange={(value) => setValue("status", value as "draft" | "active" | "archived")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft (Not visible to customers)</SelectItem>
                        <SelectItem value="active">Active (Visible to customers)</SelectItem>
                        <SelectItem value="archived">Archived (Hidden from customers)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      {...form.register("featured")}
                    />
                    <Label htmlFor="featured">Feature this product</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Media & SEO Tab */}
            <TabsContent value="media" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                  <CardDescription>
                    Upload images to showcase your product. The first image will be used as the main product image.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <Label htmlFor="image-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Upload product images
                          </span>
                          <span className="mt-1 block text-sm text-gray-500">
                            PNG, JPG, GIF up to 10MB each
                          </span>
                        </Label>
                        <Input
                          id="image-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Product ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            {index === 0 && (
                              <Badge className="absolute bottom-2 left-2">Main Image</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {form.formState.errors.images && (
                      <p className="text-sm text-red-600">{form.formState.errors.images.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                  <CardDescription>
                    Optimize your product for search engines and social media.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="seoTitle">SEO Title</Label>
                    <Input
                      id="seoTitle"
                      {...form.register("seoTitle")}
                      placeholder="Optimized title for search engines"
                      maxLength={60}
                    />
                    <p className="text-xs text-gray-500">
                      {form.watch("seoTitle")?.length || 0}/60 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seoDescription">SEO Description</Label>
                    <Textarea
                      id="seoDescription"
                      {...form.register("seoDescription")}
                      placeholder="Meta description for search engines"
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-500">
                      {form.watch("seoDescription")?.length || 0}/160 characters
                    </p>
                  </div>

                  <Alert>
                    <AlertDescription>
                      <strong>SEO Tips:</strong> Use relevant keywords in your title and description.
                      Keep titles under 60 characters and descriptions under 160 characters for optimal display in search results.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
            <Button type="submit" className="min-w-32">
              Create Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
