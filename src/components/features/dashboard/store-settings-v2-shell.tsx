"use client";

import { useMemo, useState } from "react";
import type { ElementType } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { queryKeys } from "@/lib/query/keys";
import {
  addStoreMember,
  fetchStoreMembers,
  removeStoreMember,
  updateBrandSettings,
  updateCheckoutSettings,
  updateDangerSettings,
  updatePoliciesSettings,
  updateStoreMemberRole,
  type BrandSettingsPayload,
  type CheckoutSettingsPayload,
  type DangerSettingsPayload,
  type PoliciesSettingsPayload,
  type StoreMemberData,
} from "@/lib/domains/stores/service";

type SectionId = "brand" | "checkout" | "policies" | "access" | "danger";

interface InitialSettings {
  status: "draft" | "active" | "suspended";
  storeName: string;
  description: string;
  email: string;
  logo: string;
  primaryColor: string;
  currency: string;
  paymentMethods?: Array<"stripe" | "cod">;
  codEnabled?: boolean;
  shippingEnabled?: boolean;
  freeShippingThreshold?: number | null;
  termsOfService?: string;
  privacyPolicy?: string;
  refundPolicy?: string;
  storefrontContentMode?: "defaults" | "store" | "custom";
  storefrontContent?: Record<string, unknown>;
}

interface BrandDraft {
  storeName: string;
  description: string;
  email: string;
  logo: string;
  primaryColor: string;
  currency: string;
}

interface CheckoutDraft {
  paymentMethods: Array<"stripe" | "cod">;
  codEnabled: boolean;
  shippingEnabled: boolean;
  freeShippingThreshold: string;
}

interface PoliciesDraft {
  termsOfService: string;
  privacyPolicy: string;
  refundPolicy: string;
}

const SECTION_META: Array<{
  id: SectionId;
  label: string;
  icon: ElementType;
  description: string;
}> = [
  {
    id: "brand",
    label: "Brand",
    icon: Building2,
    description: "Store identity and profile details.",
  },
  {
    id: "checkout",
    label: "Checkout",
    icon: CreditCard,
    description: "Payments and shipping controls.",
  },
  {
    id: "policies",
    label: "Policies",
    icon: FileText,
    description: "Terms, privacy, and refund content.",
  },
  {
    id: "access",
    label: "Team & Access",
    icon: Users,
    description: "Roles and permissions.",
  },
  {
    id: "danger",
    label: "Danger Zone",
    icon: AlertTriangle,
    description: "High-risk store actions.",
  },
];

function resolveSectionId(input: string | null): SectionId {
  if (!input) return "brand";
  const match = SECTION_META.find((s) => s.id === input);
  return match?.id ?? "brand";
}

function makeBrandDraft(initial: InitialSettings): BrandDraft {
  return {
    storeName: initial.storeName,
    description: initial.description,
    email: initial.email,
    logo: initial.logo,
    primaryColor: initial.primaryColor,
    currency: initial.currency,
  };
}

function makeCheckoutDraft(initial: InitialSettings): CheckoutDraft {
  const allowed = (initial.paymentMethods ?? []).filter(
    (method): method is "stripe" | "cod" => method === "stripe" || method === "cod",
  );
  return {
    paymentMethods: allowed.length > 0 ? allowed : ["stripe"],
    codEnabled: initial.codEnabled ?? false,
    shippingEnabled: initial.shippingEnabled ?? true,
    freeShippingThreshold:
      initial.freeShippingThreshold === null || initial.freeShippingThreshold === undefined
        ? ""
        : String(initial.freeShippingThreshold),
  };
}

function makePoliciesDraft(initial: InitialSettings): PoliciesDraft {
  return {
    termsOfService: initial.termsOfService ?? "",
    privacyPolicy: initial.privacyPolicy ?? "",
    refundPolicy: initial.refundPolicy ?? "",
  };
}

function checkoutToPayload(draft: CheckoutDraft): CheckoutSettingsPayload {
  const normalizedMethods = draft.paymentMethods.filter(
    (method): method is "stripe" | "cod" => method === "stripe" || method === "cod",
  );
  const thresholdText = draft.freeShippingThreshold.trim();
  const parsedThreshold = thresholdText === "" ? null : Number(thresholdText);
  return {
    paymentMethods: normalizedMethods,
    codEnabled: draft.codEnabled,
    shippingEnabled: draft.shippingEnabled,
    freeShippingThreshold:
      thresholdText === "" || Number.isNaN(parsedThreshold) ? null : parsedThreshold,
  };
}

function policiesToPayload(draft: PoliciesDraft): PoliciesSettingsPayload {
  return {
    termsOfService: draft.termsOfService.trim(),
    privacyPolicy: draft.privacyPolicy.trim(),
    refundPolicy: draft.refundPolicy.trim(),
  };
}

function brandToPayload(draft: BrandDraft): BrandSettingsPayload {
  return {
    storeName: draft.storeName.trim(),
    description: draft.description.trim(),
    email: draft.email.trim(),
    logo: draft.logo.trim() || null,
    primaryColor: draft.primaryColor.trim(),
    currency: draft.currency.trim().toUpperCase(),
  };
}

export default function StoreSettingsV2Shell({
  slug,
  storeName,
  initialSettings,
}: {
  slug: string;
  storeName: string;
  initialSettings: InitialSettings;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const activeSection = resolveSectionId(searchParams.get("section"));
  const activeMeta = useMemo(
    () => SECTION_META.find((section) => section.id === activeSection) ?? SECTION_META[0],
    [activeSection],
  );

  const [brandSaved, setBrandSaved] = useState<BrandDraft>(() => makeBrandDraft(initialSettings));
  const [brandDraft, setBrandDraft] = useState<BrandDraft>(() => makeBrandDraft(initialSettings));
  const [checkoutSaved, setCheckoutSaved] = useState<CheckoutDraft>(() => makeCheckoutDraft(initialSettings));
  const [checkoutDraft, setCheckoutDraft] = useState<CheckoutDraft>(() => makeCheckoutDraft(initialSettings));
  const [policiesSaved, setPoliciesSaved] = useState<PoliciesDraft>(() => makePoliciesDraft(initialSettings));
  const [policiesDraft, setPoliciesDraft] = useState<PoliciesDraft>(() => makePoliciesDraft(initialSettings));
  const [storeStatus, setStoreStatus] = useState<"draft" | "active" | "suspended">(
    initialSettings.status,
  );
  const [confirmSlug, setConfirmSlug] = useState("");
  const [inviteUserId, setInviteUserId] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");

  const brandDirty = JSON.stringify(brandDraft) !== JSON.stringify(brandSaved);
  const checkoutDirty = JSON.stringify(checkoutDraft) !== JSON.stringify(checkoutSaved);
  const policiesDirty = JSON.stringify(policiesDraft) !== JSON.stringify(policiesSaved);
  const canRunDangerAction = confirmSlug.trim() === slug;

  const invalidateStore = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.stores.detail(slug) });
  };

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ["store-members", slug],
    queryFn: () => fetchStoreMembers(slug),
  });

  const brandMutation = useMutation({
    mutationFn: (payload: BrandSettingsPayload) => updateBrandSettings(slug, payload),
    onSuccess: (_, payload) => {
      const next = {
        storeName: payload.storeName ?? brandSaved.storeName,
        description: payload.description ?? brandSaved.description,
        email: payload.email ?? brandSaved.email,
        logo: payload.logo ?? brandSaved.logo,
        primaryColor: payload.primaryColor ?? brandSaved.primaryColor,
        currency: payload.currency ?? brandSaved.currency,
      };
      setBrandSaved(next);
      setBrandDraft(next);
      invalidateStore();
      toast.success("Brand updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update brand");
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: (payload: CheckoutSettingsPayload) => updateCheckoutSettings(slug, payload),
    onSuccess: (_, payload) => {
      const next = {
        paymentMethods: payload.paymentMethods ?? checkoutSaved.paymentMethods,
        codEnabled: payload.codEnabled ?? checkoutSaved.codEnabled,
        shippingEnabled: payload.shippingEnabled ?? checkoutSaved.shippingEnabled,
        freeShippingThreshold:
          payload.freeShippingThreshold === null || payload.freeShippingThreshold === undefined
            ? ""
            : String(payload.freeShippingThreshold),
      };
      setCheckoutSaved(next);
      setCheckoutDraft(next);
      invalidateStore();
      toast.success("Checkout updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update checkout settings");
    },
  });

  const policiesMutation = useMutation({
    mutationFn: (payload: PoliciesSettingsPayload) => updatePoliciesSettings(slug, payload),
    onSuccess: (_, payload) => {
      const next = {
        termsOfService: payload.termsOfService ?? policiesSaved.termsOfService,
        privacyPolicy: payload.privacyPolicy ?? policiesSaved.privacyPolicy,
        refundPolicy: payload.refundPolicy ?? policiesSaved.refundPolicy,
      };
      setPoliciesSaved(next);
      setPoliciesDraft(next);
      invalidateStore();
      toast.success("Policies updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update policies");
    },
  });

  const inviteMutation = useMutation({
    mutationFn: (payload: { userId: string; role: "admin" | "member" }) =>
      addStoreMember(slug, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-members", slug] });
      setInviteUserId("");
      setInviteRole("member");
      toast.success("Member added");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to add member");
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: (payload: { userId: string; role: "admin" | "member" }) =>
      updateStoreMemberRole(slug, payload.userId, payload.role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-members", slug] });
      toast.success("Member role updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update member role");
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => removeStoreMember(slug, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-members", slug] });
      toast.success("Member removed");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to remove member");
    },
  });

  const dangerMutation = useMutation({
    mutationFn: (payload: DangerSettingsPayload) => updateDangerSettings(slug, payload),
    onSuccess: (store) => {
      setStoreStatus(store.status as "draft" | "active" | "suspended");
      invalidateStore();
      toast.success(`Store status updated to ${store.status}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update store status");
    },
  });

  const navigateToSection = (section: SectionId) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("section", section);
    router.replace(`${pathname}?${next.toString()}`);
  };

  const togglePaymentMethod = (method: "stripe" | "cod", enabled: boolean) => {
    setCheckoutDraft((prev) => {
      const next = new Set(prev.paymentMethods);
      if (enabled) next.add(method);
      else next.delete(method);
      return { ...prev, paymentMethods: Array.from(next) as Array<"stripe" | "cod"> };
    });
  };

  const saveBrand = () => {
    brandMutation.mutate(brandToPayload(brandDraft));
  };

  const saveCheckout = () => {
    if (checkoutDraft.paymentMethods.length === 0) {
      toast.error("Select at least one payment method");
      return;
    }
    checkoutMutation.mutate(checkoutToPayload(checkoutDraft));
  };

  const savePolicies = () => {
    policiesMutation.mutate(policiesToPayload(policiesDraft));
  };

  const inviteMember = () => {
    const userId = inviteUserId.trim();
    if (!userId) {
      toast.error("User ID is required");
      return;
    }
    inviteMutation.mutate({ userId, role: inviteRole });
  };

  const runDangerAction = (action: "suspend" | "activate") => {
    if (!canRunDangerAction) {
      toast.error(`Type "${slug}" to confirm this action`);
      return;
    }
    dangerMutation.mutate({ action });
  };

  const renderSectionHeader = (title: string, description: string, dirty: boolean) => (
    <CardHeader className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {dirty ? (
          <Badge variant="warning">Unsaved</Badge>
        ) : (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Saved
          </Badge>
        )}
      </div>
    </CardHeader>
  );

  const renderBrand = () => (
    <Card className="border-border/60 bg-card/75 backdrop-blur-sm">
      {renderSectionHeader("Brand setup", "The essentials a customer sees first.", brandDirty)}
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="storeName">Store name</Label>
            <Input
              id="storeName"
              value={brandDraft.storeName}
              onChange={(e) => setBrandDraft((p) => ({ ...p, storeName: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Contact email</Label>
            <Input
              id="email"
              type="email"
              value={brandDraft.email}
              onChange={(e) => setBrandDraft((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Store description</Label>
          <Textarea
            id="description"
            rows={4}
            value={brandDraft.description}
            onChange={(e) => setBrandDraft((p) => ({ ...p, description: e.target.value }))}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              placeholder="https://..."
              value={brandDraft.logo}
              onChange={(e) => setBrandDraft((p) => ({ ...p, logo: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary color</Label>
            <Input
              id="primaryColor"
              placeholder="#0F766E"
              value={brandDraft.primaryColor}
              onChange={(e) => setBrandDraft((p) => ({ ...p, primaryColor: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              maxLength={3}
              value={brandDraft.currency}
              onChange={(e) => setBrandDraft((p) => ({ ...p, currency: e.target.value.toUpperCase() }))}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={saveBrand} disabled={!brandDirty || brandMutation.isPending}>
            {brandMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Brand
          </Button>
          <Button
            variant="outline"
            onClick={() => setBrandDraft(brandSaved)}
            disabled={!brandDirty || brandMutation.isPending}
          >
            Discard
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderCheckout = () => (
    <Card className="border-border/60 bg-card/75 backdrop-blur-sm">
      {renderSectionHeader("Checkout setup", "Payments and shipping controls.", checkoutDirty)}
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 rounded-xl border border-border/60 bg-background/65 p-4">
            <Label className="text-sm font-semibold">Payment Methods</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={checkoutDraft.paymentMethods.includes("stripe")}
                  onCheckedChange={(checked) => togglePaymentMethod("stripe", Boolean(checked))}
                />
                Stripe
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={checkoutDraft.paymentMethods.includes("cod")}
                  onCheckedChange={(checked) => togglePaymentMethod("cod", Boolean(checked))}
                />
                Cash on Delivery
              </label>
            </div>
          </div>
          <div className="space-y-3 rounded-xl border border-border/60 bg-background/65 p-4">
            <Label htmlFor="freeShippingThreshold">Free shipping threshold</Label>
            <Input
              id="freeShippingThreshold"
              type="number"
              min={0}
              step="0.01"
              placeholder="Leave empty to disable"
              value={checkoutDraft.freeShippingThreshold}
              onChange={(e) =>
                setCheckoutDraft((p) => ({ ...p, freeShippingThreshold: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/65 p-4">
            <p className="font-medium">Cash on Delivery</p>
            <Switch
              checked={checkoutDraft.codEnabled}
              onCheckedChange={(checked) => setCheckoutDraft((p) => ({ ...p, codEnabled: checked }))}
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/65 p-4">
            <p className="font-medium">Shipping enabled</p>
            <Switch
              checked={checkoutDraft.shippingEnabled}
              onCheckedChange={(checked) =>
                setCheckoutDraft((p) => ({ ...p, shippingEnabled: checked }))
              }
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={saveCheckout} disabled={!checkoutDirty || checkoutMutation.isPending}>
            {checkoutMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Checkout
          </Button>
          <Button
            variant="outline"
            onClick={() => setCheckoutDraft(checkoutSaved)}
            disabled={!checkoutDirty || checkoutMutation.isPending}
          >
            Discard
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderPolicies = () => (
    <Card className="border-border/60 bg-card/75 backdrop-blur-sm">
      {renderSectionHeader("Policies setup", "Keep legal text simple and clear.", policiesDirty)}
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="terms">Terms of Service</Label>
          <Textarea
            id="terms"
            rows={5}
            value={policiesDraft.termsOfService}
            onChange={(e) => setPoliciesDraft((p) => ({ ...p, termsOfService: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="privacy">Privacy Policy</Label>
          <Textarea
            id="privacy"
            rows={5}
            value={policiesDraft.privacyPolicy}
            onChange={(e) => setPoliciesDraft((p) => ({ ...p, privacyPolicy: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="refund">Refund Policy</Label>
          <Textarea
            id="refund"
            rows={5}
            value={policiesDraft.refundPolicy}
            onChange={(e) => setPoliciesDraft((p) => ({ ...p, refundPolicy: e.target.value }))}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={savePolicies} disabled={!policiesDirty || policiesMutation.isPending}>
            {policiesMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Policies
          </Button>
          <Button
            variant="outline"
            onClick={() => setPoliciesDraft(policiesSaved)}
            disabled={!policiesDirty || policiesMutation.isPending}
          >
            Discard
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderAccess = () => (
    <Card className="border-border/60 bg-card/75 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl">Team & Access</CardTitle>
        <CardDescription>Manage collaborators by user ID and role.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 rounded-xl border border-border/60 bg-background/65 p-4 md:grid-cols-[1fr,160px,120px]">
          <Input
            placeholder="User ID"
            value={inviteUserId}
            onChange={(e) => setInviteUserId(e.target.value)}
          />
          <select
            className="h-10 rounded-md border border-border/60 bg-background px-3 text-sm"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as "admin" | "member")}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <Button onClick={inviteMember} disabled={inviteMutation.isPending}>
            {inviteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Invite
          </Button>
        </div>

        <div className="space-y-2">
          {membersLoading ? (
            <div className="rounded-xl border border-border/60 p-4 text-sm text-muted-foreground">
              Loading members...
            </div>
          ) : members.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
              No members yet.
            </div>
          ) : (
            members.map((member: StoreMemberData) => (
              <div
                key={member.userId}
                className="grid items-center gap-3 rounded-xl border border-border/60 bg-background/65 p-4 md:grid-cols-[1fr,160px,180px]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{member.userId}</p>
                  <p className="text-xs text-muted-foreground">Role: {member.role}</p>
                </div>

                <select
                  className="h-10 rounded-md border border-border/60 bg-background px-3 text-sm"
                  value={member.role}
                  onChange={(e) =>
                    updateRoleMutation.mutate({
                      userId: member.userId,
                      role: e.target.value as "admin" | "member",
                    })
                  }
                  disabled={member.role === "owner" || updateRoleMutation.isPending}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  {member.role === "owner" && <option value="owner">Owner</option>}
                </select>

                <Button
                  variant="destructive"
                  onClick={() => removeMemberMutation.mutate(member.userId)}
                  disabled={member.role === "owner" || removeMemberMutation.isPending}
                >
                  {removeMemberMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Remove
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderDanger = () => (
    <Card className="border-destructive/40 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          High-risk actions require typed confirmation. Current status: <strong>{storeStatus}</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-xl border border-destructive/35 bg-destructive/5 p-4 text-sm text-muted-foreground">
          Type <span className="font-semibold text-foreground">{slug}</span> to unlock status actions.
        </div>

        <div className="space-y-2">
          <Label htmlFor="danger-confirm">Confirm store slug</Label>
          <Input
            id="danger-confirm"
            placeholder={slug}
            value={confirmSlug}
            onChange={(e) => setConfirmSlug(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="destructive"
            disabled={!canRunDangerAction || storeStatus === "suspended" || dangerMutation.isPending}
            onClick={() => runDangerAction("suspend")}
          >
            {dangerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Suspend Store
          </Button>
          <Button
            variant="outline"
            disabled={!canRunDangerAction || storeStatus === "active" || dangerMutation.isPending}
            onClick={() => runDangerAction("activate")}
          >
            {dangerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reactivate Store
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
      <Card className="h-fit border-border/60 bg-card/70 backdrop-blur-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-base">Configure {storeName}</CardTitle>
          <CardDescription>Section-level saves</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {SECTION_META.map((section) => {
            const isActive = section.id === activeSection;
            const Icon = section.icon;
            return (
              <Button
                key={section.id}
                type="button"
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "h-auto w-full justify-between gap-3 px-3 py-3 text-left",
                  isActive && "border border-border/60 bg-muted/60",
                )}
                onClick={() => navigateToSection(section.id)}
              >
                <span className="flex min-w-0 items-start gap-2">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="space-y-0.5">
                    <span className="block text-sm font-medium">{section.label}</span>
                    <span className="block text-xs text-muted-foreground">{section.description}</span>
                  </span>
                </span>
                <Badge variant="success">Ready</Badge>
              </Button>
            );
          })}
          <Button variant="ghost" className="w-full" onClick={() => router.push(`/dashboard/stores/${slug}`)}>
            Back to Store
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {activeSection === "brand" && renderBrand()}
        {activeSection === "checkout" && renderCheckout()}
        {activeSection === "policies" && renderPolicies()}
        {activeSection === "access" && renderAccess()}
        {activeSection === "danger" && renderDanger()}
        {!activeMeta && (
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Configure</CardTitle>
              <CardDescription>Select a section from the left.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
