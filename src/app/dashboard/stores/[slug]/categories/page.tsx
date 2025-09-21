/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Image as ImageIcon, BarcodeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SingleImageUpload } from "@/components/ui/single-image-upload";
import { Loader } from "@/components/shared/common/loader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useRequireAuth } from "@/lib/session-context";
import { useDashboardParams } from "@/hooks/use-dashboard-params";
import { fetchCategories, createCategory } from "@/lib/services/category-api";
import { Category } from "@/lib/db/schema";
import { toast } from "sonner";
import DashboardLayout from "@/components/shared/layout/dashboard-container";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchStore } from "@/lib/services/store-api";

interface StoreCategoriesPageProps {
  params: Promise<{ slug: string }>;
}

export default function StoreCategoriesPage({
  params,
}: StoreCategoriesPageProps) {
  const { isAuthenticated, user, isPending } = useRequireAuth();
  const router = useRouter();
  const { slug, isLoading: paramsLoading } = useDashboardParams(params);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    color: "#3b82f6",
    sortOrder: 0,
  });

  // Queries
  const {
    data: store,
    isLoading: storeLoading,
  } = useQuery({
    queryKey: ["store", slug],
    queryFn: () => fetchStore(slug),
    enabled: !!slug && !paramsLoading && isAuthenticated && !!user,
  });

  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ["categories", slug],
    queryFn: () => fetchCategories(slug),
    enabled: !!slug && !paramsLoading && isAuthenticated && !!user,
  });

  // Mutation
  const queryClient = useQueryClient();
  const createCategoryMutation = useMutation({
    mutationFn: (newData: typeof formData) =>
      createCategory(slug, newData),
    onSuccess: (newCategory) => {
      queryClient.setQueryData<Category[]>(
        ["categories", slug],
        (old) => (old ? [...old, newCategory] : [newCategory])
      );
      setFormData({
        name: "",
        description: "",
        image: "",
        color: "#3b82f6",
        sortOrder: 0,
      });
      setIsCreateOpen(false);
      toast.success("Category created successfully");
    },
    onError: () => {
      toast.error("Failed to create category");
    },
  });

  const handleCreateCategory = () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    createCategoryMutation.mutate(formData);
  };

  if (isPending || paramsLoading || storeLoading || categoriesLoading) {
    return <Loader text="Loading categories..." className="min-h-screen" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Authentication Required</CardTitle>
            <CardDescription className="text-center">
              You must be logged in to manage categories.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push("/sign-in")}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!store || store.ownerId !== user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              Access Denied
            </CardTitle>
            <CardDescription className="text-center">
              You don&apos;t have permission to manage this store&apos;s categories.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Categories"
      desc="Organize your products with categories"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "Stores", href: "/dashboard" },
        { label: store?.name || "Store" ,href: "/dashboard"},
        { label: "Categories" },
      ]}
      icon={BarcodeIcon}
      headerActions={
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription>
                Add a new category to organize your products.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Electronics, Clothing"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description of this category"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Category Image</Label>
                <SingleImageUpload
                  value={formData.image}
                  onChange={(url) =>
                    setFormData((prev) => ({ ...prev, image: url || "" }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, color: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sortOrder: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={createCategoryMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCategory}
                disabled={createCategoryMutation.isPending}
              >
                {createCategoryMutation.isPending
                  ? "Creating..."
                  : "Create Category"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Categories Grid */}
      {categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first category to start organizing your products.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <div className="aspect-video relative">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: category.color + "20" }}
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                      style={{
                        backgroundColor: category.color || "blue",
                      }}
                    >
                      {category.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{category.name}</h3>
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: category.color + "20",
                      borderColor: category.color || "blue",
                      color: category.color || "blue",
                    }}
                  >
                    {category.sortOrder}
                  </Badge>
                </div>
                {category.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {category.description}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
