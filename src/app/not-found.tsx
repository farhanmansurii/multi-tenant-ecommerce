'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-background font-sans">

      {/* 1. Background Texture (Consistent with App) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-1/2 top-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[120px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md text-center"
      >
        {/* 2. Hero Icon with Badge */}
        <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-[2rem] bg-muted/30 border border-border/50 shadow-2xl relative backdrop-blur-sm">
            {/* Inner Glow */}
            <div className="absolute inset-0 rounded-[2rem] border border-indigo-500/10"></div>

            <FileQuestion className="h-12 w-12 text-indigo-500/80" />

            {/* Floating 404 Badge */}
            <div className="absolute -bottom-3 -right-3 h-10 w-16 rounded-xl bg-background border border-border/60 shadow-lg flex items-center justify-center">
                <span className="text-sm font-bold font-mono text-foreground tracking-widest">404</span>
            </div>
        </div>

        {/* 3. Typography */}
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
          Page not found
        </h1>
        <p className="text-lg text-muted-foreground mb-10 text-balance leading-relaxed">
          The page you are looking for doesn&apos;t exist or has been moved. Check the URL or head back home.
        </p>

        {/* 4. Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.back()}
            className="rounded-full px-8 h-12 border-border/50 hover:bg-muted/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>

          <Button
            asChild
            size="lg"
            className="rounded-full px-8 h-12 shadow-xl shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
