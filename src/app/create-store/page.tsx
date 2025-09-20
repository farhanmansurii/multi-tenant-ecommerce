"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateStoreRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/stores/new");
  }, [router]);

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="">Redirecting to create store...</p>
      </div>
    </div>
  );
}
