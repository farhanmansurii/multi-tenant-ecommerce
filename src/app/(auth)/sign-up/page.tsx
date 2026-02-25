import type { Metadata } from "next";
import { commonMetadata } from "@/lib/metadata";
import SignUpPageClient from "./sign-up-page-client";

export const metadata: Metadata = commonMetadata.signUp || { title: "Sign Up - Kiosk" };

export default function SignUpPage() {
  return <SignUpPageClient />;
}
