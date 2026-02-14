// components/features/storefront/store-footer.tsx
import StoreFrontContainer from '../layout/container';
import { StoreData } from '@/lib/domains/stores/types';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function StoreFooter({ store }: { store: StoreData }) {
  return (
    <footer className="bg-black text-white pt-20 pb-12">
      <div className="container max-w-[1400px] mx-auto px-4 md:px-8">

        {/* Top: Newsletter & Identity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          <div className="space-y-6">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
              {store.name}
            </h2>
            <p className="text-zinc-400 max-w-md text-lg">
              {store.description || "Redefining the modern aesthetic."}
            </p>
          </div>

          <div className="flex flex-col justify-end">
            <form className="w-full max-w-md border-b border-white/20 focus-within:border-white transition-colors pb-2">
              <div className="flex justify-between items-center">
                <input
                  type="email"
                  placeholder="SUBSCRIBE TO NEWSLETTER"
                  className="bg-transparent border-none outline-none text-white placeholder:text-zinc-600 w-full uppercase tracking-widest text-sm"
                />
                <button type="submit" className="text-xs font-bold uppercase">Submit</button>
              </div>
            </form>
          </div>
        </div>

        {/* Middle: Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 border-t border-white/10 pt-12">

          {/* Column 1: Contact */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Inquiries</h4>
            <div className="flex flex-col gap-2 text-sm text-zinc-300">
              <a href={`mailto:${store.contactEmail}`} className="hover:text-white transition-colors">
                {store.contactEmail}
              </a>
            </div>
          </div>

          {/* Column 2: Legal */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Legal</h4>
            <div className="flex flex-col gap-2 text-sm text-zinc-300">
              <Link href={`/stores/${store.slug}/terms`} className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href={`/stores/${store.slug}/privacy`} className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href={`/stores/${store.slug}/refunds`} className="hover:text-white transition-colors">Refund Policy</Link>
            </div>
          </div>

          {/* Column 3: Social (Dynamic based on data if available, mostly static structure) */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Follow</h4>
            <div className="flex flex-col gap-2 text-sm text-zinc-300">
              <a href="#" className="flex items-center gap-2 hover:text-white transition-colors group">
                Instagram <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-white transition-colors group">
                Twitter/X <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom: Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center pt-8 border-t border-white/10">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider">
            © {new Date().getFullYear()} {store.name}. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
              Site by {store.name} Digital
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
