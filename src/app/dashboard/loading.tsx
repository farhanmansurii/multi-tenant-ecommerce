'use client'

import React from "react";
import { Loader2, Terminal } from "lucide-react";
import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center   bg-background overflow-hidden selection:bg-primary/30 px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center w-full max-w-sm"
      >
        <div className="mb-8 inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-border bg-card text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-wider">
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
          System Booting
        </div>

        <div className="flex flex-col items-center space-y-6 w-full">
          <div className="space-y-2 text-center">
            <h1 className="text-xl font-medium tracking-tight text-foreground">
              Kiosk
            </h1>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              Synchronizing with secure servers...
            </p>
          </div>
          <div className="relative h-[2px] w-48 overflow-hidden bg-zinc-800/50 rounded-full">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut"
              }}
              className="absolute inset-0 w-1/2 bg-foreground"
            />
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 items-center">
            <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-600 italic">
                <Terminal className="h-3 w-3" />
                <span>loading_assets... OK</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-600 italic">
                <div className="h-1 w-1 rounded-full bg-success/60" />
                <span>auth_handshake... PENDING</span>
            </div>
        </div>
      </motion.div>

      <div className="absolute bottom-[-150px] left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}
