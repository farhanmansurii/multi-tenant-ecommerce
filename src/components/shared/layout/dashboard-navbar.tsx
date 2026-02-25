"use client";

import { KeyboardEvent, useState } from "react";
import Link from "next/link";
import { Bell, User, LogOut, Sparkles, MenuIcon, X, Search, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SearchCommand } from "@/components/features/dashboard/search-command";
import { useSessionContext } from "@/lib/session";
import { signOut } from "@/lib/auth/client";
import { StoreSwitcher } from "@/components/features/dashboard/store-switcher";

export const DashboardNavbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user } = useSessionContext();
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      setIsSearchOpen(true);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur xl:px-0">
      <div className="flex w-full items-center gap-2 sm:gap-3 md:gap-4 px-3 sm:px-4 py-3 md:px-6 lg:px-8">
        {/* Left: Sidebar trigger + Store switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          <SidebarTrigger
            collapsedIcon={MenuIcon}
            expandedIcon={X}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/40 transition"
          />
          <StoreSwitcher />
        </div>

        {/* Center: Search (hidden on mobile, click icon to open) */}
        <div className="hidden md:flex flex-1 items-center gap-3">
          <div className="relative flex w-full flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              readOnly
              placeholder="Search (⌘K)"
              className="h-10 rounded-xl border-border/40 bg-card/40 pl-10 text-sm text-foreground"
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button
            variant="secondary"
            className="h-10 px-4 text-sm font-semibold whitespace-nowrap"
            asChild
          >
            <Link href="/dashboard/stores/new" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              <span className="hidden lg:inline">New store</span>
            </Link>
          </Button>
        </div>

        {/* Mobile: Search icon only */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-muted-foreground hover:text-foreground"
          onClick={() => setIsSearchOpen(true)}
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Right: Actions (responsive spacing) */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto md:ml-0">
          {/* New Store button - mobile only (icon) */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:text-foreground h-9 w-9"
            asChild
          >
            <Link href="/dashboard/stores/new">
              <Store className="h-4 w-4" />
            </Link>
          </Button>

          {/* Notifications - hidden on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full p-0">
                <Avatar className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl border border-border/50">
                  <AvatarImage
                    src={typeof user?.image === "string" ? user.image : undefined}
                    alt={user?.name || "User"}
                  />
                  <AvatarFallback className="bg-muted text-muted-foreground font-semibold text-xs sm:text-sm">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 right-0 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full border-2 border-background bg-accent" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 px-2 py-2" align="end" forceMount>
              <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card px-3 py-2">
                <Avatar className="h-10 w-10 rounded-2xl border border-border/30">
                  <AvatarImage src={typeof user?.image === "string" ? user.image : undefined} />
                  <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col truncate text-sm">
                  <p className="font-semibold text-foreground">{user?.name || "Creator"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="flex items-center gap-2"
                onSelect={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-foreground" />
                Upgrade plan
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <SearchCommand open={isSearchOpen} setOpen={setIsSearchOpen} />
    </header>
  );
};
