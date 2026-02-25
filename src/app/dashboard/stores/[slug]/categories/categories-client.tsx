"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Tags,
  Search,
  MoreHorizontal,
  Check,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";

import { Category } from "@/lib/db/schema";
import { toast } from "sonner";
import DashboardLayout from "@/components/shared/layout/dashboard-container";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRequireAuth } from "@/lib/session";
import { fetchStore } from "@/lib/domains/stores/service";
import type { StoreData } from "@/lib/domains/stores/types";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "@/lib/domains/products/category-service";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/common/empty-state";
import { ColorPicker as BrandColorPicker } from "@/components/ui/color-picker";

const DEFAULT_FORM_DATA = {
  name: "",
  description: "",
  image: "",
  color: "#6366f1",
  sortOrder: 0,
};

// Use shared color picker for consistent theme controls across the dashboard.

const CategoryFormContent = ({
  data,
  onChange,
  errors,
}: {
  data: typeof DEFAULT_FORM_DATA;
  onChange: (updates: Partial<typeof DEFAULT_FORM_DATA>) => void;
  errors?: { name?: string };
}) => {
  return (
    <div className="grid gap-5 py-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-semibold">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g. Digital Assets, Merch"
          className={cn(errors?.name && "border-destructive focus-visible:ring-destructive")}
        />
        {errors?.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-semibold">
          Description
        </Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="What kind of products belong here?"
          rows={3}
          className="resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Accent Color</Label>
          <BrandColorPicker value={data.color} onChange={(color) => onChange({ color })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder" className="text-sm font-semibold">
            Sort Order
          </Label>
          <Input
            id="sortOrder"
            type="number"
            value={data.sortOrder}
            onChange={(e) => onChange({ sortOrder: parseInt(e.target.value) || 0 })}
            className="font-mono"
            min={0}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Category Image</Label>
        <div className="bg-muted/30 p-4 rounded-xl border border-dashed border-border/60 hover:border-border transition-colors">
          <SingleImageUpload
            value={data.image}
            onChange={(url) => onChange({ image: url || "" })}
          />
        </div>
      </div>
    </div>
  );
};

interface StoreCategoriesClientProps {
  slug: string;
  initialStore?: { id: string; name: string; slug: string; ownerUserId: string } | null;
}

export function StoreCategoriesClient({ slug, initialStore }: StoreCategoriesClientProps) {
  const { isAuthenticated, user, isPending: authPending } = useRequireAuth();
  const router = useRouter();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ["store", slug],
    queryFn: () => fetchStore(slug),
    enabled: !!slug && isAuthenticated && !!user,
    placeholderData: initialStore ? (initialStore as unknown as StoreData) : undefined,
    staleTime: 10 * 60 * 1000, // 10 minutes - store data doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes cache
  });

  // Use store from query or fallback to initialStore, then slug
  const displayStore = store || initialStore;
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories", slug],
    queryFn: () => fetchCategories(slug),
    enabled: !!slug && isAuthenticated && !!user,
  });
  const queryClient = useQueryClient();
  const createCategoryMutation = useMutation({
    mutationFn: (newData: typeof formData) => createCategory(slug, newData),
    onSuccess: (newCategory) => {
      queryClient.setQueryData<Category[]>(["categories", slug], (old) =>
        old ? [...old, newCategory] : [newCategory],
      );
      queryClient.refetchQueries({ queryKey: ["categories", slug] });
      setFormData(DEFAULT_FORM_DATA);
      setIsCreateOpen(false);
      toast.success("Category created successfully");
    },
    onError: () => toast.error("Failed to create category"),
  });
  const updateCategoryMutation = useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: typeof formData }) =>
      updateCategory(slug, categoryId, data),
    onSuccess: (updatedCategory) => {
      queryClient.setQueryData<Category[]>(
        ["categories", slug],
        (old) => old?.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat)) || [],
      );
      queryClient.refetchQueries({ queryKey: ["categories", slug] });
      setEditingCategory(null);
      setIsEditOpen(false);
      setFormData(DEFAULT_FORM_DATA);
      toast.success("Category updated");
    },
    onError: () => toast.error("Failed to update category"),
  });
  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId: string) => deleteCategory(slug, categoryId),
    onSuccess: (_, categoryId) => {
      queryClient.setQueryData<Category[]>(
        ["categories", slug],
        (old) => old?.filter((cat) => cat.id !== categoryId) || [],
      );
      queryClient.refetchQueries({ queryKey: ["categories", slug] });
      setDeleteId(null);
      toast.success("Category deleted");
    },
    onError: () => toast.error("Failed to delete category"),
  });

  const handleCreate = () => {
    if (!formData.name.trim()) return toast.error("Name is required");
    createCategoryMutation.mutate(formData);
  };
  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
      color: category.color || "#6366f1",
      sortOrder: category.sortOrder || 0,
    });
    setIsEditOpen(true);
  };
  const handleUpdate = () => {
    if (!formData.name.trim()) return toast.error("Name is required");
    if (!editingCategory) return;
    updateCategoryMutation.mutate({ categoryId: editingCategory.id, data: formData });
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const isLoading = authPending || (storeLoading && !initialStore) || categoriesLoading;

  if (!authPending && isAuthenticated && displayStore && displayStore.ownerUserId !== user?.id) {
    return (
      <DashboardLayout title="Access Denied" icon={<Tags />}>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <h2 className="text-xl font-bold">Permission Error</h2>
          <p className="text-muted-foreground">You do not have access to this store.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!authPending && !isAuthenticated) {
    return null;
  }

  return (
    <>
      <DashboardLayout
        title="Categories"
        desc="Organize your products for a better customer experience."
        breadcrumbs={[
          { label: "Stores", href: "/dashboard/stores" },
          { label: displayStore?.name || slug, href: `/dashboard/stores/${slug}` },
          { label: "Categories" },
        ]}
        icon={<Tags />}
        headerActions={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Category</DialogTitle>
                <DialogDescription>Add a new section to your store.</DialogDescription>
              </DialogHeader>
              <CategoryFormContent
                data={formData}
                onChange={(updates) => setFormData((prev) => ({ ...prev, ...updates }))}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createCategoryMutation.isPending}>
                  {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="space-y-6">
          {isLoading ? (
            <Loader text="Loading categories..." className="h-[50vh]" />
          ) : (
            <>
              {categories.length > 0 && (
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search categories..."
                    className="pl-9 bg-muted/40 border-border/60 focus:bg-background rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}

              {categories.length === 0 ? (
                <EmptyState
                  icon={Tags}
                  title="No categories found"
                  description="Categories help customers navigate your store. Create your first one to get started."
                  action={{
                    label: "Create First Category",
                    onClick: () => setIsCreateOpen(true),
                    icon: Plus,
                  }}
                />
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No categories match your search.
                </div>
              ) : (
                <motion.div
                  layout
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                  <AnimatePresence>
                    {filteredCategories.map((category, index) => {
                      const accentColor = category.color || "#6366f1";
                      return (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="group relative bg-card rounded-2xl border border-border/40 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
                          style={{ ["--accent-color" as string]: accentColor }}
                          onClick={() => openEditModal(category)}
                        >
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.08] transition-opacity duration-300 pointer-events-none bg-[var(--accent-color)]" />

                          <div
                            className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className="h-8 w-8 bg-background/80 backdrop-blur-md shadow-sm hover:bg-background"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => openEditModal(category)}>
                                  <Edit className="w-4 h-4 mr-2" /> Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => setDeleteId(category.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="aspect-[3/2] relative bg-muted/20">
                            {category.image ? (
                              <Image
                                src={category.image}
                                alt={category.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center">
                                <div
                                  className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm mb-3 transition-transform group-hover:scale-110 duration-300"
                                  style={{
                                    backgroundColor: `${accentColor}20`,
                                    color: accentColor,
                                  }}
                                >
                                  <ImageIcon className="h-7 w-7" />
                                </div>
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                                  No Image
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="p-5 relative">
                            <div className="flex justify-between items-start gap-4 mb-2">
                              <h3 className="font-bold text-lg truncate group-hover:text-[var(--accent-color)] transition-colors duration-300">
                                {category.name}
                              </h3>
                              <Badge
                                variant="secondary"
                                className="font-mono text-xs border-0 shrink-0"
                                style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                              >
                                #{category.sortOrder}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {category.description || (
                                <span className="italic opacity-70">No description provided.</span>
                              )}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              )}
            </>
          )}
        </div>
      </DashboardLayout>
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update details for <span className="font-medium">{editingCategory?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <CategoryFormContent
            data={formData}
            onChange={(updates) => setFormData((prev) => ({ ...prev, ...updates }))}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateCategoryMutation.isPending}>
              {updateCategoryMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteCategoryMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCategoryMutation.isPending ? "Deleting..." : "Delete Forever"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
