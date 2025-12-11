'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  X,
  User,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from '@/lib/utils'
import { useSessionContext } from '@/lib/session'
import { signOut } from '@/lib/auth/client'
import { motion, AnimatePresence } from 'framer-motion'
import { LogoIcon } from '@/components/logo' // Ensure you have this or replace with text

const navLinks = [
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Blog', href: '/blog' },
]

export const HeroHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated, user, isPending } = useSessionContext()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
  }

  // --- Sub-components for cleaner render ---

  const UserDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 ml-1 ring-2 ring-transparent focus-visible:ring-offset-1 focus-visible:ring-black/10">
          <Avatar className="h-8 w-8 border border-white/10">
            <AvatarImage src={typeof user?.image === 'string' ? user.image : undefined} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl bg-background/80 backdrop-blur-xl border-border/50 shadow-2xl">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user?.name}</span>
            <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
          <Link href="/dashboard">
            <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
          <Link href="/settings">
            <Settings className="h-4 w-4 mr-2" /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-500 rounded-lg cursor-pointer focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20">
          <LogOut className="h-4 w-4 mr-2" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      {/* Floating Pill Header
              Fixed at top, centered, with max-width
            */}
      <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="w-full max-w-5xl flex items-center justify-between rounded-full border border-black/5 dark:border-white/10 bg-white/70 dark:bg-black/70 backdrop-blur-xl shadow-lg shadow-black/5 ring-1 ring-white/20 pl-4 pr-2 py-2 transition-all duration-300">

          {/* Left: Logo & Desktop Links */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-foreground/90 hover:text-foreground transition-colors">
              <div className="bg-foreground text-background p-1 rounded-md">
                <LogoIcon className="w-4 h-4" />
              </div>
              <span className="hidden sm:block">Kiosk</span>
            </Link>

            <div className="hidden md:flex items-center gap-4 text-sm font-medium text-muted-foreground">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "hover:text-foreground transition-colors",
                    pathname === link.href && "text-foreground font-semibold"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {isPending ? (
              // Loading Skeleton
              <div className="h-9 w-24 bg-muted animate-pulse rounded-full" />
            ) : isAuthenticated ? (
              // Logged In State
              <>
                <Button asChild variant="ghost" size="sm" className="hidden sm:flex rounded-full text-muted-foreground hover:text-foreground">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <UserDropdown />
              </>
            ) : (
              // Logged Out State
              <>
                <Link href="/sign-in" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground px-3 transition-colors">
                  Login
                </Link>
                <Button asChild size="sm" className="rounded-full px-5 bg-foreground text-background hover:bg-foreground/90 shadow-lg shadow-black/10">
                  <Link href="/sign-up">
                    Start Selling
                  </Link>
                </Button>
              </>
            )}

            {/* Mobile Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full ml-1 text-muted-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-4 right-4 z-40 md:hidden"
          >
            <div className="bg-background/95 backdrop-blur-2xl border border-border/50 rounded-3xl shadow-2xl overflow-hidden p-4 flex flex-col gap-2 ring-1 ring-black/5">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 text-foreground font-medium transition-colors"
                >
                  {link.name}
                </Link>
              ))}

              <div className="h-px bg-border/50 my-2" />

              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 text-foreground font-medium">
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                  <button onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-500 font-medium w-full text-left">
                    <LogOut size={18} /> Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <Button asChild variant="outline" className="rounded-xl h-11" onClick={() => setMobileMenuOpen(false)}>
                    <Link href="/sign-in">Login</Link>
                  </Button>
                  <Button asChild className="rounded-xl h-11" onClick={() => setMobileMenuOpen(false)}>
                    <Link href="/sign-up">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
