'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StoreData } from '@/lib/domains/stores/types';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import StoreFrontContainer from '../layout/container';
import { toast } from 'sonner';

interface NewsletterSectionProps {
  store: StoreData;
}

export function NewsletterSection({ store }: NewsletterSectionProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Mock subscription
    toast.success('Subscribed!', {
      description: "You'll now receive updates from " + store.name
    });
    setEmail('');
  };

  return (
    <section className="py-24 bg-muted/30 rounded-3xl my-12 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="container max-w-xl mx-auto px-6 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-background rounded-2xl shadow-sm mb-6 border border-border/50">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          Stay in the loop
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Subscribe to get updates on new products and special offers from {store.name}.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder="your@email.com"
            className="h-12 bg-background border-border/60"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" size="lg" className="h-12 px-8 font-medium">
            Subscribe
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-4">
          No spam, unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
