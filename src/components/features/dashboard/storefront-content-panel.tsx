'use client';

import React from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { fetchProducts } from '@/lib/domains/products/service';
import { updateStorefrontContent } from '@/lib/domains/stores/storefront-content-client';
import { queryKeys } from '@/lib/query/keys';
import type { StoreData } from '@/lib/domains/stores/types';
import {
  defaultStorefrontContent,
  resolveStorefrontContent,
} from '@/components/storefront-ui/storefront/storefront-content';

function getSettings(store: StoreData) {
  return (store.settings || {}) as Record<string, any>;
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function deepMerge<T extends Record<string, any>>(base: T, patch: Record<string, unknown>): T {
  const out: any = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = deepMerge(asObject(out[k] ?? {}), asObject(v));
    } else {
      out[k] = v;
    }
  }
  return out;
}

export default function StorefrontContentPanel({ store }: { store: StoreData }) {
  const queryClient = useQueryClient();
  const settings = getSettings(store);

  const [mode, setMode] = React.useState<'defaults' | 'store' | 'custom'>(
    (settings.storefrontContentMode as any) || 'store'
  );

  const existingOverrides = (settings.storefrontContent || {}) as Record<string, any>;
  const effectiveContent = React.useMemo(() => resolveStorefrontContent(store) as any, [store]);

  const [overrides, setOverrides] = React.useState<Record<string, any>>(() => existingOverrides);

  const [jsonText, setJsonText] = React.useState<string>(() =>
    JSON.stringify(existingOverrides, null, 2)
  );
  const [jsonError, setJsonError] = React.useState<string>('');

  React.useEffect(() => {
    // If store settings update from the server, refresh form state.
    setOverrides(existingOverrides);
    setJsonText(JSON.stringify(existingOverrides, null, 2));
    setJsonError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.slug]);

  const setOverride = (path: string, value: any) => {
    setOverrides((prev) => {
      const next = { ...prev };
      const parts = path.split('.');
      let cur: any = next;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i]!;
        cur[key] = typeof cur[key] === 'object' && cur[key] !== null ? { ...cur[key] } : {};
        cur = cur[key];
      }
      cur[parts[parts.length - 1]!] = value;
      return next;
    });
  };

  const deleteOverride = (path: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      const parts = path.split('.');
      let cur: any = next;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i]!;
        if (!cur[key] || typeof cur[key] !== 'object') return next;
        cur[key] = { ...cur[key] };
        cur = cur[key];
      }
      const last = parts[parts.length - 1]!;
      if (cur && typeof cur === 'object') delete cur[last];
      return next;
    });
  };

  const resetSection = (sectionKey: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete (next as any)[sectionKey];
      return next;
    });
  };

  const productsQuery = useQuery({
    queryKey: ['store-products-minimal', store.slug],
    queryFn: () => fetchProducts(store.slug),
  });

  const mutation = useMutation({
    mutationFn: (payload: { storefrontContentMode: 'defaults' | 'store' | 'custom'; storefrontContent: Record<string, unknown> }) =>
      updateStorefrontContent(store.slug, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.stores.detail(store.slug), updated);
      toast.success('Storefront content saved');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to save'),
  });

  const handleSave = () => {
    mutation.mutate({
      storefrontContentMode: mode,
      storefrontContent: overrides,
    });
  };

  const handleSaveJson = () => {
    setJsonError('');
    let parsed: any;
    try {
      parsed = jsonText.trim() ? JSON.parse(jsonText) : {};
    } catch {
      setJsonError('Invalid JSON');
      return;
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      setJsonError('JSON must be an object');
      return;
    }

    mutation.mutate({
      storefrontContentMode: mode,
      storefrontContent: parsed,
    });
  };

  const handleApplyJsonToForm = () => {
    setJsonError('');
    let parsed: any;
    try {
      parsed = jsonText.trim() ? JSON.parse(jsonText) : {};
    } catch {
      setJsonError('Invalid JSON');
      return;
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      setJsonError('JSON must be an object');
      return;
    }
    setOverrides(parsed);
    toast.success('Applied JSON to overrides');
  };

  const canEdit = mode === 'custom';

  const inputWithPlaceholder = (opts: {
    label: string;
    path: string;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
  }) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label>{opts.label}</Label>
          <Button type="button" variant="ghost" size="sm" onClick={() => deleteOverride(opts.path)} disabled={!canEdit}>
            Reset
          </Button>
        </div>
        <Input
          value={opts.value}
          onChange={(e) => opts.onChange(e.target.value)}
          placeholder={opts.placeholder}
          disabled={!canEdit}
        />
      </div>
    );
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Storefront Content</CardTitle>
        <CardDescription>
          Customize your storefront sections. Mode controls whether defaults, store-derived copy, or your custom JSON is used.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-2">
          <Label>Mode</Label>
          <Select value={mode} onValueChange={(v) => setMode(v as any)}>
            <SelectTrigger className="w-full max-w-sm">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
              <SelectContent>
              <SelectItem value="defaults">defaults (theme defaults)</SelectItem>
              <SelectItem value="store">store (use store name/description)</SelectItem>
              <SelectItem value="custom">custom (use your custom JSON)</SelectItem>
            </SelectContent>
          </Select>
          {mode !== 'custom' ? (
            <div className="text-sm text-muted-foreground">
              Editing is disabled unless mode is <span className="font-medium">custom</span>.
            </div>
          ) : null}
          <div className="flex gap-2 pt-2">
            <Button asChild variant="outline">
              <Link href={`/stores/${store.slug}`} target="_blank">
                Preview Storefront
              </Link>
            </Button>
            {mode !== 'custom' ? (
              <Button type="button" onClick={() => setMode('custom')}>
                Enable Custom Editing
              </Button>
            ) : null}
          </div>
        </div>

        <Accordion type="multiple" className="border-t pt-6">
          <AccordionItem value="hero">
            <AccordionTrigger>Hero</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={() => resetSection('hero')} disabled={!canEdit}>
                  Reset Section
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inputWithPlaceholder({
                  label: 'Headline (override)',
                  path: 'hero.headline',
                  value: (overrides.hero?.headline as string) ?? '',
                  placeholder: effectiveContent.hero?.headline ?? defaultStorefrontContent.hero.headline,
                  onChange: (v) => setOverride('hero.headline', v),
                })}
                {inputWithPlaceholder({
                  label: 'Image URL (override)',
                  path: 'hero.imageUrl',
                  value: (overrides.hero?.imageUrl as string) ?? '',
                  placeholder: effectiveContent.hero?.imageUrl ?? defaultStorefrontContent.hero.imageUrl,
                  onChange: (v) => setOverride('hero.imageUrl', v),
                })}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inputWithPlaceholder({
                  label: 'Footer Left Label (override)',
                  path: 'hero.footerLeftLabel',
                  value: (overrides.hero?.footerLeftLabel as string) ?? '',
                  placeholder: effectiveContent.hero?.footerLeftLabel ?? defaultStorefrontContent.hero.footerLeftLabel,
                  onChange: (v) => setOverride('hero.footerLeftLabel', v),
                })}
                {inputWithPlaceholder({
                  label: 'Footer Right Label (override)',
                  path: 'hero.footerRightLabel',
                  value: (overrides.hero?.footerRightLabel as string) ?? '',
                  placeholder: effectiveContent.hero?.footerRightLabel ?? defaultStorefrontContent.hero.footerRightLabel,
                  onChange: (v) => setOverride('hero.footerRightLabel', v),
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="about">
            <AccordionTrigger>About</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={() => resetSection('about')} disabled={!canEdit}>
                  Reset Section
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inputWithPlaceholder({
                  label: 'Eyebrow (override)',
                  path: 'about.eyebrow',
                  value: (overrides.about?.eyebrow as string) ?? '',
                  placeholder: effectiveContent.about?.eyebrow ?? defaultStorefrontContent.about.eyebrow,
                  onChange: (v) => setOverride('about.eyebrow', v),
                })}
                {inputWithPlaceholder({
                  label: 'Footer Label (override)',
                  path: 'about.footerLabel',
                  value: (overrides.about?.footerLabel as string) ?? '',
                  placeholder: effectiveContent.about?.footerLabel ?? defaultStorefrontContent.about.footerLabel,
                  onChange: (v) => setOverride('about.footerLabel', v),
                })}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label>Headline (override)</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => deleteOverride('about.headline')} disabled={!canEdit}>
                    Reset
                  </Button>
                </div>
                <Textarea
                  value={(overrides.about?.headline as string) ?? ''}
                  onChange={(e) => setOverride('about.headline', e.target.value)}
                  placeholder={effectiveContent.about?.headline ?? defaultStorefrontContent.about.headline}
                  rows={3}
                  disabled={!canEdit}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="featured">
            <AccordionTrigger>Featured</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={() => resetSection('featured')} disabled={!canEdit}>
                  Reset Section
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inputWithPlaceholder({
                  label: 'Eyebrow (override)',
                  path: 'featured.eyebrow',
                  value: (overrides.featured?.eyebrow as string) ?? '',
                  placeholder: effectiveContent.featured?.eyebrow ?? defaultStorefrontContent.featured.eyebrow,
                  onChange: (v) => setOverride('featured.eyebrow', v),
                })}
                {inputWithPlaceholder({
                  label: 'Left Label (override)',
                  path: 'featured.leftLabel',
                  value: (overrides.featured?.leftLabel as string) ?? '',
                  placeholder: effectiveContent.featured?.leftLabel ?? defaultStorefrontContent.featured.leftLabel,
                  onChange: (v) => setOverride('featured.leftLabel', v),
                })}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inputWithPlaceholder({
                  label: 'Headline Top (override)',
                  path: 'featured.headlineTop',
                  value: (overrides.featured?.headlineTop as string) ?? '',
                  placeholder: effectiveContent.featured?.headlineTop ?? defaultStorefrontContent.featured.headlineTop,
                  onChange: (v) => setOverride('featured.headlineTop', v),
                })}
                {inputWithPlaceholder({
                  label: 'Headline Bottom (override)',
                  path: 'featured.headlineBottom',
                  value: (overrides.featured?.headlineBottom as string) ?? '',
                  placeholder: effectiveContent.featured?.headlineBottom ?? defaultStorefrontContent.featured.headlineBottom,
                  onChange: (v) => setOverride('featured.headlineBottom', v),
                })}
              </div>
              {inputWithPlaceholder({
                label: 'Right CTA Label (override)',
                path: 'featured.rightCtaLabel',
                value: (overrides.featured?.rightCtaLabel as string) ?? '',
                placeholder: effectiveContent.featured?.rightCtaLabel ?? defaultStorefrontContent.featured.rightCtaLabel,
                onChange: (v) => setOverride('featured.rightCtaLabel', v),
              })}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="zoom">
            <AccordionTrigger>Zoom Section</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm text-muted-foreground">Overrides only. Leave blank to inherit.</div>
                <Button type="button" variant="outline" size="sm" onClick={() => resetSection('zoomSection')} disabled={!canEdit}>
                  Reset Section
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Enabled (override)</div>
                  <div className="text-xs text-muted-foreground">
                    Current: {String(effectiveContent.zoomSection?.enabled ?? defaultStorefrontContent.zoomSection.enabled)}
                  </div>
                </div>
                <Switch
                  checked={typeof overrides.zoomSection?.enabled === 'boolean' ? !!overrides.zoomSection.enabled : (effectiveContent.zoomSection?.enabled ?? true)}
                  onCheckedChange={(v) => setOverride('zoomSection.enabled', v)}
                  disabled={!canEdit}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label>Image Source (override)</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={() => deleteOverride('zoomSection.imageSource')} disabled={!canEdit}>
                      Reset
                    </Button>
                  </div>
                  <Select
                    value={(overrides.zoomSection?.imageSource as any) || ''}
                    onValueChange={(v) => setOverride('zoomSection.imageSource', v)}
                    disabled={!canEdit}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Inherit (${effectiveContent.zoomSection?.imageSource ?? defaultStorefrontContent.zoomSection.imageSource})`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="static">static URL</SelectItem>
                      <SelectItem value="product">product by slug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(overrides.zoomSection?.imageSource ?? effectiveContent.zoomSection?.imageSource) === 'product' ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Label>Product (override)</Label>
                      <Button type="button" variant="ghost" size="sm" onClick={() => deleteOverride('zoomSection.productSlug')} disabled={!canEdit}>
                        Reset
                      </Button>
                    </div>
                    <Select
                      value={(overrides.zoomSection?.productSlug as string) ?? ''}
                      onValueChange={(v) => setOverride('zoomSection.productSlug', v)}
                      disabled={!canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            productsQuery.isLoading
                              ? 'Loading products...'
                              : `Inherit (${effectiveContent.zoomSection?.productSlug || '(none)'})`
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">(none)</SelectItem>
                        {(productsQuery.data || []).map((p) => (
                          <SelectItem key={p.slug} value={p.slug}>
                            {p.name} ({p.slug})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  inputWithPlaceholder({
                    label: 'Image URL (override)',
                    path: 'zoomSection.imageUrl',
                    value: (overrides.zoomSection?.imageUrl as string) ?? '',
                    placeholder: effectiveContent.zoomSection?.imageUrl ?? defaultStorefrontContent.zoomSection.imageUrl,
                    onChange: (v) => setOverride('zoomSection.imageUrl', v),
                  })
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inputWithPlaceholder({
                  label: 'Eyebrow (override)',
                  path: 'zoomSection.eyebrow',
                  value: (overrides.zoomSection?.eyebrow as string) ?? '',
                  placeholder: effectiveContent.zoomSection?.eyebrow ?? defaultStorefrontContent.zoomSection.eyebrow,
                  onChange: (v) => setOverride('zoomSection.eyebrow', v),
                })}
                {inputWithPlaceholder({
                  label: 'Headline (override)',
                  path: 'zoomSection.headline',
                  value: (overrides.zoomSection?.headline as string) ?? '',
                  placeholder: effectiveContent.zoomSection?.headline ?? defaultStorefrontContent.zoomSection.headline,
                  onChange: (v) => setOverride('zoomSection.headline', v),
                })}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label>Body (override)</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => deleteOverride('zoomSection.body')} disabled={!canEdit}>
                    Reset
                  </Button>
                </div>
                <Textarea
                  value={(overrides.zoomSection?.body as string) ?? ''}
                  onChange={(e) => setOverride('zoomSection.body', e.target.value)}
                  placeholder={effectiveContent.zoomSection?.body ?? defaultStorefrontContent.zoomSection.body}
                  rows={3}
                  disabled={!canEdit}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="catalog">
            <AccordionTrigger>Catalog</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={() => resetSection('catalog')} disabled={!canEdit}>
                  Reset Section
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inputWithPlaceholder({
                  label: 'Title (override)',
                  path: 'catalog.title',
                  value: (overrides.catalog?.title as string) ?? '',
                  placeholder: effectiveContent.catalog?.title ?? defaultStorefrontContent.catalog.title,
                  onChange: (v) => setOverride('catalog.title', v),
                })}
                {inputWithPlaceholder({
                  label: 'Filters Label (override)',
                  path: 'catalog.filtersLabel',
                  value: (overrides.catalog?.filtersLabel as string) ?? '',
                  placeholder: effectiveContent.catalog?.filtersLabel ?? defaultStorefrontContent.catalog.filtersLabel,
                  onChange: (v) => setOverride('catalog.filtersLabel', v),
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="marquee">
            <AccordionTrigger>Marquee</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={() => resetSection('marquee')} disabled={!canEdit}>
                  Reset Section
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inputWithPlaceholder({
                  label: 'Line 1 (override)',
                  path: 'marquee.line1',
                  value: (overrides.marquee?.line1 as string) ?? '',
                  placeholder: effectiveContent.marquee?.line1 ?? defaultStorefrontContent.marquee.line1,
                  onChange: (v) => setOverride('marquee.line1', v),
                })}
                {inputWithPlaceholder({
                  label: 'Line 2 (override)',
                  path: 'marquee.line2',
                  value: (overrides.marquee?.line2 as string) ?? '',
                  placeholder: effectiveContent.marquee?.line2 ?? defaultStorefrontContent.marquee.line2,
                  onChange: (v) => setOverride('marquee.line2', v),
                })}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inputWithPlaceholder({
                  label: 'Badge (override)',
                  path: 'marquee.badge',
                  value: (overrides.marquee?.badge as string) ?? '',
                  placeholder: effectiveContent.marquee?.badge ?? defaultStorefrontContent.marquee.badge,
                  onChange: (v) => setOverride('marquee.badge', v),
                })}
                {inputWithPlaceholder({
                  label: 'Headline (override)',
                  path: 'marquee.headline',
                  value: (overrides.marquee?.headline as string) ?? '',
                  placeholder: effectiveContent.marquee?.headline ?? defaultStorefrontContent.marquee.headline,
                  onChange: (v) => setOverride('marquee.headline', v),
                })}
              </div>
              {inputWithPlaceholder({
                label: 'Image URL (override)',
                path: 'marquee.imageUrl',
                value: (overrides.marquee?.imageUrl as string) ?? '',
                placeholder: effectiveContent.marquee?.imageUrl ?? defaultStorefrontContent.marquee.imageUrl,
                onChange: (v) => setOverride('marquee.imageUrl', v),
              })}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="textBlock">
            <AccordionTrigger>Text Block</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={() => resetSection('textBlock')} disabled={!canEdit}>
                  Reset Section
                </Button>
              </div>
              {inputWithPlaceholder({
                label: 'Headline (override)',
                path: 'textBlock.headline',
                value: (overrides.textBlock?.headline as string) ?? '',
                placeholder: effectiveContent.textBlock?.headline ?? defaultStorefrontContent.textBlock.headline,
                onChange: (v) => setOverride('textBlock.headline', v),
              })}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label>Paragraph 1 (override)</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={() => deleteOverride('textBlock.paragraphs')} disabled={!canEdit}>
                      Reset
                    </Button>
                  </div>
                  <Textarea
                    value={((overrides.textBlock?.paragraphs?.[0] as string) ?? '')}
                    onChange={(e) => setOverride('textBlock.paragraphs', [e.target.value, (overrides.textBlock?.paragraphs?.[1] as string) ?? ''])}
                    placeholder={(effectiveContent.textBlock?.paragraphs?.[0] as string) ?? defaultStorefrontContent.textBlock.paragraphs[0]}
                    rows={4}
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label>Paragraph 2 (override)</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={() => deleteOverride('textBlock.paragraphs')} disabled={!canEdit}>
                      Reset
                    </Button>
                  </div>
                  <Textarea
                    value={((overrides.textBlock?.paragraphs?.[1] as string) ?? '')}
                    onChange={(e) => setOverride('textBlock.paragraphs', [(overrides.textBlock?.paragraphs?.[0] as string) ?? '', e.target.value])}
                    placeholder={(effectiveContent.textBlock?.paragraphs?.[1] as string) ?? defaultStorefrontContent.textBlock.paragraphs[1]}
                    rows={4}
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="peelReveal">
            <AccordionTrigger>Peel Reveal</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={() => resetSection('peelReveal')} disabled={!canEdit}>
                  Reset Section
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inputWithPlaceholder({
                  label: 'Header Left (override)',
                  path: 'peelReveal.headerLeft',
                  value: (overrides.peelReveal?.headerLeft as string) ?? '',
                  placeholder: effectiveContent.peelReveal?.headerLeft ?? defaultStorefrontContent.peelReveal.headerLeft,
                  onChange: (v) => setOverride('peelReveal.headerLeft', v),
                })}
                {inputWithPlaceholder({
                  label: 'Footer Status (override)',
                  path: 'peelReveal.footerStatus',
                  value: (overrides.peelReveal?.footerStatus as string) ?? '',
                  placeholder: effectiveContent.peelReveal?.footerStatus ?? defaultStorefrontContent.peelReveal.footerStatus,
                  onChange: (v) => setOverride('peelReveal.footerStatus', v),
                })}
              </div>
              {inputWithPlaceholder({
                label: 'Image URL (override)',
                path: 'peelReveal.imageUrl',
                value: (overrides.peelReveal?.imageUrl as string) ?? '',
                placeholder: effectiveContent.peelReveal?.imageUrl ?? defaultStorefrontContent.peelReveal.imageUrl,
                onChange: (v) => setOverride('peelReveal.imageUrl', v),
              })}
              {inputWithPlaceholder({
                label: 'Headline (override)',
                path: 'peelReveal.headline',
                value: (overrides.peelReveal?.headline as string) ?? '',
                placeholder: effectiveContent.peelReveal?.headline ?? defaultStorefrontContent.peelReveal.headline,
                onChange: (v) => setOverride('peelReveal.headline', v),
              })}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inputWithPlaceholder({
                  label: 'Intro Left (override)',
                  path: 'peelReveal.introLeft',
                  value: (overrides.peelReveal?.introLeft as string) ?? '',
                  placeholder: effectiveContent.peelReveal?.introLeft ?? defaultStorefrontContent.peelReveal.introLeft,
                  onChange: (v) => setOverride('peelReveal.introLeft', v),
                })}
                {inputWithPlaceholder({
                  label: 'Intro Right (override)',
                  path: 'peelReveal.introRight',
                  value: (overrides.peelReveal?.introRight as string) ?? '',
                  placeholder: effectiveContent.peelReveal?.introRight ?? defaultStorefrontContent.peelReveal.introRight,
                  onChange: (v) => setOverride('peelReveal.introRight', v),
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="cta">
            <AccordionTrigger>CTA</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={() => resetSection('cta')} disabled={!canEdit}>
                  Reset Section
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inputWithPlaceholder({
                  label: 'Side Image Left URL (override)',
                  path: 'cta.sideImageLeftUrl',
                  value: (overrides.cta?.sideImageLeftUrl as string) ?? '',
                  placeholder: effectiveContent.cta?.sideImageLeftUrl ?? defaultStorefrontContent.cta.sideImageLeftUrl,
                  onChange: (v) => setOverride('cta.sideImageLeftUrl', v),
                })}
                {inputWithPlaceholder({
                  label: 'Side Image Right URL (override)',
                  path: 'cta.sideImageRightUrl',
                  value: (overrides.cta?.sideImageRightUrl as string) ?? '',
                  placeholder: effectiveContent.cta?.sideImageRightUrl ?? defaultStorefrontContent.cta.sideImageRightUrl,
                  onChange: (v) => setOverride('cta.sideImageRightUrl', v),
                })}
              </div>
              {inputWithPlaceholder({
                label: 'Main Image URL (override)',
                path: 'cta.mainImageUrl',
                value: (overrides.cta?.mainImageUrl as string) ?? '',
                placeholder: effectiveContent.cta?.mainImageUrl ?? defaultStorefrontContent.cta.mainImageUrl,
                onChange: (v) => setOverride('cta.mainImageUrl', v),
              })}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label>Side Copy (override)</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => deleteOverride('cta.sideCopy')} disabled={!canEdit}>
                    Reset
                  </Button>
                </div>
                <Textarea
                  value={(overrides.cta?.sideCopy as string) ?? ''}
                  onChange={(e) => setOverride('cta.sideCopy', e.target.value)}
                  placeholder={effectiveContent.cta?.sideCopy ?? defaultStorefrontContent.cta.sideCopy}
                  rows={3}
                  disabled={!canEdit}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inputWithPlaceholder({
                  label: 'Headline (override)',
                  path: 'cta.headline',
                  value: (overrides.cta?.headline as string) ?? '',
                  placeholder: effectiveContent.cta?.headline ?? defaultStorefrontContent.cta.headline,
                  onChange: (v) => setOverride('cta.headline', v),
                })}
                {inputWithPlaceholder({
                  label: 'Button Label (override)',
                  path: 'cta.buttonLabel',
                  value: (overrides.cta?.buttonLabel as string) ?? '',
                  placeholder: effectiveContent.cta?.buttonLabel ?? defaultStorefrontContent.cta.buttonLabel,
                  onChange: (v) => setOverride('cta.buttonLabel', v),
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="pdp">
            <AccordionTrigger>PDP Labels</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={() => resetSection('pdp')} disabled={!canEdit}>
                  Reset Section
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inputWithPlaceholder({
                  label: 'Chroma Label (override)',
                  path: 'pdp.chromaLabel',
                  value: (overrides.pdp?.chromaLabel as string) ?? '',
                  placeholder: effectiveContent.pdp?.chromaLabel ?? defaultStorefrontContent.pdp.chromaLabel,
                  onChange: (v) => setOverride('pdp.chromaLabel', v),
                })}
                {inputWithPlaceholder({
                  label: 'Size Label (override)',
                  path: 'pdp.sizeLabel',
                  value: (overrides.pdp?.sizeLabel as string) ?? '',
                  placeholder: effectiveContent.pdp?.sizeLabel ?? defaultStorefrontContent.pdp.sizeLabel,
                  onChange: (v) => setOverride('pdp.sizeLabel', v),
                })}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inputWithPlaceholder({
                  label: 'Add To Bag Label (override)',
                  path: 'pdp.addToBagLabel',
                  value: (overrides.pdp?.addToBagLabel as string) ?? '',
                  placeholder: effectiveContent.pdp?.addToBagLabel ?? defaultStorefrontContent.pdp.addToBagLabel,
                  onChange: (v) => setOverride('pdp.addToBagLabel', v),
                })}
                {inputWithPlaceholder({
                  label: 'Save Item Label (override)',
                  path: 'pdp.saveItemLabel',
                  value: (overrides.pdp?.saveItemLabel as string) ?? '',
                  placeholder: effectiveContent.pdp?.saveItemLabel ?? defaultStorefrontContent.pdp.saveItemLabel,
                  onChange: (v) => setOverride('pdp.saveItemLabel', v),
                })}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inputWithPlaceholder({
                  label: 'Specs Title (override)',
                  path: 'pdp.specsTitle',
                  value: (overrides.pdp?.specsTitle as string) ?? '',
                  placeholder: effectiveContent.pdp?.specsTitle ?? defaultStorefrontContent.pdp.specsTitle,
                  onChange: (v) => setOverride('pdp.specsTitle', v),
                })}
                {inputWithPlaceholder({
                  label: 'Related Label (override)',
                  path: 'pdp.relatedLabel',
                  value: (overrides.pdp?.relatedLabel as string) ?? '',
                  placeholder: effectiveContent.pdp?.relatedLabel ?? defaultStorefrontContent.pdp.relatedLabel,
                  onChange: (v) => setOverride('pdp.relatedLabel', v),
                })}
              </div>
              {inputWithPlaceholder({
                label: 'Shipping Title (override)',
                path: 'pdp.shippingTitle',
                value: (overrides.pdp?.shippingTitle as string) ?? '',
                placeholder: effectiveContent.pdp?.shippingTitle ?? defaultStorefrontContent.pdp.shippingTitle,
                onChange: (v) => setOverride('pdp.shippingTitle', v),
              })}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label>Shipping Body (override)</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => deleteOverride('pdp.shippingBody')} disabled={!canEdit}>
                    Reset
                  </Button>
                </div>
                <Textarea
                  value={(overrides.pdp?.shippingBody as string) ?? ''}
                  onChange={(e) => setOverride('pdp.shippingBody', e.target.value)}
                  placeholder={effectiveContent.pdp?.shippingBody ?? defaultStorefrontContent.pdp.shippingBody}
                  rows={3}
                  disabled={!canEdit}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="border-t pt-6 space-y-4">
          <div className="font-medium">Advanced JSON</div>
          <div className="text-sm text-muted-foreground">
            This JSON is saved into `store.settings.storefrontContent` (used when mode is `custom`).
          </div>
          <div className="space-y-2">
            <Label>storefrontContent (JSON)</Label>
            <Textarea value={jsonText} onChange={(e) => setJsonText(e.target.value)} rows={14} />
            {jsonError ? <div className="text-sm text-destructive">{jsonError}</div> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" onClick={handleApplyJsonToForm} disabled={mutation.isPending}>
              Apply JSON To Form
            </Button>
            <Button type="button" variant="outline" onClick={handleSaveJson} disabled={mutation.isPending}>
              Save JSON
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button onClick={handleSave} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save Overrides'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
