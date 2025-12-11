'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Percent,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Tag,
  CheckCircle,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import { Form } from '@/components/ui/form';
import { FormFieldHook } from '@/components/ui/form-field';

import { toast } from 'sonner';

type Discount = {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
};

interface AdminDiscountsListProps {
  storeSlug: string;
  currency?: string;
}

const discountFormSchema = z.object({
  code: z.string()
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
}).refine((data) => {
  if (data.type === 'percentage' && data.value > 100) {
    return false;
  }
  return true;
}, {
  message: "Percentage cannot exceed 100%",
  path: ["value"],
});

type DiscountFormValues = z.infer<typeof discountFormSchema>;

const defaultValues: DiscountFormValues = {
  code: '',
  type: 'percentage',
  value: 10,
  minOrderAmount: undefined,
  maxDiscountAmount: undefined,
  usageLimit: undefined,
  usageLimitPerCustomer: 1,
  startsAt: '',
  expiresAt: '',
  description: '',
};

export default function AdminDiscountsList({ storeSlug, currency = 'INR' }: AdminDiscountsListProps) {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountFormSchema) as any,
    defaultValues,
  });

  const { reset, watch, setValue } = form;
  const type = watch('type');

  useEffect(() => {
    fetchDiscounts();
  }, [storeSlug]);

  // Auto-uppercase code
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'code' && value.code) {
        const uppercased = value.code.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (uppercased !== value.code) {
          setValue('code', uppercased);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stores/${storeSlug}/discounts`);
      if (!res.ok) throw new Error('Failed to fetch discounts');
      const data = await res.json();
      setDiscounts(data.discounts || []);
    } catch (error) {
      console.error('Failed to fetch discounts:', error);
      toast.error('Failed to load discounts');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: DiscountFormValues) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        // For percentage: use as-is. For fixed: convert rupees to cents
        value: data.type === 'percentage' ? data.value : data.value * 100,
        minOrderAmount: data.minOrderAmount ? data.minOrderAmount * 100 : null,
        maxDiscountAmount: data.maxDiscountAmount ? data.maxDiscountAmount * 100 : null,
        usageLimit: data.usageLimit || null,
        startsAt: data.startsAt || null,
        expiresAt: data.expiresAt || null,
        description: data.description || null,
      };

      const url = editingId
        ? `/api/stores/${storeSlug}/discounts`
        : `/api/stores/${storeSlug}/discounts`;

      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { id: editingId, ...payload } : payload;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed');
      }

      toast.success(editingId ? 'Discount updated' : 'Discount created');
      setIsCreateOpen(false);
      setIsEditOpen(false);
      setEditingId(null);
      reset(defaultValues);
      fetchDiscounts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (discount: Discount) => {
    setEditingId(discount.id);
    reset({
      code: discount.code,
      type: discount.type,
      value: discount.type === 'percentage' ? discount.value : discount.value / 100,
      minOrderAmount: discount.minOrderAmount ? discount.minOrderAmount / 100 : undefined,
      maxDiscountAmount: discount.maxDiscountAmount ? discount.maxDiscountAmount / 100 : undefined,
      usageLimit: discount.usageLimit || undefined,
      usageLimitPerCustomer: 1,
      startsAt: discount.startsAt ? discount.startsAt.split('T')[0] : '',
      expiresAt: discount.expiresAt ? discount.expiresAt.split('T')[0] : '',
      description: discount.description || '',
    });
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/stores/${storeSlug}/discounts?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Discount deleted');
      fetchDiscounts();
    } catch {
      toast.error('Failed to delete discount');
    }
  };

  const toggleActive = async (discount: Discount) => {
    try {
      await fetch(`/api/stores/${storeSlug}/discounts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: discount.id, isActive: !discount.isActive }),
      });
      fetchDiscounts();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const isExpired = (d: Discount) => d.expiresAt && new Date(d.expiresAt) < new Date();
  const activeCount = discounts.filter((d) => d.isActive && !isExpired(d)).length;

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
            { value: 'percentage', label: 'Percentage Off (%)' },
            { value: 'fixed', label: 'Fixed Amount (₹)' },
          ]}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormFieldHook<DiscountFormValues>
          form={form}
          name="value"
          label={type === 'percentage' ? 'Percentage Off' : 'Discount Amount (₹)'}
          required
          type="number"
          placeholder={type === 'percentage' ? '20' : '100'}
          min={1}
          max={type === 'percentage' ? 100 : undefined}
          suffix={type === 'percentage' ? '%' : '₹'}
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Discounts</CardDescription>
            <CardTitle className="text-2xl">{discounts.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-2xl text-green-600">{activeCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Redemptions</CardDescription>
            <CardTitle className="text-2xl text-blue-600">
              {discounts.reduce((sum, d) => sum + d.usedCount, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) reset(defaultValues);
        }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Create Discount</Button>
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
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Creating...' : 'Create'}
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
            <div className="flex flex-col items-center py-12">
              <Percent className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">No discounts yet</h3>
              <p className="text-muted-foreground">Create your first discount code.</p>
            </div>
          ) : (
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
                {discounts.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono font-medium">{d.code}</span>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{d.type}</TableCell>
                    <TableCell className="font-medium">
                      {d.type === 'percentage' ? `${d.value}%` : `₹${d.value / 100}`}
                    </TableCell>
                    <TableCell>
                      {d.usedCount}{d.usageLimit ? `/${d.usageLimit}` : ''}
                    </TableCell>
                    <TableCell>
                      {isExpired(d) ? (
                        <Badge variant="secondary">Expired</Badge>
                      ) : d.isActive ? (
                        <Badge className="bg-green-500/10 text-green-600">
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
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => toggleActive(d)}>
                          {d.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(d)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Discount?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{d.code}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(d.id)} className="bg-red-600">
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
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => {
        setIsEditOpen(open);
        if (!open) {
          setEditingId(null);
          reset(defaultValues);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Discount</DialogTitle>
            <DialogDescription>Update discount code details.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DiscountFormContent />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setIsEditOpen(false); setEditingId(null); }}>Cancel</Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
