"use client";
import { useRequireAuth } from "@/lib/session-context";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isPending } = useRequireAuth();

  useEffect(() => {
    if (!isPending && !isAuthenticated) {
      redirect("/");
    }
  }, [isAuthenticated, isPending]);

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return children;
}
