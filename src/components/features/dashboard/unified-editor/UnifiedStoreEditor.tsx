"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ColorPicker } from "@/components/ui/color-picker";

import type { StoreData, StoreSettings } from "@/lib/domains/stores/types";
import { StoreFormData, storeSchema } from "@/lib/domains/stores/validation";
import { storeDataToFormValues, storeFormValuesToPayload } from "@/lib/domains/stores/form";
import { useUpdateStore } from "@/hooks/mutations/use-store-mutations";
import {
  updateStorefrontDraft,
  publishStorefrontDraft,
} from "@/lib/domains/stores/storefront-draft-client";
import { cn } from "@/lib/utils";

import {
  defaultStorefrontContent,
  resolveStorefrontContent,
  type StorefrontContentMode,
} from "@/components/storefront-ui/storefront/storefront-content";
import { toStorefrontThemeConfig } from "@/components/storefront-ui/storefront/theme-config";
import { ThemeConfigProvider } from "@/components/storefront-ui/storefront/ThemeConfigProvider";
import { Card, CardContent } from "@/components/ui/card";

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

const StorefrontHomeLazy = dynamic(
  () => import("@/components/storefront-ui/pages/StorefrontHome"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
        Loading preview…
      </div>
    ),
  },
);

function deepMerge<T extends Record<string, any>>(base: T, patch: Record<string, unknown>): T {
  const out: any = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = deepMerge(asObject(out[k] ?? {}), asObject(v));
    } else {
      out[k] = v;
    }
  }
  return out;
}

function setIn(prev: any, path: string, value: any) {
  const parts = path.split(".");
  const isIndex = (s: string) => /^\d+$/.test(s);
  const next = { ...(prev || {}) };
  let cur: any = next;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i]!;
    const existing = cur[k];
    const nextKey = parts[i + 1]!;
    if (Array.isArray(existing)) cur[k] = [...existing];
    else if (existing && typeof existing === "object") cur[k] = { ...existing };
    else cur[k] = isIndex(nextKey) ? [] : {};
    cur = cur[k];
  }
  const last = parts[parts.length - 1]!;
  if (Array.isArray(cur) && isIndex(last)) cur[Number(last)] = value;
  else cur[last] = value;
  return next;
}

function deleteIn(prev: any, path: string) {
  const parts = path.split(".");
  const isIndex = (s: string) => /^\d+$/.test(s);
  const next = { ...(prev || {}) };
  let cur: any = next;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i]!;
    if (!cur[k] || typeof cur[k] !== "object") return next;
    cur[k] = Array.isArray(cur[k]) ? [...cur[k]] : { ...cur[k] };
    cur = cur[k];
  }
  const last = parts[parts.length - 1]!;
  if (Array.isArray(cur) && isIndex(last)) cur[Number(last)] = undefined;
  else delete cur[last];
  return next;
}

function getSettings(store: StoreData): StoreSettings {
  return (store.settings || {}) as StoreSettings;
}

function isHexColor(v: string) {
  return /^#([0-9a-fA-F]{6})$/.test(v.trim());
}

function ColorField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <ColorPicker label={label} value={value} onChange={onChange} />
      {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

function previewThemeFromDraft(
  store: StoreData,
  draftMode: StorefrontContentMode,
  draft: Record<string, unknown>,
) {
  const baseContent = resolveStorefrontContent({
    ...store,
    settings: {
      ...(store.settings || {}),
      storefrontContentMode: draftMode,
      storefrontContent:
        draftMode === "custom" ? draft : (store.settings as any)?.storefrontContent,
    },
  } as any);

  // When draftMode is custom, resolveStorefrontContent already merges over store-derived.
  // We still allow partial drafts even if someone sets draftMode to store/defaults by applying patch on top.
  const content =
    draftMode === "custom" ? baseContent : (deepMerge(baseContent as any, asObject(draft)) as any);

  const theme = toStorefrontThemeConfig({
    ...store,
    settings: {
      ...(store.settings || {}),
      storefrontContentMode: "custom",
      storefrontContent: content as any,
    },
  } as any);

  return theme;
}

function SoftSectionNav({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items: Array<{ id: string; label: string; hint: string }> = [
    { id: "brand", label: "Brand", hint: "Name, URL, look" },
    { id: "checkout", label: "Checkout", hint: "Currency, shipping, payments" },
    { id: "policies", label: "Policies", hint: "Legal pages" },
    { id: "home", label: "Home Page", hint: "Hero, about, featured" },
    { id: "modules", label: "Modules", hint: "Marquee, CTA, zoom" },
    { id: "pdp", label: "Product Page", hint: "Labels and shipping copy" },
  ];

  return (
    <div className="space-y-2">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          onClick={() => onChange(it.id)}
          className={[
            "w-full text-left rounded-xl border px-3 py-2 transition",
            "hover:bg-muted/40",
            value === it.id ? "bg-muted/50 border-border" : "bg-background border-border/60",
          ].join(" ")}
        >
          <div className="flex items-baseline justify-between gap-3">
            <div className="font-medium">{it.label}</div>
            <div className="text-xs text-muted-foreground">{it.hint}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

function FieldRow({
  label,
  hint,
  children,
  onReset,
  resetDisabled,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  onReset?: () => void;
  resetDisabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Label className="text-sm">{label}</Label>
          {hint ? <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div> : null}
        </div>
        {onReset ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onReset}
            disabled={resetDisabled}
          >
            Reset
          </Button>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export default function UnifiedStoreEditor({
  store,
  featuredProducts,
}: {
  store: StoreData;
  featuredProducts: Array<{ id: string; slug: string; name: string; price: number; images: any }>;
}) {
  const controlClass = "w-full rounded-xl border-border/80 bg-background shadow-sm";
  const textareaClass = "w-full rounded-xl border-border/80 bg-background shadow-sm";

  const settings = getSettings(store);

  const updateStore = useUpdateStore(store.slug);

  const form = useForm<StoreFormData, any, StoreFormData>({
    resolver: zodResolver(storeSchema) as any,
    defaultValues: storeDataToFormValues(store),
    mode: "onChange",
  });

  const [section, setSection] = React.useState("brand");

  const initialDraftMode = (settings.storefrontDraftMode || "custom") as StorefrontContentMode;
  const initialDraft = (settings.storefrontDraftContent || {}) as Record<string, unknown>;

  const [draftMode, setDraftMode] = React.useState<StorefrontContentMode>(initialDraftMode);
  const [draft, setDraft] = React.useState<Record<string, unknown>>(initialDraft);
  const [draftSaving, setDraftSaving] = React.useState(false);
  const [draftDirty, setDraftDirty] = React.useState(false);
  const [draftVersion, setDraftVersion] = React.useState(0);

  const [isPreviewOn, setIsPreviewOn] = React.useState(false);

  const previewTheme = React.useMemo(
    () => (isPreviewOn ? previewThemeFromDraft(store, draftMode, draft) : null),
    [isPreviewOn, store, draftMode, draft],
  );

  const onSaveSettings = form.handleSubmit(async (values) => {
    const payload = storeFormValuesToPayload(values, store);
    await updateStore.mutateAsync(payload);
  });

  const updateDraftValue = (path: string, value: any) => {
    setDraft((prev) => setIn(prev, path, value));
    setDraftDirty(true);
    setDraftVersion((v) => v + 1);
  };

  const resetDraftValue = (path: string) => {
    setDraft((prev) => deleteIn(prev, path));
    setDraftDirty(true);
    setDraftVersion((v) => v + 1);
  };

  const saveDraft = async () => {
    if (draftSaving) return;
    setDraftSaving(true);
    try {
      await updateStorefrontDraft(store.slug, {
        storefrontDraftMode: draftMode,
        storefrontDraftContent: draft,
      });
      setDraftDirty(false);
      toast.success("Draft saved");
    } catch (e: any) {
      toast.error(e?.message || "Failed to save draft");
    } finally {
      setDraftSaving(false);
    }
  };

  const publishDraft = async () => {
    if (draftSaving) return;
    const ok = window.confirm("Publish draft to your live storefront?");
    if (!ok) return;
    setDraftSaving(true);
    try {
      await publishStorefrontDraft(store.slug, {
        storefrontDraftMode: draftMode,
        storefrontDraftContent: draft,
      });
      setDraftDirty(false);
      toast.success("Published");
    } catch (e: any) {
      toast.error(e?.message || "Failed to publish");
    } finally {
      setDraftSaving(false);
    }
  };

  // Lightweight autosave (draft only) to make editing feel instantaneous.
  React.useEffect(() => {
    if (!draftDirty) return;
    const t = setTimeout(() => {
      void saveDraft();
    }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftDirty, draftMode, draftVersion]);

  return (
    <Form {...form}>
      <div
        className={cn(
          "grid grid-cols-1 gap-4 lg:gap-6",
          isPreviewOn ? "xl:grid-cols-[minmax(400px,500px)_minmax(0,1fr)]" : "xl:grid-cols-1",
        )}
      >
        <div className="space-y-4 w-full">
          <SoftSectionNav value={section} onChange={setSection} />

          <div className="rounded-2xl border bg-background p-4 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold">Draft storefront</div>
                <div className="text-xs text-muted-foreground">
                  Autosaves. Publish when you are ready.
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2 order-1">
                  <div className="text-xs text-muted-foreground whitespace-nowrap">Preview</div>
                  <Switch checked={isPreviewOn} onCheckedChange={setIsPreviewOn} />
                </div>
                <Button asChild variant="outline" size="sm" className="order-2 sm:order-3">
                  <Link href={`/stores/${store.slug}`} target="_blank">
                    Open Live
                  </Link>
                </Button>
                <div className="flex gap-2 order-3 sm:order-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={saveDraft}
                    disabled={draftSaving}
                  >
                    {draftSaving ? "Saving…" : "Save"}
                  </Button>
                  <Button type="button" size="sm" onClick={publishDraft} disabled={draftSaving}>
                    Publish
                  </Button>
                </div>
              </div>
            </div>
            <Separator />
            <Tabs
              value={draftMode}
              onValueChange={(v) => {
                setDraftMode(v as any);
                setDraftDirty(true);
              }}
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="defaults">Defaults</TabsTrigger>
                <TabsTrigger value="store">From Store</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>
              <TabsContent value="defaults" className="text-xs text-muted-foreground pt-2">
                Uses theme defaults. Draft overrides still apply on top if you edit fields below.
              </TabsContent>
              <TabsContent value="store" className="text-xs text-muted-foreground pt-2">
                Uses your store name/description as the base. Draft overrides still apply on top.
              </TabsContent>
              <TabsContent value="custom" className="text-xs text-muted-foreground pt-2">
                Fully custom. Only the fields you edit are stored.
              </TabsContent>
            </Tabs>
          </div>

          <div className="rounded-2xl border bg-background p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold">Store settings</div>
                <div className="text-xs text-muted-foreground">
                  These affect checkout and emails. Saved separately from draft content.
                </div>
              </div>
              <Button type="button" onClick={onSaveSettings} disabled={updateStore.isPending}>
                {updateStore.isPending ? "Saving…" : "Save Settings"}
              </Button>
            </div>
          </div>

          <Card className="rounded-2xl">
            <CardContent className="p-4 space-y-4">
              {section === "brand" ? (
                <>
                  <FormField
                    control={form.control}
                    name="storeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store name</FormLabel>
                        <FormDescription>
                          Shows in the storefront header and metadata.
                        </FormDescription>
                        <FormControl>
                          <Input {...field} className={controlClass} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="storeSlug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store URL (slug)</FormLabel>
                        <FormDescription>Locked after creation.</FormDescription>
                        <FormControl>
                          <Input {...field} disabled className={controlClass} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormDescription>
                          Used for SEO and can feed default homepage copy.
                        </FormDescription>
                        <FormControl>
                          <Textarea rows={4} {...field} className={textareaClass} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Support email</FormLabel>
                          <FormDescription>Where customers can reach you.</FormDescription>
                          <FormControl>
                            <Input type="email" {...field} className={controlClass} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand color</FormLabel>
                          <FormDescription>
                            Accent color for buttons, highlights, and store chrome.
                          </FormDescription>
                          <FormControl>
                            <div>
                              <ColorField label="" value={field.value} onChange={field.onChange} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              ) : null}

              {section === "checkout" ? (
                <>
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <FormDescription>Shown on prices and checkout.</FormDescription>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className={controlClass}>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD - US Dollar</SelectItem>
                              <SelectItem value="EUR">EUR - Euro</SelectItem>
                              <SelectItem value="GBP">GBP - British Pound</SelectItem>
                              <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                              <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                              <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                              <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentMethods"
                    render={({ field }) => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      const toggle = (id: "stripe" | "cod", checked: boolean) => {
                        if (checked) field.onChange([...new Set([...current, id])]);
                        else field.onChange(current.filter((m: any) => m !== id));
                      };

                      return (
                        <FormItem>
                          <FormLabel>Payment methods</FormLabel>
                          <FormDescription>
                            Controls what customers can use at checkout.
                          </FormDescription>
                          <FormControl>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-border/80 bg-muted/20 p-3">
                              {[
                                { id: "stripe" as const, label: "Stripe (card)" },
                                { id: "cod" as const, label: "Cash on delivery" },
                              ].map((m) => (
                                <label key={m.id} className="flex items-center gap-2 text-sm">
                                  <Checkbox
                                    checked={current.includes(m.id)}
                                    onCheckedChange={(v) => toggle(m.id, !!v)}
                                  />
                                  <span>{m.label}</span>
                                </label>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="shippingEnabled"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shipping</FormLabel>
                          <FormDescription>Enable shipping options at checkout.</FormDescription>
                          <FormControl>
                            <div className="flex items-center justify-between rounded-xl border border-border/80 bg-background shadow-sm px-3 py-2">
                              <div className="text-sm">Enable shipping</div>
                              <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="codEnabled"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cash on delivery</FormLabel>
                          <FormDescription>Show COD as a checkout option.</FormDescription>
                          <FormControl>
                            <div className="flex items-center justify-between rounded-xl border border-border/80 bg-background shadow-sm px-3 py-2">
                              <div className="text-sm">Enable COD</div>
                              <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {form.watch("shippingEnabled") ? (
                    <FormField
                      control={form.control}
                      name="freeShippingThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Free shipping threshold</FormLabel>
                          <FormDescription>Leave blank to disable.</FormDescription>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              className={controlClass}
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const v = e.target.value;
                                field.onChange(v === "" ? undefined : Number(v));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : null}
                </>
              ) : null}

              {section === "policies" ? (
                <>
                  <FormField
                    control={form.control}
                    name="termsOfService"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terms of service</FormLabel>
                        <FormControl>
                          <Textarea rows={5} {...field} className={textareaClass} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="privacyPolicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Privacy policy</FormLabel>
                        <FormControl>
                          <Textarea rows={5} {...field} className={textareaClass} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="refundPolicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Refund policy</FormLabel>
                        <FormControl>
                          <Textarea rows={5} {...field} className={textareaClass} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : null}

              {section === "home" ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldRow
                      label="Hero headline"
                      hint="Big statement at the top of the homepage."
                      onReset={() => resetDraftValue("hero.headline")}
                    >
                      <Input
                        value={(draft as any).hero?.headline ?? ""}
                        onChange={(e) => updateDraftValue("hero.headline", e.target.value)}
                        placeholder={defaultStorefrontContent.hero.headline}
                        className={controlClass}
                      />
                    </FieldRow>
                    <FieldRow
                      label="Hero image URL"
                      onReset={() => resetDraftValue("hero.imageUrl")}
                    >
                      <Input
                        value={(draft as any).hero?.imageUrl ?? ""}
                        onChange={(e) => updateDraftValue("hero.imageUrl", e.target.value)}
                        placeholder={defaultStorefrontContent.hero.imageUrl}
                        className={controlClass}
                      />
                    </FieldRow>
                  </div>
                  <FieldRow label="About eyebrow" onReset={() => resetDraftValue("about.eyebrow")}>
                    <Input
                      value={(draft as any).about?.eyebrow ?? ""}
                      onChange={(e) => updateDraftValue("about.eyebrow", e.target.value)}
                      placeholder={defaultStorefrontContent.about.eyebrow}
                      className={controlClass}
                    />
                  </FieldRow>
                  <FieldRow
                    label="About headline"
                    onReset={() => resetDraftValue("about.headline")}
                  >
                    <Textarea
                      rows={3}
                      value={(draft as any).about?.headline ?? ""}
                      onChange={(e) => updateDraftValue("about.headline", e.target.value)}
                      placeholder={defaultStorefrontContent.about.headline}
                      className={textareaClass}
                    />
                  </FieldRow>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldRow
                      label="Featured eyebrow"
                      onReset={() => resetDraftValue("featured.eyebrow")}
                    >
                      <Input
                        value={(draft as any).featured?.eyebrow ?? ""}
                        onChange={(e) => updateDraftValue("featured.eyebrow", e.target.value)}
                        placeholder={defaultStorefrontContent.featured.eyebrow}
                        className={controlClass}
                      />
                    </FieldRow>
                    <FieldRow
                      label="Featured CTA label"
                      onReset={() => resetDraftValue("featured.rightCtaLabel")}
                    >
                      <Input
                        value={(draft as any).featured?.rightCtaLabel ?? ""}
                        onChange={(e) => updateDraftValue("featured.rightCtaLabel", e.target.value)}
                        placeholder={defaultStorefrontContent.featured.rightCtaLabel}
                        className={controlClass}
                      />
                    </FieldRow>
                  </div>
                </>
              ) : null}

              {section === "modules" ? (
                <>
                  <FieldRow label="Marquee badge" onReset={() => resetDraftValue("marquee.badge")}>
                    <Input
                      value={(draft as any).marquee?.badge ?? ""}
                      onChange={(e) => updateDraftValue("marquee.badge", e.target.value)}
                      placeholder={defaultStorefrontContent.marquee.badge}
                      className={controlClass}
                    />
                  </FieldRow>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldRow label="CTA headline" onReset={() => resetDraftValue("cta.headline")}>
                      <Input
                        value={(draft as any).cta?.headline ?? ""}
                        onChange={(e) => updateDraftValue("cta.headline", e.target.value)}
                        placeholder={defaultStorefrontContent.cta.headline}
                        className={controlClass}
                      />
                    </FieldRow>
                    <FieldRow
                      label="CTA button label"
                      onReset={() => resetDraftValue("cta.buttonLabel")}
                    >
                      <Input
                        value={(draft as any).cta?.buttonLabel ?? ""}
                        onChange={(e) => updateDraftValue("cta.buttonLabel", e.target.value)}
                        placeholder={defaultStorefrontContent.cta.buttonLabel}
                        className={controlClass}
                      />
                    </FieldRow>
                  </div>
                  <FieldRow label="Zoom section enabled" hint="Spotlight block on homepage.">
                    <div className="flex items-center justify-between rounded-xl border px-3 py-2">
                      <div className="text-sm">Enabled</div>
                      <Switch
                        checked={
                          typeof (draft as any).zoomSection?.enabled === "boolean"
                            ? !!(draft as any).zoomSection.enabled
                            : true
                        }
                        onCheckedChange={(v) => updateDraftValue("zoomSection.enabled", v)}
                      />
                    </div>
                  </FieldRow>
                </>
              ) : null}

              {section === "pdp" ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldRow
                      label="Add to bag label"
                      onReset={() => resetDraftValue("pdp.addToBagLabel")}
                    >
                      <Input
                        value={(draft as any).pdp?.addToBagLabel ?? ""}
                        onChange={(e) => updateDraftValue("pdp.addToBagLabel", e.target.value)}
                        placeholder={defaultStorefrontContent.pdp.addToBagLabel}
                        className={controlClass}
                      />
                    </FieldRow>
                    <FieldRow
                      label="Save item label"
                      onReset={() => resetDraftValue("pdp.saveItemLabel")}
                    >
                      <Input
                        value={(draft as any).pdp?.saveItemLabel ?? ""}
                        onChange={(e) => updateDraftValue("pdp.saveItemLabel", e.target.value)}
                        placeholder={defaultStorefrontContent.pdp.saveItemLabel}
                        className={controlClass}
                      />
                    </FieldRow>
                  </div>
                  <FieldRow
                    label="Shipping title"
                    onReset={() => resetDraftValue("pdp.shippingTitle")}
                  >
                    <Input
                      value={(draft as any).pdp?.shippingTitle ?? ""}
                      onChange={(e) => updateDraftValue("pdp.shippingTitle", e.target.value)}
                      placeholder={defaultStorefrontContent.pdp.shippingTitle}
                      className={controlClass}
                    />
                  </FieldRow>
                  <FieldRow
                    label="Shipping body"
                    onReset={() => resetDraftValue("pdp.shippingBody")}
                  >
                    <Textarea
                      rows={3}
                      value={(draft as any).pdp?.shippingBody ?? ""}
                      onChange={(e) => updateDraftValue("pdp.shippingBody", e.target.value)}
                      placeholder={defaultStorefrontContent.pdp.shippingBody}
                      className={textareaClass}
                    />
                  </FieldRow>
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {isPreviewOn ? (
          <div className="lg:sticky lg:top-6 h-fit w-full">
            <div className="rounded-2xl border bg-background overflow-hidden">
              <div className="px-4 py-3 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold">Preview</div>
                  <div className="text-xs text-muted-foreground truncate">
                    Draft preview. Changes appear after autosave.
                  </div>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {draftDirty ? "Unsaved…" : "Saved"}
                </div>
              </div>

              <div className="bg-muted/30 p-3">
                <div className="rounded-xl border bg-background overflow-hidden">
                  <div className="aspect-[16/10] w-full overflow-auto">
                    <div className="min-h-full min-w-[640px]">
                      {previewTheme ? (
                        <ThemeConfigProvider value={previewTheme}>
                          <StorefrontHomeLazy
                            slug={store.slug}
                            zoomImageUrl={previewTheme.content.zoomSection.imageUrl}
                            featuredProducts={featuredProducts}
                          />
                        </ThemeConfigProvider>
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
                          Loading preview…
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Tip: enable preview to verify changes, then publish when ready.
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Form>
  );
}
