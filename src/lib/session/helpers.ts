"use server";

import { headers } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "../auth/server";

// Cache the session for the duration of the request
const getServerSession = cache(async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    console.error("Error getting server session:", error);
    return null;
  }
});

// Get session without redirecting (useful for conditional rendering)
export async function getSession() {
  return await getServerSession();
}

// Require authentication and redirect if not authenticated
export async function requireAuth() {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/");
  }
  return session;
}

// Require authentication and return null if not authenticated (useful for API routes)
export async function requireAuthOrNull() {
  const session = await getServerSession();
  if (!session || !session.user) {
    return null;
  }
  return session;
}

// Check if user is authenticated without throwing
export async function isAuthenticated() {
  const session = await getServerSession();
  return !!(session && session.user);
}

// Get user data safely
export async function getUser() {
  const session = await getServerSession();
  return session?.user || null;
}
