'use client'
import React from 'react'

import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';

export default function GoogleSignInButton() {
  const handleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
  });
  }
  return (
    <Button onClick={handleSignIn}>GoogleSignInButton</Button>
  )
}

