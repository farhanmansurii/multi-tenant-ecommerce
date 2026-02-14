import type { Metadata } from 'next';
import { generateStoreMetadata } from '@/lib/metadata';
import { fetchStore } from '@/lib/domains/stores/service';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Calendar, ArrowUpRight, Info } from 'lucide-react';
import StoreFrontPageWrapper from '@/components/features/storefront/shared/layout/page-wrapper';
import { StoreProfileHeader } from '@/components/features/storefront/shared/layout/store-profile-header';

interface AboutPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const store = await fetchStore(slug);
    return generateStoreMetadata({
      storeName: store.name,
      storeDescription: store.description,
      storeLogo: store.logo || undefined,
      title: `About ${store.name}`,
    });
  } catch {
    return generateStoreMetadata({ storeName: slug, title: `About ${slug}` });
  }
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { slug } = await params;
  const store = await fetchStore(slug).catch(() => null);

  if (!store) return <div>Store not found</div>;

  // Date formatting
  const joinedDate = new Date(store.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <StoreFrontPageWrapper store={store}>
      <StoreProfileHeader store={store} />

      {/* Manual container to match Header width exactly */}
      <div className="container max-w-5xl mx-auto px-4 md:px-6 pb-24">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* LEFT COLUMN: Main Content (Takes up 2/3) */}
          <div className="md:col-span-2 space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Info className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">About Us</h2>
              </div>

              <div className="prose prose-zinc dark:prose-invert max-w-none leading-relaxed text-muted-foreground/90">
                {store.description ? (
                  <p className="whitespace-pre-line text-lg">{store.description}</p>
                ) : (
                  <div className="p-8 border border-dashed rounded-lg text-center bg-muted/20">
                    <p className="text-muted-foreground">This store hasn't added a bio yet.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Sidebar (Takes up 1/3) */}
          <div className="space-y-6">

            {/* Card 1: Details */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Store Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">

                {/* Contact */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-md text-primary shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-0.5">Contact</p>
                    <p className="text-sm font-medium truncate" title={store.contactEmail}>
                      {store.contactEmail}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Joined */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-md text-primary shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-0.5">Joined</p>
                    <p className="text-sm font-medium">{joinedDate}</p>
                  </div>
                </div>

                <Separator />
                <a
                  href={`mailto:${store.contactEmail}`}
                  className="flex items-center justify-between w-full group p-2 -mx-2 rounded-md hover:bg-muted transition-colors"
                >
                  <span className="text-sm font-medium">Email Store</span>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                </a>
              </CardContent>
            </Card>

            {/* Card 2: Newsletter / Updates */}
            <Card className="bg-zinc-900 text-zinc-50 border-zinc-800 dark:bg-card dark:text-card-foreground dark:border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Stay updated</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-400 dark:text-muted-foreground mb-4">
                  Get the latest updates and products directly to your inbox.
                </p>
                <Button className="w-full font-semibold" variant="secondary">
                  Subscribe
                </Button>
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </StoreFrontPageWrapper>
  );
}
