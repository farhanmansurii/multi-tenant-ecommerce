import type { Metadata } from "next";
import { commonMetadata } from '@/lib/metadata'
import SignInPageClient from "./sign-in-page-client";


export const metadata: Metadata = commonMetadata.signIn

export default function SignInPage() {
  return <SignInPageClient />;
}
