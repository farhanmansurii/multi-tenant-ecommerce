"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  icon?: React.ReactNode;
  loadingText?: string;
}

export function SystemButton({
  isLoading,
  icon,
  loadingText = "Processing...",
  children,
  className,
  ...props
}: SystemButtonProps) {
  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={cn(
        "group relative w-full flex items-center justify-center gap-4 bg-[#EFEFEF] text-[#111]",
        "border-[6px] border-[#111] p-4 md:p-6",
        "hover:bg-[#FF3300] hover:text-[#111] transition-colors duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
    >
      <div className="relative z-10 flex items-center gap-4">
        {isLoading ? <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin" /> : icon}
        <span className="font-bricolage md:text-2xl text-xl font-black uppercase tracking-tight">
          {isLoading ? loadingText : children}
        </span>
      </div>
    </button>
  );
}
