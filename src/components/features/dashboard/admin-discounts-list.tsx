"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { Percent, Plus, Edit, Trash2, Calendar, Tag, CheckCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/shared/common/metric-card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Form } from "@/components/ui/form";
import { FormFieldHook } from "@/components/ui/form-field";

import { toast } from "sonner";
import { useDiscounts } from "@/hooks/queries/use-discounts";
import {
  useCreateDiscount,
  useUpdateDiscount,
  useDeleteDiscount,
  useToggleDiscountActive,
} from "@/hooks/mutations/use-discount-mutations";
import { QueryListSkeleton } from "@/lib/ui/query-skeleton";
import { EmptyState } from "@/components/shared/common/empty-state";

type Discount = {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  startsAt?: string | null;
  expiresAt?: string | null;
  isActive: boolean;
  description?: string | null;
  createdAt: string;
};

interface AdminDiscountsListProps {
  storeSlug: string;
  currency?: string;
}

const discountFormSchema = z
  .object({
    code: z
      .string()
      .min(1, "Code is required")
      .max(20, "Code too long")
      .regex(/^[A-Z0-9]+$/, "Alphanumeric uppercase only"),
    type: z.enum(["percentage", "fixed"]),
    value: z.coerce.number().positive("Must be positive"),
    minOrderAmount: z.coerce.number().nonnegative().optional(),
    maxDiscountAmount: z.coerce.number().nonnegative().optional(),
    usageLimit: z.coerce.number().int().positive().optional(),
    usageLimitPerCustomer: z.coerce.number().int().min(1).default(1),
    startsAt: z.string().optional(),
    expiresAt: z.string().optional(),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "percentage" && data.value > 100) {
        return false;
      }
      return true;
    },
    {
      message: "Percentage cannot exceed 100%",
      path: ["value"],
    },
  );

type DiscountFormValues = z.infer<typeof discountFormSchema>;

const defaultValues: DiscountFormValues = {
  code: "",
  type: "percentage",
  value: 10,
  minOrderAmount: undefined,
  maxDiscountAmount: undefined,
  usageLimit: undefined,
  usageLimitPerCustomer: 1,
  startsAt: "",
  expiresAt: "",
  description: "",
};

export default function AdminDiscountsList({
  storeSlug,
  currency = "INR",
}: AdminDiscountsListProps) {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountFormSchema) as any,
    defaultValues,
  });

  const { reset, watch, setValue } = form;
  const type = watch("type");

  const { data: discounts = [], isLoading: loading } = useDiscounts(storeSlug);
  const createDiscountMutation = useCreateDiscount(storeSlug);
  const updateDiscountMutation = useUpdateDiscount(storeSlug);
  const deleteDiscountMutation = useDeleteDiscount(storeSlug);
  const toggleActiveMutation = useToggleDiscountActive(storeSlug);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "code" && value.code) {
        const uppercased = value.code.toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (uppercased !== value.code) {
          setValue("code", uppercased);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  const onSubmit = async (data: DiscountFormValues) => {
    if (editingId) {
      updateDiscountMutation.mutate(
        { discountId: editingId, data },
        {
          onSuccess: () => {
            setIsEditOpen(false);
            setEditingId(null);
            reset(defaultValues);
          },
        },
      );
    } else {
      createDiscountMutation.mutate(data, {
        onSuccess: () => {
          setIsCreateOpen(false);
          reset(defaultValues);
        },
      });
    }
  };

  const handleEdit = (discount: Discount) => {
    setEditingId(discount.id);
    reset({
      code: discount.code,
      type: discount.type,
      value: discount.type === "percentage" ? discount.value : discount.value / 100,
      minOrderAmount: discount.minOrderAmount ? discount.minOrderAmount / 100 : undefined,
      maxDiscountAmount: discount.maxDiscountAmount ? discount.maxDiscountAmount / 100 : undefined,
      usageLimit: discount.usageLimit || undefined,
      usageLimitPerCustomer: 1,
      startsAt: discount.startsAt ? discount.startsAt.split("T")[0] : "",
      expiresAt: discount.expiresAt ? discount.expiresAt.split("T")[0] : "",
      description: discount.description || "",
    });
    setIsEditOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteDiscountMutation.mutate(id);
  };

  const handleToggleActive = (discount: Discount) => {
    toggleActiveMutation.mutate({ id: discount.id, isActive: discount.isActive });
  };

  const isExpired = (d: Discount | any) => d.expiresAt && new Date(d.expiresAt) < new Date();
  const activeCount = discounts.filter((d: any) => d.isActive && !isExpired(d)).length;

  const DiscountFormContent = () => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <FormFieldHook<DiscountFormValues>
          form={form}
          name="code"
          label="Discount Code"
          required
          type="text"
          placeholder="SAVE20"
          className="font-mono uppercase tracking-wider"
        />
        <FormFieldHook<DiscountFormValues>
          form={form}
          name="type"
          label="Discount Type"
          type="select"
          options={[
            { value: "percentage", label: "Percentage Off (%)" },
            { value: "fixed", label: "Fixed Amount (₹)" },
          ]}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormFieldHook<DiscountFormValues>
          form={form}
          name="value"
          label={type === "percentage" ? "Percentage Off" : "Discount Amount (₹)"}
          required
          type="number"
          placeholder={type === "percentage" ? "20" : "100"}
          min={1}
          max={type === "percentage" ? 100 : undefined}
          suffix={type === "percentage" ? "%" : "₹"}
        />
        <FormFieldHook<DiscountFormValues>
          form={form}
          name="minOrderAmount"
          label="Min Order Amount"
          type="number"
          placeholder="500"
          prefix="₹"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormFieldHook<DiscountFormValues>
          form={form}
          name="usageLimit"
          label="Total Usage Limit"
          type="number"
          placeholder="Unlimited"
        />
        <FormFieldHook<DiscountFormValues>
          form={form}
          name="maxDiscountAmount"
          label="Max Discount Amount"
          type="number"
          placeholder="1000"
          prefix="₹"
          description="Cap for percentage discounts"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormFieldHook<DiscountFormValues>
          form={form}
          name="startsAt"
          label="Starts At"
          type="date"
        />
        <FormFieldHook<DiscountFormValues>
          form={form}
          name="expiresAt"
          label="Expires At"
          type="date"
        />
      </div>
      <FormFieldHook<DiscountFormValues>
        form={form}
        name="description"
        label="Description (optional)"
        type="text"
        placeholder="e.g., 20% off on orders above ₹500"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <MetricCard label="Total Discounts" value={discounts.length} icon={Percent} color="blue" />
        <MetricCard label="Active" value={activeCount} icon={CheckCircle} color="emerald" />
        <MetricCard
          label="Total Redemptions"
          value={discounts.reduce((sum, d) => sum + d.usedCount, 0)}
          icon={Tag}
          color="purple"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) reset(defaultValues);
          }}
        >
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Create Discount
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Discount</DialogTitle>
              <DialogDescription>Create a new discount code for your store.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <DiscountFormContent />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createDiscountMutation.isPending}>
                    {createDiscountMutation.isPending ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Discount Codes</CardTitle>
          <CardDescription>Manage promotional codes for your store</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : discounts.length === 0 ? (
            <EmptyState
              icon={Percent}
              title="No discounts yet"
              description="Create your first discount code to attract more customers and boost sales."
              action={{
                label: "Create Discount",
                onClick: () => setIsCreateOpen(true),
                icon: Plus,
              }}
            />
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-3">
                {discounts.map((d: any) => (
                  <Card key={d.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-mono font-medium truncate">{d.code}</span>
                        </div>
                        {isExpired(d) ? (
                          <Badge variant="secondary">Expired</Badge>
                        ) : d.isActive ? (
                          <Badge variant="success">
                            <CheckCircle className="mr-1 h-3 w-3" /> Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="mr-1 h-3 w-3" /> Inactive
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t">
                        <div>
                          <div className="text-muted-foreground">Type</div>
                          <div className="font-medium capitalize mt-1">{d.type}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Value</div>
                          <div className="font-medium mt-1">
                            {d.type === "percentage" ? `${d.value}%` : `₹${d.value / 100}`}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Usage</div>
                          <div className="mt-1">
                            {d.usedCount}
                            {d.usageLimit ? `/${d.usageLimit}` : ""}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Expires</div>
                          <div className="mt-1">
                            {d.expiresAt ? (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(d.expiresAt).toLocaleDateString()}
                              </span>
                            ) : (
                              "Never"
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleToggleActive(d as Discount)}
                          disabled={toggleActiveMutation.isPending}
                        >
                          {d.isActive ? (
                            <>
                              <XCircle className="mr-2 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEdit(d as Discount)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="px-3">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-[95vw]">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Discount?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{d.code}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(d.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {discounts.map((d: any) => (
                      <TableRow key={d.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono font-medium">{d.code}</span>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{d.type}</TableCell>
                        <TableCell className="font-medium">
                          {d.type === "percentage" ? `${d.value}%` : `₹${d.value / 100}`}
                        </TableCell>
                        <TableCell>
                          {d.usedCount}
                          {d.usageLimit ? `/${d.usageLimit}` : ""}
                        </TableCell>
                        <TableCell>
                          {isExpired(d) ? (
                            <Badge variant="secondary">Expired</Badge>
                          ) : d.isActive ? (
                            <Badge variant="success">
                              <CheckCircle className="mr-1 h-3 w-3" /> Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle className="mr-1 h-3 w-3" /> Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {d.expiresAt ? (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(d.expiresAt).toLocaleDateString()}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleActive(d as Discount)}
                              disabled={toggleActiveMutation.isPending}
                            >
                              {d.isActive ? (
                                <XCircle className="h-4 w-4" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(d as Discount)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="max-w-[95vw]">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Discount?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete "{d.code}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(d.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setEditingId(null);
            reset(defaultValues);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Discount</DialogTitle>
            <DialogDescription>Update discount code details.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DiscountFormContent />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateDiscountMutation.isPending}>
                  {updateDiscountMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
