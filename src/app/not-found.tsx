'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Terminal } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-t from-background via-background  to-primary/5 overflow-hidden selection:bg-primary/30">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="flex flex-col space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-card text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Error 404
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-medium tracking-tight text-zinc-100">
                Page not found
              </h1>
              <p className="text-[13px] text-zinc-500 leading-relaxed">
                The coordinates you requested do not exist. It may have been moved or deleted.
              </p>
            </div>
          </div>

          {/* Action Grid */}
          <div className="grid gap-2">
            <Button
              asChild
              variant="ghost"
              className="w-full h-10 justify-start group px-3 bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800/80 hover:border-zinc-700 hover:text-zinc-100 transition-all duration-200"
            >
              <Link href="/">
                <Home className="mr-3 h-4 w-4 text-zinc-400 group-hover:text-zinc-100 transition-colors" />
                <span className="text-[13px] font-normal">Back to Dashboard</span>
              </Link>
            </Button>

            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="w-full h-10 justify-start group px-3 bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800/80 hover:border-zinc-700 hover:text-zinc-100 transition-all duration-200"
            >
              <ArrowLeft className="mr-3 h-4 w-4 text-zinc-400 group-hover:text-zinc-100 transition-colors" />
              <span className="text-[13px] font-normal">Return to previous page</span>
            </Button>
          </div>

          <div className="pt-4 border-t border-border/50 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-[12px] text-zinc-500 italic">
              <Terminal className="h-3.5 w-3.5" />
              <span>system_failure: path_unresolved</span>
            </div>
            <p className="text-[12px] text-zinc-500">
              Think this is a mistake?{' '}
              <Link
                href="/support"
                className="text-zinc-300 hover:text-primary transition-colors font-medium underline-offset-4 hover:underline"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
