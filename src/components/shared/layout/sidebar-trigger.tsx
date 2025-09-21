'use client'
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { MenuIcon } from "lucide-react";
import React, { JSX } from "react";

export function SidebarToggleButton(): JSX.Element {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      onClick={toggleSidebar}
      variant="ghost"
      size="icon"
      className="fixed top-4 right-4 z-50 rounded-full"
    >
      <MenuIcon className="h-5 w-5" />
    </Button>
  );
}
