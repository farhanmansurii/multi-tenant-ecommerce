'use client'
import React from 'react'


import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth/client';

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

