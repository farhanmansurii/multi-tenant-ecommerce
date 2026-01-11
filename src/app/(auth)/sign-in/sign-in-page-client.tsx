"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const MicrosoftIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4">
    <path fill="#F25022" d="M1 1h10v10H1z" />
    <path fill="#00A4EF" d="M13 1h10v10H13z" />
    <path fill="#7FBA00" d="M1 13h10v10H1z" />
    <path fill="#FFB900" d="M13 13h10v10H13z" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928-1.793 6.4-1.793 10.28 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.81 12.81 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

interface Provider {
  id: string;
  name: string;
  icon: React.ComponentType;
}

const providers: Provider[] = [
  { id: "google", name: "Google", icon: GoogleIcon },
  { id: "github", name: "GitHub", icon: GitHubIcon },
  { id: "microsoft", name: "Microsoft", icon: MicrosoftIcon },
  { id: "apple", name: "Apple", icon: AppleIcon },
  { id: "discord", name: "Discord", icon: DiscordIcon },
];

export default function SignInPageClient() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleProviderSignIn = async (providerId: string) => {
    setLoadingProvider(providerId);
    try {
      await signIn.social({ provider: providerId as any, callbackURL: "/dashboard" });
    } catch (error) {
      toast.error(`${providers.find((p) => p.id === providerId)?.name} sign in failed`);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-t from-background via-background  to-primary/5 overflow-hidden selection:bg-primary/30">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 w-full max-w-sm px-6"
      >
        <div className="flex flex-col space-y-8">
          <div className="space-y-2">
            <h1 className="text-xl font-medium tracking-tight text-foreground">Sign in to Kiosk</h1>
            <p className="text-[13px] text-muted-foreground">
              Welcome back. Enter your credentials to continue.
            </p>
          </div>

          <div className="grid gap-2">
            {providers.map((provider, index) => {
              const Icon = provider.icon;
              const isLoading = loadingProvider === provider.id;

              return (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Button
                    variant="ghost"
                    className="w-full h-10 justify-between group px-3 bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800/80 hover:border-zinc-700 hover:text-zinc-100 transition-all duration-200"
                    onClick={() => handleProviderSignIn(provider.id)}
                    disabled={!!loadingProvider}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <Icon />
                        )}
                      </div>
                      <span className="text-[13px] font-normal">{provider.name}</span>
                    </div>

                    <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:translate-x-0.5 group-hover:text-zinc-400 transition-all opacity-0 group-hover:opacity-100" />
                  </Button>
                </motion.div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-zinc-800/50">
            <p className="text-[12px] text-muted-foreground">
              New here?{" "}
              <Link
                href="/sign-up"
                className="hover:text-primary transition-colors font-medium underline-offset-4 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
