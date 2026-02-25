"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { signOut, useSession } from "@/lib/auth/client";

import { ChevronUp, User2, CreditCard } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function UserDetailsSidebar() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <SidebarMenuButton asChild className="justify-center font-medium">
        <Link href='/sign-in'>
          Sign In
        </Link>
      </SidebarMenuButton>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={session.user.image || ""} />
            <AvatarFallback>
              {session.user.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="truncate max-w-[120px] font-medium">
            {session.user.name}
          </span>
          <ChevronUp className="ml-auto h-4 w-4 opacity-60" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        className="w-48 rounded-2xl shadow-lg"
      >
        <DropdownMenuItem className="gap-2">
          <User2 className="h-4 w-4 opacity-70" />
          <span>Account</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut()}
          variant="destructive"
          className="gap-2"
        >
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
