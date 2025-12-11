import { createAuthClient } from "better-auth/react"

// Use environment variable for baseURL, with fallback for development
const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const authClient = createAuthClient({ baseURL })

export const { signIn, signUp, signOut, useSession, updateUser } = authClient
