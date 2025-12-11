import type { Metadata } from 'next';
import { generateStoreMetadata } from '@/lib/metadata';
import { fetchStore } from '@/lib/domains/stores/service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageSquare, Send } from 'lucide-react';
import StoreFrontPageWrapper from '@/components/features/storefront/shared/layout/page-wrapper';
import StoreFrontContainer from '@/components/features/storefront/shared/layout/container';

interface ContactPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const store = await fetchStore(slug);

    return generateStoreMetadata({
      storeName: store.name,
      storeDescription: store.description,
      storeLogo: store.logo || undefined,
      title: `Contact ${store.name}`,
      description: `Get in touch with ${store.name}`,
      keywords: [store.name, 'contact', 'support', 'help'],
    });
  } catch {
    return generateStoreMetadata({
      storeName: slug,
      title: `Contact ${slug}`,
      description: `Contact ${slug}`,
      keywords: [slug, 'contact'],
    });
  }
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { slug } = await params;
  const store = await fetchStore(slug).catch(() => null);

  if (!store) {
    return <div>Store not found</div>;
  }

  return (
    <StoreFrontPageWrapper store={store}>
      <StoreFrontContainer>
        <div className="max-w-2xl mx-auto py-12 pb-24">

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Get in Touch</h1>
            <p className="text-lg text-muted-foreground">
              Have a question or need help? Send us a message and we&apos;ll get back to you as soon as possible.
            </p>
          </div>

          <Card className="border-border/60 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Send a Message
              </CardTitle>
              <CardDescription>
                Fill out the form below to contact {store.name} support.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Name
                    </label>
                    <Input id="name" placeholder="Your name" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Email
                    </label>
                    <Input id="email" type="email" placeholder="your@email.com" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Subject
                  </label>
                  <Input id="subject" placeholder="What is this regarding?" required />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Type your message here..."
                    className="min-h-[150px]"
                    required
                  />
                </div>

                <Button type="submit" className="w-full sm:w-auto gap-2">
                  <Send className="h-4 w-4" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Or email us directly at{' '}
              <a href={`mailto:${store.contactEmail}`} className="text-primary hover:underline font-medium">
                {store.contactEmail}
              </a>
            </p>
          </div>

        </div>
      </StoreFrontContainer>
    </StoreFrontPageWrapper>
  );
}
