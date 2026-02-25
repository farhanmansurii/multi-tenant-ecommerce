"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, LogOut, Plus, Store, User2 } from "lucide-react";
import { toast } from "sonner";

import { signOut } from "@/lib/auth/client";
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
import UserDetailsSidebar from "./sidebar-user-details";

interface NavItem {
  title: string;
  url?: string;
  icon: React.ElementType;
  exact?: boolean;
  onClick?: () => void;
  isLogout?: boolean;
}

const primaryFlow: NavItem[] = [
  {
    title: "Stores",
    url: "/dashboard/stores",
    icon: Building2,
  },
];

const quickActions: NavItem[] = [
  {
    title: "New store",
    url: "/dashboard/stores/new",
    icon: Plus,
  },
];

const accountItems: NavItem[] = [
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User2,
  },
  {
    title: "Log out",
    icon: LogOut,
    isLogout: true,
  },
];

function renderNavItem(
  item: NavItem,
  pathname: string,
  router: ReturnType<typeof useRouter>,
  setOpenMobile?: (open: boolean) => void,
) {
  const isActive = item.url
    ? item.exact
      ? pathname === item.url
      : pathname.startsWith(item.url)
    : false;

  const handleClick = async () => {
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
      return;
    }

    item.onClick?.();
  };

  const buttonClasses = cn(
    "group w-full rounded-xl px-3 py-2 text-sm font-medium transition-colors",
    "hover:bg-muted/40 hover:text-foreground",
    isActive && "bg-muted/50 text-foreground",
  );

  const innerContent = (
    <div className="flex items-center gap-3">
      <item.icon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
      <span className="text-sm font-semibold text-foreground">{item.title}</span>
    </div>
  );

  if (item.isLogout || item.onClick) {
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          onClick={handleClick}
          className={cn(buttonClasses, item.isLogout && "text-destructive hover:bg-destructive/10")}
        >
          {innerContent}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild className={buttonClasses}>
        <Link href={item.url!} onClick={handleClick} className="flex items-center gap-3">
          {innerContent}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();

  useEffect(() => {
    if (isMobile && setOpenMobile) {
      setOpenMobile(false);
    }
  }, [pathname, isMobile, setOpenMobile]);

  return (
    <Sidebar
      variant="floating"
      side="left"
      className={cn("border-r border-border/50 bg-card/30", className)}
      collapsible="offcanvas"
    >
      <SidebarHeader className="border-b border-border/40">
        <div className="px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div className="flex min-w-0 flex-col">
              <p className="text-sm font-bold tracking-tight text-foreground">Dashboard</p>
              <p className="truncate text-xs text-muted-foreground">Manage your stores</p>
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-1 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-1">
            <SidebarMenu>
              {primaryFlow.map((item) =>
                renderNavItem(item, pathname, router, isMobile ? setOpenMobile : undefined),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            Create
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-1">
            <SidebarMenu>
              {quickActions.map((item) =>
                renderNavItem(item, pathname, router, isMobile ? setOpenMobile : undefined),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-1">
            <SidebarMenu>
              {accountItems.map((item) =>
                renderNavItem(item, pathname, router, isMobile ? setOpenMobile : undefined),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/40 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <UserDetailsSidebar />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
