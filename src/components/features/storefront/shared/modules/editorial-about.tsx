'use client';

import StoreFrontContainer from '../layout/container';
import { StoreData } from '@/lib/domains/stores/types';

export function StoreEditorial({ store }: { store: StoreData }) {
  // Get the first letter for the "Art" fallback
  const initial = store.name.charAt(0).toUpperCase();

  return (
    <StoreFrontContainer>
      <section className="bg-white text-black border-b border-zinc-200">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[600px]">

          {/* Left: The Manifesto Text */}
          <div className="p-8 md:p-20 flex flex-col justify-center border-b md:border-b-0 md:border-r border-zinc-200">
            <span className="text-xs font-mono uppercase tracking-widest mb-6 text-zinc-500">[ 01 — Philosophy ]</span>

            <h2 className="text-4xl md:text-5xl font-serif leading-[1.1] mb-8">
              "We believe in design that speaks louder than words."
            </h2>

            <div className="prose prose-lg prose-zinc max-w-none">
              <p className="text-zinc-600 leading-relaxed text-justify break-words hyphens-auto">
                {store.description || "Every collection tells a story. We curate pieces that transcend trends, focusing on the permanence of style and the integrity of materials. Our approach is simple: create objects that matter."}
              </p>
            </div>
          </div>

          {/* Right: Visual Fallback (Typography Art) */}
          <div className="bg-zinc-100 flex items-center justify-center p-12 overflow-hidden relative">
            {/* If you have an image, put it here. If not, we use this giant letter art */}
            <span className="text-[20rem] md:text-[30rem] font-black text-zinc-200 select-none leading-none">
              {initial}
            </span>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border border-black px-6 py-2 bg-white/50 backdrop-blur-md">
                <span className="text-xs font-bold uppercase tracking-widest">
                  {store.name} Atelier
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>
    </StoreFrontContainer>
  );
}
