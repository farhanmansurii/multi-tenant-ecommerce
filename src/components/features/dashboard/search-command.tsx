"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  User,
  LayoutDashboard,
  Store,
  LogOut,
  ShoppingBag,
  Users,
  ExternalLink,
  ClipboardList,
} from "lucide-react";
import { useParams } from "next/navigation";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { signOut } from "@/lib/auth/client";

interface SearchCommandProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function SearchCommand({ open, setOpen }: SearchCommandProps) {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string | undefined;

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, [setOpen]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {slug && (
          <>
            <CommandGroup heading="Current Store">
              <CommandItem onSelect={() => runCommand(() => router.push(`/dashboard/stores/${slug}`))}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Store Dashboard</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push(`/dashboard/stores/${slug}/orders`))}>
                <ClipboardList className="mr-2 h-4 w-4" />
                <span>Orders</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push(`/dashboard/stores/${slug}/products`))}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                <span>Products</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push(`/dashboard/stores/${slug}/customers`))}>
                <Users className="mr-2 h-4 w-4" />
                <span>Customers</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push(`/dashboard/stores/${slug}/settings`))}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Store Settings</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => window.open(`/stores/${slug}`, '_blank'))}>
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>View Live Store</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
          </>
        )}
        <CommandGroup heading="Suggestions">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/stores"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Stores</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/profile"))}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Account">
          <CommandItem onSelect={() => runCommand(() => signOut())}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
