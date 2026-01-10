"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Percent,
  AlertCircle,
  Settings,
  ClipboardList,
  Tags,
  ArrowLeft,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface StoreSidebarProps {
  slug: string;
  storeName?: string;
  className?: string;
}

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
  badge?: string | number;
};

export function StoreSidebar({ slug, storeName, className }: StoreSidebarProps) {
  const pathname = usePathname();

  const primaryItems: NavItem[] = [
    {
      label: "Overview",
      href: `/dashboard/stores/${slug}`,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Orders",
      href: `/dashboard/stores/${slug}/orders`,
      icon: ClipboardList,
    },
    {
      label: "Products",
      href: `/dashboard/stores/${slug}/products`,
      icon: ShoppingBag,
    },
    {
      label: "Categories",
      href: `/dashboard/stores/${slug}/categories`,
      icon: Tags,
    },
  ];

  const secondaryItems: NavItem[] = [
    {
      label: "Customers",
      href: `/dashboard/stores/${slug}/customers`,
      icon: Users,
    },
    {
      label: "Discounts",
      href: `/dashboard/stores/${slug}/discounts`,
      icon: Percent,
    },
    {
      label: "Inventory",
      href: `/dashboard/stores/${slug}/inventory`,
      icon: AlertCircle,
    },
  ];

  const renderNavItem = (item: NavItem) => {
    const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          className={cn(
            "relative transition-colors duration-200",
            isActive && ["bg-muted/40 text-foreground", "dark:bg-muted/30"],
            !isActive && "hover:bg-muted/20",
          )}
        >
          <Link href={item.href} className="flex items-center gap-2.5">
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="text-sm">{item.label}</span>
            {item.badge && (
              <span className="ml-auto text-[10px] font-medium bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                {item.badge}
              </span>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar
      variant="floating"
      side="left"
      collapsible="icon"
      className={cn("border-r-0", className)}
    >
      <SidebarHeader className="pb-2 ">
        <div className="flex items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 hover:bg-muted/50 transition-colors"
                asChild
              >
                <Link href="/dashboard/stores">
                  <ArrowLeft className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Back to stores</TooltipContent>
          </Tooltip>

          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium truncate text-foreground">{storeName || slug}</p>
          </div>
        </div>
        <SidebarSeparator className="my-2 w-11/12 mx-auto" />
      </SidebarHeader>


      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{primaryItems.map(renderNavItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{secondaryItems.map(renderNavItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto pt-2">
      <SidebarSeparator className="my-2 w-11/12 mx-auto" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === `/dashboard/stores/${slug}/settings`}
              className={cn(
                "transition-colors duration-200",
                pathname === `/dashboard/stores/${slug}/settings` && [
                  "bg-muted/40 text-foreground",
                  "dark:bg-muted/30",
                ],
                pathname !== `/dashboard/stores/${slug}/settings` && "hover:bg-muted/20",
              )}
            >
              <Link
                href={`/dashboard/stores/${slug}/settings`}
                className="flex items-center gap-2.5"
              >
                <Settings className="h-4 w-4 shrink-0" />
                <span className="text-sm">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
