import React from "react";
import { Store } from "lucide-react";

export default function Loading() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">

      {/* 1. Subtle Background Texture (Matches your Hero Section) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-1/2 top-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[100px]"></div>
      </div>

      {/* 2. Central Loading Card */}
      <div className="relative z-10 flex flex-col items-center">

        {/* Animated Icon Container */}
        <div className="relative mb-8">
          {/* Spinning Ring */}
          <div className="absolute inset-0 rounded-3xl border-2 border-dashed border-indigo-500/30 animate-[spin_10s_linear_infinite]"></div>

          {/* Icon Box */}
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl">
            <Store className="h-10 w-10 text-foreground" />

            {/* Pulse Dot */}
            <span className="absolute top-2 right-2 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </span>
          </div>
        </div>

        {/* Text & Progress */}
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-xl font-bold tracking-tight text-foreground/80">
            GumroadClone
          </h1>

          {/* Custom Progress Bar */}
          <div className="h-1 w-32 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-full origin-left animate-[scale-x_1.5s_ease-in-out_infinite] bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          </div>

          <p className="text-xs font-medium text-muted-foreground animate-pulse">
            Initializing storefront...
          </p>
        </div>

      </div>
    </div>
  );
}
