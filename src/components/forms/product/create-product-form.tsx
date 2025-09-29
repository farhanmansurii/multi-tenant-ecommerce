/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductFormData, ProductFormInput, productSchema } from "@/lib/domains/products/validation";


async function uploadFiles(files: File[]): Promise<string[]> {
  throw new Error("Image upload not wired yet. Use UploadThing UI component.");
}

// ---------------- API ----------------
function useCreateProduct(storeSlug: string) {
  return useMutation({
    mutationFn: async (product: ProductFormData) => {
      const payload = {
        ...product,
        price: product.price.toString(),
        categories: product.category ? [product.category] : [],
      } satisfies Record<string, unknown>;

      const res = await fetch(`/api/stores/${storeSlug}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create product");
      return res.json();
    },
  });
}

interface CreateProductFormProps {
  storeSlug: string;
}

export function CreateProductForm({ storeSlug }: CreateProductFormProps) {
  const createProduct = useCreateProduct(storeSlug);

  const form = useForm<ProductFormInput, unknown, ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      shortDescription: "",
      price: 0,
      category: "",
      tags: [],
      images: [],
    } satisfies ProductFormInput,
  });

  const fillWithDummyData = () => {
    const dummyData: ProductFormInput = {
      name: "Aurora Smartwatch",
      description:
        "Experience next-gen connectivity with the Aurora Smartwatch. Track fitness goals, receive notifications, and control smart-home devices from your wrist.",
      shortDescription: "Feature-rich smartwatch with health tracking",
      price: 199.99,
      category: "electronics",
      tags: ["wearable", "smart", "fitness"],
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
      ],
    };

    form.reset(dummyData);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      try {
        const urls = await uploadFiles(Array.from(files));
        const updated = [...form.getValues("images"), ...urls];
        form.setValue("images", updated);
      } catch (err) {
        if (err instanceof Error) {
          toast.error(err.message);
        }
      }
    }
  };

  const addTag = (tag: string) => {
    if (!tag) return;
    const updated = [...(form.getValues("tags") || []), tag];
    form.setValue("tags", updated);
  };

  const removeTag = (tag: string) => {
    const updated = (form.getValues("tags") || []).filter((t) => t !== tag);
    form.setValue("tags", updated);
  };

  const onSubmit = (data: ProductFormData) => {
    createProduct.mutate(data, {
      onSuccess: () => toast.success("Created product"),
      onError: (err) => {
        if (err instanceof Error) {
          toast.error(err.message);
        }
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={fillWithDummyData}
            disabled={createProduct.isPending}
          >
            Use Dummy Data
          </Button>
        </div>

        <Tabs defaultValue="basic">
          <TabsList>
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="electronics">
                            Electronics
                          </SelectItem>
                          <SelectItem value="clothing">Clothing</SelectItem>
                          <SelectItem value="books">Books</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={() => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add tag"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addTag(e.currentTarget.value.trim());
                              e.currentTarget.value = "";
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            const el = document.querySelector<HTMLInputElement>(
                              'input[placeholder="Add tag"]'
                            );
                            if (el?.value) {
                              addTag(el.value.trim());
                              el.value = "";
                            }
                          }}
                          size="sm"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {(form.watch("tags") || []).map((tag) => (
                          <Badge
                            key={tag}
                            className="flex items-center gap-1 cursor-pointer"
                            onClick={() => removeTag(tag)}
                          >
                            {tag}
                            <X className="h-3 w-3" />
                          </Badge>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(form.watch("images") || []).map((img, idx) => (
                    <div key={idx} className="relative group h-32 w-full">
                      <img
                        src={img}
                        alt="preview"
                        className="rounded object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          form.setValue(
                            "images",
                            form.getValues("images").filter((_, i) => i !== idx)
                          )
                        }
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button type="submit" disabled={createProduct.isPending}>
            {createProduct.isPending ? "Saving..." : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
