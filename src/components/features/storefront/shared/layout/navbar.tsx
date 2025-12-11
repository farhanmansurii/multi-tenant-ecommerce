'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Search,
  ShoppingBag, // Changed from ShoppingCart for a more fashion/retail feel
  User,        // Changed from User2
  Store
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StoreData } from '@/lib/domains/stores/types';
import { useStorefrontStore } from '@/lib/state/storefront/storefront-store';
import { ModeToggle } from '@/components/shared/common/theme-toggle';
import StoreFrontContainer from './container';

type StoreFrontHeaderProps = {
  storeData: StoreData;
  cartItemCount?: number;
};

export const StoreFrontHeader = ({ storeData, cartItemCount }: StoreFrontHeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // --- Data Logic ---
  const menuItems = useMemo(() => {
    const base = storeData?.slug ? `/stores/${storeData.slug}` : '';
    return [
      { name: 'Products', href: `${base}/products` }, // "Products" usually comes first in e-comm
      { name: 'Editorial', href: `${base}/about` }, // Renamed "About" to "Editorial" for premium feel
      { name: 'Support', href: `${base}/contact` }, // Renamed "Contact" to "Support"
    ];
  }, [storeData?.slug]);

  const fallbackCartCount = useStorefrontStore((state) => state.cart.totalQuantity);
  const customerProfile = useStorefrontStore((state) => {
    if (!storeData?.slug) return null;
    return state.customerProfile?.storeSlug === storeData.slug ? state.customerProfile : null;
  });

  const displayCartCount = cartItemCount ?? fallbackCartCount;

  // URLs
  const baseUrl = storeData?.slug ? `/stores/${storeData.slug}` : '';
  const cartHref = `${baseUrl}/cart`;
  const accountHref = storeData?.slug
    ? customerProfile
      ? `${baseUrl}/account`
      : `${baseUrl}/login`
    : '/account';

  // --- Scroll Effect ---
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <StoreFrontContainer
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-background text-foreground',
        isScrolled ? 'border-b border-zinc-200 dark:border-zinc-800' : 'border-b border-transparent'
      )}
    >
      {/* Industrial Layout:
         - Left: Mobile Menu + Links
         - Center: Logo (Absolute Center)
         - Right: Actions (Cart, Search, User)
      */}
      <div className="w-full h-16 md:h-20 px-4 md:px-8 flex items-center justify-between relative">

        {/* --- LEFT GROUP --- */}
        <div className="flex items-center gap-4 md:gap-8 flex-1 justify-start">

          {/* Mobile Menu Trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden -ml-2 rounded-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-xs font-mono uppercase tracking-widest hover:text-primary transition-colors hover:underline underline-offset-4 decoration-1",
                  pathname === item.href ? "text-foreground underline" : "text-muted-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* --- CENTER GROUP (Logo) --- */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <Link href={baseUrl || '/'}>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter hover:opacity-80 transition-opacity whitespace-nowrap">
              {storeData?.name || 'STORE'}
            </h1>
          </Link>
        </div>

        {/* --- RIGHT GROUP --- */}
        <div className="flex items-center gap-1 md:gap-2 flex-1 justify-end">

          {/* Theme Toggle */}
          <div className="hidden sm:block">
            <ModeToggle />
          </div>

          {/* Account */}
          <Link href={accountHref}>
            <Button variant="ghost" size="icon" className="rounded-none hover:bg-transparent hover:text-primary">
              <User className="h-5 w-5" />
            </Button>
          </Link>

          {/* Cart */}
          <Link href={cartHref}>
            <Button variant="ghost" className="rounded-none hover:bg-transparent hover:text-primary px-2 gap-2">
              <span className="hidden md:inline text-xs font-mono uppercase tracking-widest">Cart</span>
              <div className="relative">
                <ShoppingBag className="h-5 w-5" />
                {displayCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black dark:bg-white text-[9px] font-bold text-white dark:text-black">
                    {displayCartCount}
                  </span>
                )}
              </div>
            </Button>
          </Link>

        </div>
      </div>

      {/* --- Mobile Menu Overlay (Full Screen Slide) --- */}
      <div
        className={cn(
          "fixed inset-0 top-16 bg-background z-40 md:hidden transition-transform duration-300 ease-in-out border-t border-border",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col p-6 space-y-6 h-full">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Navigation</span>
            <nav className="flex flex-col gap-4 pt-4">
              <Link href={baseUrl || '/'} className="text-2xl font-black uppercase tracking-tight">Home</Link>
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-2xl font-black uppercase tracking-tight text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="pt-8 mt-auto border-t border-border pb-20">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium">Appearance</span>
              <ModeToggle />
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              <Link href={`${baseUrl}/login`}>Login</Link>
              <Link href={`${baseUrl}/contact`}>Help</Link>
            </div>
          </div>
        </div>
      </div>

    </StoreFrontContainer>
  );
};
