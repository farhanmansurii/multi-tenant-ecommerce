"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Store,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Settings,
  RefreshCwIcon as Sync,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { useDashboardParams } from "@/hooks/use-dashboard-params";
import { useShopifyConfig, useUpdateShopifyConfig } from "@/hooks/mutations/use-shopify-mutations";
import { useShopifySync } from "@/hooks/mutations/use-shopify-sync";

const shopifyConfigSchema = z.object({
  domain: z.string().min(1, "Domain is required").refine(
    (val) => val.includes('.myshopify.com'),
    "Must be a valid Shopify domain (e.g., mystore.myshopify.com)"
  ),
  accessToken: z.string().min(1, "Access token is required"),
  apiVersion: z.string().min(1),
  webhookSecret: z.string().optional(),
  settings: z.object({
    syncProducts: z.boolean(),
    syncInventory: z.boolean(),
    syncOrders: z.boolean(),
    autoPublish: z.boolean(),
  }),
});

type ShopifyConfigFormData = z.infer<typeof shopifyConfigSchema>;

interface ShopifyIntegrationSectionProps {
  params: Promise<{ slug: string }>;
}

export function ShopifyIntegrationSection({ params }: ShopifyIntegrationSectionProps) {
  const { slug } = useDashboardParams(params);
  const [isEnabled, setIsEnabled] = useState(false);

  const { data: config, isLoading: configLoading } = useShopifyConfig(slug);
  const updateConfigMutation = useUpdateShopifyConfig(slug);
  const syncMutation = useShopifySync(slug);

  const form = useForm<ShopifyConfigFormData>({
    resolver: zodResolver(shopifyConfigSchema),
    defaultValues: {
      domain: "",
      accessToken: "",
      apiVersion: "2023-10",
      webhookSecret: "",
      settings: {
        syncProducts: true,
        syncInventory: true,
        syncOrders: false,
        autoPublish: false,
      },
    },
  });

  React.useEffect(() => {
    if (config && config.configured && config.config) {
      setIsEnabled(config.config.enabled || false);
      form.reset({
        domain: config.config.domain || "",
        accessToken: config.config.accessToken || "",
        apiVersion: config.config.apiVersion || "2023-10",
        webhookSecret: config.config.webhookSecret || "",
        settings: {
          syncProducts: config.config.settings?.syncProducts ?? true,
          syncInventory: config.config.settings?.syncInventory ?? true,
          syncOrders: config.config.settings?.syncOrders ?? false,
          autoPublish: config.config.settings?.autoPublish ?? false,
        },
      });
    } else if (config && !config.configured) {
      // Reset to defaults when not configured
      setIsEnabled(false);
      form.reset({
        domain: "",
        accessToken: "",
        apiVersion: "2023-10",
        webhookSecret: "",
        settings: {
          syncProducts: true,
          syncInventory: true,
          syncOrders: false,
          autoPublish: false,
        },
      });
    }
  }, [config, form]);

  const onSubmit = async (data: ShopifyConfigFormData) => {
    try {
      await updateConfigMutation.mutateAsync({
        ...data,
        enabled: isEnabled,
      });
      toast.success("Shopify configuration saved successfully");
    } catch (error) {
      toast.error("Failed to save Shopify configuration");
      console.error("Error saving Shopify config:", error);
    }
  };

  const handleSync = async (type: "products" | "inventory" | "all") => {
    try {
      const result = await syncMutation.mutateAsync({ type });
      toast.success(`Sync completed: ${result.imported || result.updated} items processed`);
    } catch (error) {
      toast.error("Sync failed");
      console.error("Sync error:", error);
    }
  };

  const toggleIntegration = async (enabled: boolean) => {
    try {
      await updateConfigMutation.mutateAsync({
        enabled,
        domain: form.getValues("domain"),
        accessToken: form.getValues("accessToken"),
        apiVersion: form.getValues("apiVersion"),
        webhookSecret: form.getValues("webhookSecret"),
        settings: form.getValues("settings"),
      });
      setIsEnabled(enabled);
      toast.success(enabled ? "Shopify integration enabled" : "Shopify integration disabled");
    } catch (error) {
      toast.error("Failed to update integration status");
      console.error("Error toggling integration:", error);
    }
  };

  if (configLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Shopify Integration
          </CardTitle>
          <CardDescription>Loading configuration...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isConfigured = config?.configured;
  const isSyncing = config?.config?.syncStatus === "syncing";

  return (
    <div className="space-y-6">
      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Shopify Integration
          </CardTitle>
          <CardDescription>
            Connect your Shopify store to sync products, inventory, and orders automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isConfigured ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Shopify Connected</span>
                  <Badge variant={isEnabled ? "default" : "secondary"}>
                    {isEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                  {isSyncing && (
                    <Badge variant="outline" className="animate-pulse">
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Syncing
                    </Badge>
                  )}
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={toggleIntegration}
                  disabled={updateConfigMutation.isPending}
                />
              </div>

              {config.config && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Domain:</span> {config.config.domain}
                  </div>
                  <div>
                    <span className="font-medium">API Version:</span> {config.config.apiVersion}
                  </div>
                  <div>
                    <span className="font-medium">Last Sync:</span>{" "}
                    {config.config.lastSyncAt
                      ? new Date(config.config.lastSyncAt).toLocaleString()
                      : "Never"
                    }
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{" "}
                    <Badge variant={config.config.syncStatus === "error" ? "destructive" : "outline"}>
                      {config.config.syncStatus}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Sync Actions */}
              {isEnabled && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-medium">Manual Sync</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync("products")}
                        disabled={syncMutation.isPending}
                      >
                        <Sync className="h-4 w-4 mr-2" />
                        Sync Products
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync("inventory")}
                        disabled={syncMutation.isPending}
                      >
                        <Sync className="h-4 w-4 mr-2" />
                        Sync Inventory
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync("all")}
                        disabled={syncMutation.isPending}
                      >
                        <Sync className="h-4 w-4 mr-2" />
                        Sync All
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Not Configured</AlertTitle>
              <AlertDescription>
                Set up your Shopify integration below to start syncing products and inventory.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration
          </CardTitle>
          <CardDescription>
            Configure your Shopify store connection. You'll need to create a private app in your Shopify admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shopify Domain</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="yourstore.myshopify.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your Shopify store domain (e.g., mystore.myshopify.com)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accessToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin API Access Token</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="shpat_..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Private app access token from Shopify
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="apiVersion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Version</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="2023-10"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Shopify API version (default: 2023-10)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="webhookSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Webhook Secret (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="whsec_..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Secret for verifying webhook signatures
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Sync Settings</h4>

                <FormField
                  control={form.control}
                  name="settings.syncProducts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Sync Products</FormLabel>
                        <FormDescription>
                          Import and sync product catalog from Shopify
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="settings.syncInventory"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Sync Inventory</FormLabel>
                        <FormDescription>
                          Keep product stock levels in sync with Shopify
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="settings.syncOrders"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Sync Orders</FormLabel>
                        <FormDescription>
                          Push order data back to Shopify (coming soon)
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="settings.autoPublish"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Auto-publish Products</FormLabel>
                        <FormDescription>
                          Automatically publish imported products
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  <a
                    href="https://help.shopify.com/en/manual/apps/private-apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    How to create a private app
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <Button
                  type="submit"
                  disabled={updateConfigMutation.isPending}
                >
                  {updateConfigMutation.isPending && (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Save Configuration
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
