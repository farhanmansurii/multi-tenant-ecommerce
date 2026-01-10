"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BoxIcon, Calendar, ChevronUp, Home, Inbox, Search, Settings, Store, User2 } from "lucide-react"

import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import UserDetailsSidebar from "./sidebar-user-details"

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
    exact: true,
  },
  {
    title: "Create Store",
    url: "/dashboard/stores/new",
    icon: Store,
  },
  {
    title: "Create Product",
    url: "#",
    icon: BoxIcon,
  },
  {
    title: "View My Stores",
    url: "/dashboard/stores",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
]

export function AppSidebar({ className }: { className: string }) {
  const pathname = usePathname();

  return (
    <Sidebar variant="floating" side="left" className={className} collapsible="offcanvas">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground/70">
            Kiosk
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.url
                  : pathname.startsWith(item.url);

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
                      <Link href={item.url} className="flex items-center gap-2.5">
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
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
  )
}
