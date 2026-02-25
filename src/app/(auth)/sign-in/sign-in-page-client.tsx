"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { signIn } from "@/lib/auth/client";
import { SystemLayout } from "@/components/ui/system-layout";
import { SystemContainer } from "@/components/ui/system-container";
import { SystemButton } from "@/components/ui/system-button";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6 md:h-8 md:w-8">
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

export default function SignInPageClient() {
  const [isLoading, setIsLoading] = useState(false);

  const handleProviderSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn.social({ provider: "google", callbackURL: "/dashboard" });
    } catch {
      toast.error(`Google sign in failed`);
      setIsLoading(false);
    }
  };

  return (
    <SystemLayout bgWord1="AUTH" bgWord2="GATE">
      <SystemContainer badgeText="RESTRICTED">
        <div className="space-y-4 mb-12 mt-4 ml-1">
          <div className="overflow-hidden">
            <h1 className="system-reveal-text font-bricolage text-5xl md:text-6xl font-black tracking-tighter text-[#EFEFEF] uppercase leading-[0.9]">
              Access <br /> Control.
            </h1>
          </div>
          <p className="font-space text-[#888] text-sm md:text-base leading-relaxed mt-4">
            Identify yourself to access the Kiosk multi-tenant platform. Unauthorized system access
            will be rigidly rejected.
          </p>
        </div>

        <div className="flex flex-col gap-6 w-full">
          <SystemButton
            onClick={() => {
              void handleProviderSignIn();
            }}
            isLoading={isLoading}
            icon={<GoogleIcon />}
            loadingText="Authenticating..."
          >
            Sign in with Google
          </SystemButton>
        </div>

        <div className="mt-12 pt-6 border-t-4 border-[#333]">
          <p className="font-space text-[#555] text-xs uppercase tracking-widest text-center">
            SECURE CONNECTION // ENCRYPTED HANDSHAKE
          </p>
          <div className="flex items-center justify-center mt-6 flex-col gap-4">
            <Link
              href="/"
              className="font-space text-xs text-[#EFEFEF] hover:text-[#FF3300] underline underline-offset-4 transition-colors uppercase font-bold tracking-widest"
            >
              RETURN TO SYSTEM HOME
            </Link>
            <Link
              href="/sign-up"
              className="font-space text-[10px] text-[#888] hover:text-[#EFEFEF] transition-colors uppercase font-bold tracking-widest"
            >
              &gt; Initiate New User Registration
            </Link>
          </div>
        </div>
      </SystemContainer>
    </SystemLayout>
  );
}
