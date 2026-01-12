"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter} from "next/navigation";
import { Home, LogOut, Store, User2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { signOut } from "@/lib/auth/client";
import UserDetailsSidebar from "./sidebar-user-details";

interface NavItem {
  title: string;
  url?: string;
  icon: React.ElementType;
  exact?: boolean;
  onClick?: () => void;
  isLogout?: boolean;
}

const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    exact: true,
  },
  {
    title: "My Stores",
    url: "/dashboard/stores",
    icon: Store,
  },
  {
    title: "Create Store",
    url: "/dashboard/stores/new",
    icon: Store,
  },
];

const accountItems: NavItem[] = [
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User2,
  },
  {
    title: "Logout",
    icon: LogOut,
    isLogout: true,
  },
];

function renderNavItem(item: NavItem, pathname: string, router: ReturnType<typeof useRouter>, setOpenMobile?: (open: boolean) => void) {
  const isActive = item.url
    ? item.exact
      ? pathname === item.url
      : pathname.startsWith(item.url)
    : false;

  const handleClick = async () => {
    // Close mobile sidebar when navigating
    if (setOpenMobile) {
      setOpenMobile(false);
    }

    if (item.isLogout) {
      try {
        await signOut();
        router.push("/sign-in");
      } catch (error) {
        toast.error("Failed to sign out");
        console.error("Sign out error:", error);
      }
    } else if (item.onClick) {
      item.onClick();
    }
  };

  if (item.isLogout || item.onClick) {
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          onClick={handleClick}
          className={cn(
            "relative transition-colors duration-200 w-full",
            item.isLogout && "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-400",
            !item.isLogout && "hover:bg-muted/20"
          )}
        >
          <div className="flex items-center gap-2.5">
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="text-sm">{item.title}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        className={cn(
          "relative transition-colors duration-200",
          isActive && [
            "bg-muted/40 text-foreground",
            "dark:bg-muted/30",
          ],
          !isActive && "hover:bg-muted/20"
        )}
      >
        <Link
          href={item.url!}
          onClick={(e) => {
            handleClick();
            // Small delay to ensure navigation happens
            setTimeout(() => {
              if (setOpenMobile) {
                setOpenMobile(false);
              }
            }, 100);
          }}
          className="flex items-center gap-2.5"
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span className="text-sm">{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar({ className }: { className: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();

  // Close sidebar on mobile when pathname changes
  useEffect(() => {
    if (isMobile && setOpenMobile) {
      setOpenMobile(false);
    }
  }, [pathname, isMobile, setOpenMobile]);

  return (
    <Sidebar variant="floating" side="left" className={className} collapsible="offcanvas">
      <SidebarHeader className="border-b border-border/40 pb-0">
        <div className="px-2 py-3 pr-10">
          <h2 className="text-sm font-semibold text-foreground">Menu</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground/70">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => renderNavItem(item, pathname, router, isMobile ? setOpenMobile : undefined))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground/70">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => renderNavItem(item, pathname, router, isMobile ? setOpenMobile : undefined))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserDetailsSidebar />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
