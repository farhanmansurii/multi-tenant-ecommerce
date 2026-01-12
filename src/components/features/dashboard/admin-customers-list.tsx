'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { Users, Search, Mail, Calendar, ShoppingBag, Eye, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/shared/common/metric-card';
import { EmptyState } from '@/components/shared/common/empty-state';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { useCustomers } from '@/hooks/queries/use-customers';
import { QueryListSkeleton } from '@/lib/ui/query-skeleton';

interface AdminCustomersListProps {
  storeSlug: string;
}

export default function AdminCustomersList({ storeSlug }: AdminCustomersListProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading: loading } = useCustomers(storeSlug, searchQuery || undefined);

  const customers = data?.customers || [];
  const total = data?.total || 0;

  const handleSearch = () => {
    queryClient.refetchQueries({ queryKey: ['customers', storeSlug, searchQuery] });
  };

  const stats = {
    total: total,
    newThisMonth: customers.filter((c) => {
      const createdDate = new Date(c.createdAt);
      const now = new Date();
      return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
    }).length,
    withOrders: customers.filter((c) => c.orderCount > 0).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <MetricCard label="Total Customers" value={stats.total} icon={Users} color="blue" />
        <MetricCard label="New This Month" value={stats.newThisMonth} icon={UserPlus} color="emerald" />
        <MetricCard label="With Orders" value={stats.withOrders} icon={ShoppingBag} color="indigo" />
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSearch} className="flex-1 sm:flex-initial">Search</Button>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              queryClient.refetchQueries({ queryKey: ['customers', storeSlug, ''] });
            }}
            className="flex-1 sm:flex-initial"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription>
            All customers who have signed up or placed orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <QueryListSkeleton count={5} />
          ) : customers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No customers yet"
              description={
                searchQuery
                  ? "No customers match your search criteria. Try adjusting your search terms."
                  : "When customers sign up or place orders, they'll appear here."
              }
              variant={searchQuery ? "search" : "default"}
              secondaryAction={
                searchQuery
                  ? {
                      label: "Clear search",
                      onClick: () => setSearchQuery(""),
                    }
                  : undefined
              }
            />
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-3">
                {customers.map((customer) => (
                  <Card key={customer.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium flex-shrink-0">
                          {(customer.name?.[0] || customer.email[0]).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{customer.name || 'Guest'}</div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground truncate">
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{customer.email}</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t">
                        <div>
                          <div className="text-muted-foreground">Orders</div>
                          <Badge variant={customer.orderCount > 0 ? 'default' : 'secondary'} className="mt-1">
                            <ShoppingBag className="mr-1 h-3 w-3" />
                            {customer.orderCount}
                          </Badge>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Joined</div>
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>{new Date(customer.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <Link href={`/dashboard/stores/${storeSlug}/customers/${customer.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </Button>
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
                      <TableHead>Customer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                              {(customer.name?.[0] || customer.email[0]).toUpperCase()}
                            </div>
                            <span className="font-medium">{customer.name || 'Guest'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            {customer.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={customer.orderCount > 0 ? 'default' : 'secondary'}>
                            <ShoppingBag className="mr-1 h-3 w-3" />
                            {customer.orderCount} orders
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(customer.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/stores/${storeSlug}/customers/${customer.id}`}>
                              <Eye className="mr-1 h-4 w-4" />
                              View
                            </Link>
                          </Button>
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
    </div>
  );
}
