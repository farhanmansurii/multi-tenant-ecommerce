"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  LogOut,
  LayoutDashboard,
  Store,
  Settings,
  CreditCard,
  Bell,
  Search,
  Sparkles,
  MenuIcon,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSessionContext } from "@/lib/session";
import { signOut } from "@/lib/auth/client";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { SearchCommand } from "@/components/features/dashboard/search-command";

const navigationItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Stores",
    href: "/dashboard/stores",
    icon: Store,
  },

];

export const DashboardNavbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useSessionContext();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6 gap-4">

        <div className="flex items-center gap-2 md:gap-4">
          <SidebarTrigger collapsedIcon={MenuIcon} expandedIcon={X} className="-ml-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all" />
          <div className="h-6 w-px bg-border/60 hidden md:block" />
          <nav className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className="relative">
                  <span className={cn(
                    "relative z-10 flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors duration-200",
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
                  )}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute inset-0 rounded-md bg-muted" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2 md:gap-4">

          <div className="hidden md:flex items-center">
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-64 justify-start text-muted-foreground bg-muted/20 border-border/40 hover:bg-muted/40 hover:text-foreground"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="mr-2 h-4 w-4 opacity-50" />
              <span className="text-xs">Search or type command...</span>
              <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
            <SearchCommand open={isSearchOpen} setOpen={setIsSearchOpen} />
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-full">
              <Bell className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ml-1">
                  <Avatar className="h-9 w-9 border border-border/40 shadow-sm transition-opacity hover:opacity-90">
                    <AvatarImage src={typeof user?.image === 'string' ? user.image : undefined} alt={user?.name || "User"} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-medium">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                <div className="flex items-center gap-3 p-2">
                  <div className="rounded-full bg-muted/50 p-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={typeof user?.image === 'string' ? user.image : undefined} />
                      <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-semibold leading-none">{user?.name || "Creator"}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard/profile">
                      <User className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard/billing">
                      <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Billing & Plans</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard/settings">
                      <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <Sparkles className="mr-2 h-4 w-4 text-indigo-500" />
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">Upgrade to Pro</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
