'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Globe,
  MapPin,
  Share2,
  CheckCircle2,
  Store,
  MoreHorizontal,
  Plus
} from 'lucide-react';
import StoreFrontContainer from '../layout/container';
import { toast } from 'sonner';
import { StoreData } from '@/lib/domains/stores';

interface StoreProfileHeaderProps {
  store: StoreData;
}

export function StoreProfileHeader({ store }: StoreProfileHeaderProps) {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied');
  };

  return (
    <div className="relative bg-background w-full">
      {/* 1. Banner */}
      <div
        className="h-48 md:h-64 w-full relative overflow-hidden"
        style={{
          background: store.primaryColor
            ? `linear-gradient(to bottom, ${store.primaryColor}, #09090b)`
            : 'linear-gradient(to bottom, #27272a, #09090b)'
        }}
      >
        {/* Noise Texture for premium feel */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
      </div>

      {/* 2. Main Profile Bar */}
      <div className="container max-w-5xl mx-auto px-4 md:px-6 pb-6">
        <div className="flex flex-col md:flex-row gap-6 items-start -mt-12 md:-mt-16 relative z-10">

          {/* A. Avatar (Fixed Size & Border) */}
          <div className="shrink-0 mx-auto md:mx-0">
            <div className="p-1.5 bg-background rounded-2xl shadow-sm">
              <Avatar className="h-32 w-32 md:h-40 md:w-40 rounded-xl border border-border/50 shadow-inner bg-muted">
                <AvatarImage
                  src={store.logo || ''}
                  alt={store.name}
                  className="object-cover"
                />
                <AvatarFallback className="text-4xl font-bold rounded-xl text-muted-foreground">
                  {store.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* B. Identity Block */}
          <div className="flex-1 pt-2 md:pt-16 text-center md:text-left space-y-3 min-w-0 w-full">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Name & Tagline */}
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center justify-center md:justify-start gap-2">
                  {store.name}
                  <CheckCircle2 className="w-5 h-5 text-blue-500 fill-blue-500/10" />
                </h1>
                {store.tagline && (
                  <p className="text-muted-foreground font-medium mt-1">
                    {store.tagline}
                  </p>
                )}
              </div>

              {/* Actions (Desktop: Right aligned, Mobile: Full width) */}
              <div className="flex items-center gap-2 justify-center md:justify-end w-full md:w-auto">
                <Button className="font-semibold shadow-sm min-w-[100px]" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Follow
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Meta Links */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-muted-foreground pt-1">
              {store.city && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 opacity-70" />
                  {store.city}, {store.country}
                </div>
              )}
              {store.website && (
                <a
                  href={store.website.startsWith('http') ? store.website : `https://${store.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  <Globe className="w-4 h-4 opacity-70" />
                  Website
                </a>
              )}
              <div className="flex items-center gap-1.5">
                <Store className="w-4 h-4 opacity-70" />
                {store.productCount ?? 0} Products
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
