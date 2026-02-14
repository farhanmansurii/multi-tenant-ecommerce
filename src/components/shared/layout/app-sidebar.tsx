"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, LogOut, Store, User2, Plus } from "lucide-react";
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

const primaryFlow: NavItem[] = [
  {
    title: "Stores",
    url: "/dashboard/stores",
    icon: Building2,
    exact: false,
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
    } else if (item.onClick) {
      item.onClick();
    }
  };

  const buttonClasses = cn(
    "group w-full rounded-xl px-3 py-2 text-sm font-medium transition-colors",
    "hover:bg-muted/40 hover:text-foreground",
    isActive && "bg-muted/50 text-foreground",
  );

  const innerContent = (
    <div className="flex items-center gap-3">
      <item.icon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-foreground">{item.title}</span>
      </div>
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

export function AppSidebar({ className }: { className: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();

  useEffect(() => {
    if (isMobile && setOpenMobile) {
      setOpenMobile(false);
    }
  }, [pathname, isMobile, setOpenMobile]);

  return (
    <Sidebar variant="floating" side="left" className={className} collapsible="offcanvas">
      <SidebarHeader>
        <div className="px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center">
              <Store className="h-4 w-4 text-foreground" />
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-semibold leading-tight text-foreground">Dashboard</p>
              <p className="text-xs text-muted-foreground">Pick a store to manage</p>
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/70">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-2">
            <SidebarMenu>
              {primaryFlow.map((item) =>
                renderNavItem(item, pathname, router, isMobile ? setOpenMobile : undefined),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/70">Create</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-2">
            <SidebarMenu>
              {quickActions.map((item) =>
                renderNavItem(item, pathname, router, isMobile ? setOpenMobile : undefined),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/70">Account</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-2">
            <SidebarMenu>
              {accountItems.map((item) =>
                renderNavItem(item, pathname, router, isMobile ? setOpenMobile : undefined),
              )}
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
