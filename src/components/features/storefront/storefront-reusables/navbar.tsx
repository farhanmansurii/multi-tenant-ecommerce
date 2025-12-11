'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  User2,
  LogIn,
  Store
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { StoreData } from '@/lib/domains/stores/types';
import { useStorefrontStore } from '@/lib/state/storefront/storefront-store';
import { ModeToggle } from '@/components/shared/common/theme-toggle';
import StoreFrontContainer from './container';
import StoreLogo from './store-icon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

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
      { name: 'Home', href: base || '/' },
      { name: 'Products', href: `${base}/products` }, // Assuming you have a products page
      { name: 'Categories', href: `${base}#categories` },
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
  const searchHref = `${baseUrl}/search`; // Assuming you have a search page

  // Account Logic
  const accountHref = storeData?.slug
    ? customerProfile
      ? `${baseUrl}/account`
      : `${baseUrl}/login`
    : '/account';

  const AccountIcon = customerProfile ? User2 : LogIn;
  const accountLabel = customerProfile ? 'My Account' : 'Sign In';

  // --- Scroll Effect ---
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
        isScrolled
          ? 'bg-background/80 backdrop-blur-xl border-border/40 shadow-sm py-2'
          : 'bg-background/0 border-transparent py-4'
      )}
    >
      <StoreFrontContainer>
        <nav className="flex items-center justify-between">

          {/* --- Left: Logo --- */}
          <div className="flex-shrink-0 z-50">
            <StoreLogo
              src={storeData?.logo || '/store-logo.png'}
              alt={storeData?.name || 'Store Logo'}
              className="h-9 w-auto rounded-lg shadow-sm"
              isLink
              href={baseUrl || '/'}
            />
          </div>

          {/* --- Center: Desktop Navigation --- */}
          <div className="hidden md:flex items-center justify-center gap-1 absolute left-1/2 -translate-x-1/2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "text-sm font-medium transition-all rounded-full px-4",
                      isActive
                        ? "bg-foreground/5 text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                    )}
                  >
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* --- Right: Actions --- */}
          <div className="flex items-center gap-1 md:gap-2 z-50">
            <TooltipProvider>

              {/* Theme Toggle (Desktop) */}
              <div className="hidden sm:block">
                <ModeToggle />
              </div>

              {/* Search */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-full" asChild>
                    <Link href={searchHref}>
                      <Search className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Search Products</TooltipContent>
              </Tooltip>

              {/* Account */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-full" asChild>
                    <Link href={accountHref}>
                      <AccountIcon className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{accountLabel}</TooltipContent>
              </Tooltip>

              {/* Cart */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground rounded-full" asChild>
                    <Link href={cartHref}>
                      <ShoppingCart className="h-5 w-5" />
                      {displayCartCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-background animate-in zoom-in duration-300">
                          {displayCartCount}
                        </span>
                      )}
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Cart</TooltipContent>
              </Tooltip>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden ml-1"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>

            </TooltipProvider>
          </div>
        </nav>
      </StoreFrontContainer>

      {/* --- Mobile Menu Overlay --- */}
      <div
        className={cn(
          "fixed inset-x-0 top-[60px] p-4 bg-background/95 backdrop-blur-2xl border-b shadow-lg md:hidden transition-all duration-300 ease-in-out origin-top z-40",
          isMobileMenuOpen ? "opacity-100 scale-y-100 translate-y-0" : "opacity-0 scale-y-95 -translate-y-4 pointer-events-none"
        )}
      >
        <div className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
          <div className="h-px bg-border my-2" />
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm text-muted-foreground">Appearance</span>
            <ModeToggle />
          </div>
        </div>
      </div>

    </header>
  );
};
