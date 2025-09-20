import StorefrontView from '@/components/storefront/storefront-view';

interface StorefrontPageProps {
  params: { slug: string };
}

export default function StorefrontPage({ params }: StorefrontPageProps) {
  return <StorefrontView slug={params.slug} />;
}
