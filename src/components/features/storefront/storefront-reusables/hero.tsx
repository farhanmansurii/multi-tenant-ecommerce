'use client';

import { StoreData } from '@/lib/domains/stores/types';
import { Button } from '@/components/ui/button';
import { ArrowDownRight, Globe } from 'lucide-react';
import Link from 'next/link';
import StoreFrontContainer from '../shared/layout/container';

export function StoreHero({ store }: { store: StoreData }) {
  return (
    <StoreFrontContainer className="min-h-[85vh] flex flex-col bg-background text-foreground border-b border-zinc-200 dark:border-zinc-800">
      {/* 1. Top Ticker / Meta Bar */}
      <div className="w-full border-b border-zinc-200 dark:border-zinc-800 py-3 px-4 md:px-8 flex flex-col md:flex-row justify-between items-start md:items-center text-xs font-mono uppercase tracking-widest gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <Globe className="w-3 h-3" /> WORLDWIDE SHIPPING
          </span>
        </div>
        <div className="opacity-60">
          COLLECTION 01 — {new Date().getFullYear()}
        </div>
      </div>

      {/* 2. Main Grid Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12">

        {/* Left: Typography (Heavy Visual Weight) */}
        <div className="lg:col-span-8 flex flex-col justify-between p-6 md:p-12 lg:p-20 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 relative bg-zinc-50/50 dark:bg-zinc-900/20">
          <div className="space-y-8 z-10 mt-12 md:mt-0">
            <h1 className="text-6xl sm:text-7xl md:text-8xl xl:text-9xl font-black tracking-tighter uppercase leading-[0.8] break-words">
              {store.name}
            </h1>

            <div className="max-w-xl pl-6 border-l-4 border-black dark:border-white">
              <p className="text-xl md:text-3xl font-light text-zinc-600 dark:text-zinc-400">
                {store.description}
              </p>
            </div>
          </div>

          <div className="mt-16 lg:mt-0">
            <Link href="#products">
              <Button size="lg" className="rounded-none h-14 px-10 text-base uppercase font-bold tracking-widest shadow-none border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-all">
                Shop Now <ArrowDownRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Right: Info / secondary stats */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="flex-1 border-b border-zinc-200 dark:border-zinc-800 p-8 flex flex-col justify-end">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Established</span>
            <span className="text-4xl font-serif italic">{new Date(store.createdAt).getFullYear()}</span>
          </div>
          <div className="flex-1 border-b border-zinc-200 dark:border-zinc-800 p-8 flex flex-col justify-end">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Category</span>
            <span className="text-2xl font-medium">Ready-to-Wear</span>
          </div>
          <div className="flex-1 p-8 flex flex-col justify-end bg-black text-white">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Status</span>
            <span className="text-2xl font-bold text-green-400 animate-pulse">● Open for Business</span>
          </div>
        </div>

      </div>
    </StoreFrontContainer>
  );
}
