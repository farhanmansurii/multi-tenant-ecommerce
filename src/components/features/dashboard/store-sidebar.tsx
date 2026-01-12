"use client";

import { useEffect } from "react";
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
  Store,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Image from "next/image";

interface StoreSidebarProps {
  slug: string;
  storeName?: string;
  storeLogo?: string | null;
  className?: string;
}

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
  badge?: string | number;
};

export function StoreSidebar({ slug, storeName, storeLogo, className }: StoreSidebarProps) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  // Close sidebar on mobile when pathname changes
  useEffect(() => {
    if (isMobile && setOpenMobile) {
      setOpenMobile(false);
    }
  }, [pathname, isMobile, setOpenMobile]);

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

    const handleLinkClick = () => {
      if (isMobile && setOpenMobile) {
        // Close sidebar on mobile when clicking a link
        setTimeout(() => {
          setOpenMobile(false);
        }, 100);
      }
    };

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
          <Link href={item.href} onClick={handleLinkClick} className="flex items-center gap-2.5">
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
      collapsible={isMobile ? "offcanvas" : "icon"}
      className={cn("border-r-0", className)}
    >
      
      <SidebarHeader className="border-b border-border/40 pb-0">
        <div className="flex items-center gap-3 px-2 py-3 pr-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:pr-2 group-data-[collapsible=icon]:gap-0">
          <div className="flex items-center gap-2.5 flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            {storeLogo ? (
              <div className="relative h-8 w-8 shrink-0 rounded-md overflow-hidden bg-muted border border-border/50">
                <Image
                  src={storeLogo}
                  alt={storeName || slug}
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              </div>
            ) : (
              <div className="h-8 w-8 shrink-0 rounded-md bg-gradient-to-br from-primary/20 to-primary/10 border border-border/50 flex items-center justify-center">
                <Store className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-foreground leading-tight">
                {storeName || slug}
              </p>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="w-full overflow-hidden">

        <SidebarSeparator className="my-1" />
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
      <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="transition-colors duration-200 hover:bg-muted/20"
                >
                  <Link
                    href="/dashboard/stores"
                    onClick={() => {
                      if (isMobile && setOpenMobile) {
                        setTimeout(() => {
                          setOpenMobile(false);
                        }, 100);
                      }
                    }}
                    className="flex items-center gap-2.5"
                  >
                    <ArrowLeft className="h-4 w-4 shrink-0" />
                    <span className="text-sm">Back to Stores</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
                onClick={() => {
                  if (isMobile && setOpenMobile) {
                    setTimeout(() => {
                      setOpenMobile(false);
                    }, 100);
                  }
                }}
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
