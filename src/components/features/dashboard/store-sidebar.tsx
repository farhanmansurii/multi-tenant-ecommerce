'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Percent,
  AlertCircle,
  Settings,
  ClipboardList,
  Tags,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface StoreSidebarProps {
  slug: string;
  className?: string;
}

export function StoreSidebar({ slug, className }: StoreSidebarProps) {
  const pathname = usePathname();

  const items = [
    {
      label: 'Overview',
      href: `/dashboard/stores/${slug}`,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: 'Orders',
      href: `/dashboard/stores/${slug}/orders`,
      icon: ClipboardList,
    },
    {
      label: 'Products',
      href: `/dashboard/stores/${slug}/products`,
      icon: ShoppingBag,
    },
    {
      label: 'Categories',
      href: `/dashboard/stores/${slug}/categories`,
      icon: Tags,
    },
    {
      label: 'Customers',
      href: `/dashboard/stores/${slug}/customers`,
      icon: Users,
    },
    {
      label: 'Discounts',
      href: `/dashboard/stores/${slug}/discounts`,
      icon: Percent,
    },
    {
      label: 'Inventory',
      href: `/dashboard/stores/${slug}/inventory`,
      icon: AlertCircle,
    },
    {
      label: 'Settings',
      href: `/dashboard/stores/${slug}/settings`,
      icon: Settings,
    },
  ];

  return (
    <Sidebar className={className}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Store Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
