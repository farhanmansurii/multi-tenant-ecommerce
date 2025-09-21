"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";

interface SelectorItem {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  color?: string | null;
  sortOrder?: number | null;
}

interface GeneralSelectorProps {
  value: string[];
  onChange: (itemIds: string[]) => void;
  storeSlug: string;
  disabled?: boolean;
  placeholder?: string;
  label: string;
  type: "categories" | "tags";
  fetchItems: (storeSlug: string) => Promise<SelectorItem[]>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createItem: (storeSlug: string, data: any) => Promise<SelectorItem>;
  queryKey: string;
  showImage?: boolean;
  showDescription?: boolean;
  showColor?: boolean;
  showSortOrder?: boolean;
}

export function GeneralSelector({
  value = [],
  onChange,
  storeSlug,
  disabled = false,
  placeholder = "Select items...",
  type,
  fetchItems,
  createItem,
  queryKey,
  showImage = true,
  showDescription = true,
  showColor = true,
  showSortOrder = false,
}: GeneralSelectorProps) {
  const [open, setOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: "",
    description: "",
    image: "",
    color: "#3b82f6",
    sortOrder: 0,
  });

  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: [queryKey, storeSlug],
    queryFn: () => fetchItems(storeSlug),
    enabled: !!storeSlug,
  });

  const selectedItems = items.filter((item) => value.includes(item.id));

  const handleCreateItem = async () => {
    if (!createFormData.name.trim()) {
      toast.error(`${type === "categories" ? "Category" : "Tag"} name is required`);
      return;
    }

    try {
      const newItem = await createItem(storeSlug, createFormData);

      // Update the query cache
      queryClient.setQueryData<SelectorItem[]>(
        [queryKey, storeSlug],
        (old) => (old ? [...old, newItem] : [newItem])
      );

      // Add the new item to the selection
      onChange([...value, newItem.id]);

      // Reset form
      setCreateFormData({
        name: "",
        description: "",
        image: "",
        color: "#3b82f6",
        sortOrder: 0,
      });
      setIsCreateOpen(false);
      toast.success(`${type === "categories" ? "Category" : "Tag"} created successfully`);
    } catch {
      toast.error(`Failed to create ${type === "categories" ? "category" : "tag"}`);
    }
  };

  const toggleItem = (itemId: string) => {
    if (value.includes(itemId)) {
      onChange(value.filter((id) => id !== itemId));
    } else {
      onChange([...value, itemId]);
    }
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedItems.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedItems.map((item) => (
                  <Badge
                    key={item.id}
                    variant="secondary"
                    className="text-xs"
                    style={{
                      backgroundColor: item.color + "20",
                      borderColor: item.color || undefined,
                      color: item.color || undefined,
                    }}
                  >
                    {item.name}
                  </Badge>
                ))}
              </div>
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={`Search ${type}...`} />
            <CommandList>
              <CommandEmpty>
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    No {type} found.
                  </p>
                  <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Create {type === "categories" ? "Category" : "Tag"}
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {isLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.name}
                      onSelect={() => toggleItem(item.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value.includes(item.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex items-center gap-2">
                        {showImage && item.image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-6 h-6 rounded object-cover"
                          />
                        ) : showColor ? (
                          <div
                            className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                            style={{
                              backgroundColor: item.color || "#3b82f6",
                            }}
                          >
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                        ) : null}
                        <span>{item.name}</span>
                      </div>
                    </CommandItem>
                  ))
                )}
                <CommandItem
                  onSelect={() => setIsCreateOpen(true)}
                  className="text-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create new {type === "categories" ? "category" : "tag"}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Create Item Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New {type === "categories" ? "Category" : "Tag"}</DialogTitle>
            <DialogDescription>
              Add a new {type === "categories" ? "category" : "tag"} to organize your products.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={createFormData.name}
                onChange={(e) =>
                  setCreateFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={`e.g., ${type === "categories" ? "Electronics, Clothing" : "New, Sale, Featured"}`}
              />
            </div>
            {showDescription && (
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={createFormData.description}
                  onChange={(e) =>
                    setCreateFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder={`Brief description of this ${type === "categories" ? "category" : "tag"}`}
                  rows={3}
                />
              </div>
            )}
            {showImage && (
              <div className="space-y-2">
                <Label>{type === "categories" ? "Category" : "Tag"} Image</Label>
                <ImageUpload
                  value={createFormData.image ? [createFormData.image] : []}
                  onChange={(urls) =>
                    setCreateFormData((prev) => ({ ...prev, image: urls[0] || "" }))
                  }
                  maxFiles={1}
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {showColor && (
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={createFormData.color}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({ ...prev, color: e.target.value }))
                    }
                  />
                </div>
              )}
              {showSortOrder && (
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={createFormData.sortOrder}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        sortOrder: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateItem}>
              Create {type === "categories" ? "Category" : "Tag"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
