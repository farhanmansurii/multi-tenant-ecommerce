"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/shared/common/loader";
import {
  Save,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Settings,
  Store,
  Zap,
  Palette,
  FileText,
  Globe,
  CreditCard,
  Truck,
  Shield,
  Star,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { storeSchema } from "@/lib/validations/store";

// Basic schema for quick setup - only essential fields
const basicStoreSchema = storeSchema.pick({
  storeName: true,
  storeSlug: true,
  description: true,
  email: true,
  businessType: true,
  status: true,
  businessName: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  country: true,
  primaryColor: true,
  currency: true,
  timezone: true,
  language: true,
  paymentMethods: true,
  shippingEnabled: true,
  termsOfService: true,
  privacyPolicy: true,
  refundPolicy: true,
  featured: true,
});

// Advanced schema for complete setup - all fields
const advancedStoreSchema = storeSchema;

type BasicStoreFormData = z.infer<typeof basicStoreSchema>;
type AdvancedStoreFormData = z.infer<typeof advancedStoreSchema>;

interface StoreFormProps {
  storeData?: Partial<AdvancedStoreFormData>;
  onSave: (data: BasicStoreFormData | AdvancedStoreFormData) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
  isEditPage?: boolean;
}

// Basic Form Component
function BasicStoreForm({
  storeData,
  onSave,
  onCancel,
  isSaving,
}: StoreFormProps) {
  const form = useForm<BasicStoreFormData>({
    resolver: zodResolver(basicStoreSchema),
    defaultValues: {
      storeName: storeData?.storeName || "",
      storeSlug: storeData?.storeSlug || "",
      description: storeData?.description || "",
      email: storeData?.email || "",
      businessType: storeData?.businessType || "individual",
      status: storeData?.status || "draft",
      businessName: storeData?.businessName || "",
      address: storeData?.address || "",
      city: storeData?.city || "",
      state: storeData?.state || "",
      zipCode: storeData?.zipCode || "",
      country: storeData?.country || "",
      primaryColor: storeData?.primaryColor || "#3B82F6",
      currency: storeData?.currency || "USD",
      timezone: storeData?.timezone || "America/New_York",
      language: storeData?.language || "en",
      paymentMethods: storeData?.paymentMethods || [],
      shippingEnabled: storeData?.shippingEnabled || true,
      termsOfService: storeData?.termsOfService || "",
      privacyPolicy: storeData?.privacyPolicy || "",
      refundPolicy: storeData?.refundPolicy || "",
      featured: storeData?.featured || false,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = form;
  const watchedValues = watch();

  const onSubmit = async (data: BasicStoreFormData) => {
    try {
      await onSave(data);
    } catch (error) {
      console.error("Error saving store:", error);
    }
  };

  const fillTestData = () => {
    const testData = {
      storeName: "Quick Store",
      storeSlug: "quick-store-" + Math.random().toString(36).substr(2, 5),
      description: "A simple store setup with all the essentials.",
      email: "hello@quickstore.com",
      businessType: "individual" as const,
      status: "draft" as const,
      businessName: "Quick Store LLC",
      address: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "US",
      primaryColor: "#3B82F6",
      currency: "USD",
      timezone: "America/New_York",
      language: "en",
      paymentMethods: ["stripe"],
      shippingEnabled: true,
      termsOfService:
        "By using our store, you agree to these terms. We reserve the right to modify these terms at any time.",
      privacyPolicy:
        "We collect and use your information to provide our services. We do not sell your personal data to third parties.",
      refundPolicy:
        "We offer 30-day returns on all items. Items must be in original condition.",
      featured: false,
    };

    Object.entries(testData).forEach(([key, value]) => {
      setValue(key as keyof BasicStoreFormData, value);
    });

    toast.success("Test data filled!");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Zap className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Setup</h2>
        <p className="">
          Get your store running in minutes with just the essentials
        </p>
      </div>

      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="storeName" className="text-base font-medium">
                Store Name *
              </Label>
              <Input
                id="storeName"
                {...register("storeName")}
                placeholder="My Awesome Store"
                className="h-12 text-base"
              />
              {errors.storeName && (
                <p className="text-sm text-red-600">
                  {errors.storeName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeSlug" className="text-base font-medium">
                Store URL *
              </Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300  text-gray-500 text-sm">
                  mystore.com/
                </span>
                <Input
                  id="storeSlug"
                  {...register("storeSlug")}
                  placeholder="my-store"
                  className="h-12 text-base rounded-l-none"
                />
              </div>
              {errors.storeSlug && (
                <p className="text-sm text-red-600">
                  {errors.storeSlug.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Tell customers what makes your store special..."
                rows={3}
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium">
                Contact Email
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="hello@mystore.com"
                className="h-12 text-base"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-base font-medium">
                Business Name *
              </Label>
              <Input
                id="businessName"
                {...register("businessName")}
                placeholder="My Business LLC"
                className="h-12 text-base"
              />
              {errors.businessName && (
                <p className="text-sm text-red-600">
                  {errors.businessName.message}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Business Address</h4>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-base font-medium">
                  Street Address *
                </Label>
                <Input
                  id="address"
                  {...register("address")}
                  placeholder="123 Main Street"
                  className="h-12 text-base"
                />
                {errors.address && (
                  <p className="text-sm text-red-600">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-base font-medium">
                    City *
                  </Label>
                  <Input
                    id="city"
                    {...register("city")}
                    placeholder="New York"
                    className="h-12 text-base"
                  />
                  {errors.city && (
                    <p className="text-sm text-red-600">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="text-base font-medium">
                    State *
                  </Label>
                  <Input
                    id="state"
                    {...register("state")}
                    placeholder="NY"
                    className="h-12 text-base"
                  />
                  {errors.state && (
                    <p className="text-sm text-red-600">
                      {errors.state.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-base font-medium">
                    ZIP Code *
                  </Label>
                  <Input
                    id="zipCode"
                    {...register("zipCode")}
                    placeholder="10001"
                    className="h-12 text-base"
                  />
                  {errors.zipCode && (
                    <p className="text-sm text-red-600">
                      {errors.zipCode.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-base font-medium">
                  Country *
                </Label>
                <Select
                  value={watchedValues.country}
                  onValueChange={(value) => setValue("country", value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                    <SelectItem value="DE">Germany</SelectItem>
                    <SelectItem value="FR">France</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.country && (
                  <p className="text-sm text-red-600">
                    {errors.country.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="primaryColor" className="text-base font-medium">
                  Primary Color *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    {...register("primaryColor")}
                    placeholder="#3B82F6"
                    className="h-12 text-base font-mono"
                  />
                  <div
                    className="w-12 h-12 rounded border"
                    style={{
                      backgroundColor: watchedValues.primaryColor || "#3B82F6",
                    }}
                  />
                </div>
                {errors.primaryColor && (
                  <p className="text-sm text-red-600">
                    {errors.primaryColor.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium">Currency *</Label>
                <Select
                  value={watchedValues.currency}
                  onValueChange={(value) => setValue("currency", value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                  </SelectContent>
                </Select>
                {errors.currency && (
                  <p className="text-sm text-red-600">
                    {errors.currency.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Payment Methods *</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="stripe"
                    checked={
                      watchedValues.paymentMethods?.includes("stripe") || false
                    }
                    onChange={(e) => {
                      const current = watchedValues.paymentMethods || [];
                      if (e.target.checked) {
                        setValue("paymentMethods", [...current, "stripe"]);
                      } else {
                        setValue(
                          "paymentMethods",
                          current.filter((m) => m !== "stripe")
                        );
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="stripe">Stripe</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="paypal"
                    checked={
                      watchedValues.paymentMethods?.includes("paypal") || false
                    }
                    onChange={(e) => {
                      const current = watchedValues.paymentMethods || [];
                      if (e.target.checked) {
                        setValue("paymentMethods", [...current, "paypal"]);
                      } else {
                        setValue(
                          "paymentMethods",
                          current.filter((m) => m !== "paypal")
                        );
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="paypal">PayPal</Label>
                </div>
              </div>
              {errors.paymentMethods && (
                <p className="text-sm text-red-600">
                  {errors.paymentMethods.message}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Legal Policies *</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="termsOfService"
                    className="text-base font-medium"
                  >
                    Terms of Service *
                  </Label>
                  <Textarea
                    id="termsOfService"
                    {...register("termsOfService")}
                    placeholder="Enter your terms of service..."
                    rows={3}
                    className="text-base"
                  />
                  {errors.termsOfService && (
                    <p className="text-sm text-red-600">
                      {errors.termsOfService.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="privacyPolicy"
                    className="text-base font-medium"
                  >
                    Privacy Policy *
                  </Label>
                  <Textarea
                    id="privacyPolicy"
                    {...register("privacyPolicy")}
                    placeholder="Enter your privacy policy..."
                    rows={3}
                    className="text-base"
                  />
                  {errors.privacyPolicy && (
                    <p className="text-sm text-red-600">
                      {errors.privacyPolicy.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="refundPolicy"
                    className="text-base font-medium"
                  >
                    Refund Policy *
                  </Label>
                  <Textarea
                    id="refundPolicy"
                    {...register("refundPolicy")}
                    placeholder="Enter your refund policy..."
                    rows={3}
                    className="text-base"
                  />
                  {errors.refundPolicy && (
                    <p className="text-sm text-red-600">
                      {errors.refundPolicy.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-base font-medium">Business Type</Label>
                <Select
                  value={watchedValues.businessType}
                  onValueChange={(value: "individual" | "business") =>
                    setValue("businessType", value)
                  }
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium">Status</Label>
                <Select
                  value={watchedValues.status}
                  onValueChange={(value: "draft" | "active" | "suspended") =>
                    setValue("status", value)
                  }
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        Draft
                      </div>
                    </SelectItem>
                    <SelectItem value="active">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="suspended">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Suspended
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={fillTestData}
                className="flex-1"
              >
                <Zap className="w-4 h-4 mr-2" />
                Fill Test Data
              </Button>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSaving ? (
                  <>
                    <Loader size={16} text="" className="mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Store
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Advanced Form Component (improved version of your original)
function AdvancedStoreForm({
  storeData,
  onSave,
  onCancel,
  isSaving,
}: StoreFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [logo, setLogo] = useState("");
  const [favicon, setFavicon] = useState("");

  const form = useForm<AdvancedStoreFormData>({
    resolver: zodResolver(advancedStoreSchema),
    defaultValues: storeData || {},
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = form;
  const watchedValues = watch();

  const steps = [
    {
      id: 1,
      title: "Store Identity",
      description: "Name, branding & basics",
      icon: Store,
      color: "bg-blue-500",
    },
    {
      id: 2,
      title: "Business Info",
      description: "Contact & legal details",
      icon: Globe,
      color: "bg-green-500",
    },
    {
      id: 3,
      title: "Customization",
      description: "Design & preferences",
      icon: Palette,
      color: "bg-purple-500",
    },
    {
      id: 4,
      title: "Payments & Shipping",
      description: "Commerce settings",
      icon: CreditCard,
      color: "bg-orange-500",
    },
    {
      id: 5,
      title: "Policies",
      description: "Terms & legal pages",
      icon: FileText,
      color: "bg-red-500",
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: AdvancedStoreFormData) => {
    try {
      await onSave(data);
    } catch (error) {
      console.error("Error saving store:", error);
    }
  };

  const fillTestData = () => {
    const testData = {
      storeName: "Premium Store Pro",
      storeSlug: "premium-store-" + Math.random().toString(36).substr(2, 9),
      tagline: "Premium products, premium service",
      description:
        "Experience excellence with our curated collection of premium products. We're committed to quality and customer satisfaction.",
      email: "hello@premiumstore.com",
      phone: "+1 (555) 987-6543",
      website: "https://www.premiumstore.com",
      businessType: "business" as const,
      businessName: "Premium Store LLC",
      taxId: "87-6543210",
      address: "456 Premium Ave",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      country: "US",
      primaryColor: "#6366F1",
      secondaryColor: "#8B5CF6",
      currency: "USD",
      timezone: "America/Los_Angeles",
      language: "en",
      paymentMethods: ["stripe", "paypal"],
      stripeAccountId: "acct_premium1234567890",
      paypalEmail: "payments@premiumstore.com",
      shippingEnabled: true,
      freeShippingThreshold: 75.0,
      termsOfService:
        "Welcome to Premium Store. By using our services, you agree to these comprehensive terms...",
      privacyPolicy:
        "Your privacy matters to us. We handle your data with the utmost care and transparency...",
      refundPolicy:
        "We stand behind our products with a 60-day satisfaction guarantee...",
      status: "active" as const,
      featured: true,
    };

    Object.entries(testData).forEach(([key, value]) => {
      setValue(key as keyof AdvancedStoreFormData, value);
    });

    toast.success("Advanced test data filled!");
  };

  const currentStepData = steps[currentStep - 1];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="text-center mb-6">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 ${currentStepData.color} rounded-full mb-4`}
          >
            <currentStepData.icon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Advanced Setup
          </h2>
          <p className="">Complete control over every aspect of your store</p>
        </div>

        {/* Enhanced Progress Steps */}
        <div className="flex items-center justify-between mb-8 bg-white rounded-lg p-4 shadow-sm border">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 ${
                    currentStep >= step.id
                      ? `${step.color} text-white shadow-lg`
                      : "bg-gray-200 "
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-xs font-medium ${
                      currentStep >= step.id ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-400 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-full h-1 mx-4 rounded-full transition-all duration-200 ${
                    currentStep > step.id
                      ? "bg-gradient-to-r from-blue-500 to-purple-500"
                      : "bg-gray-200"
                  }`}
                  style={{ minWidth: "60px" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Step 1: Store Identity */}
        {currentStep === 1 && (
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5 text-blue-600" />
                Store Identity
              </CardTitle>
              <CardDescription>
                Create your store&apos;s unique identity and brand presence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="storeName"
                    className="flex items-center gap-2"
                  >
                    <Star className="w-4 h-4 text-amber-500" />
                    Store Name *
                  </Label>
                  <Input
                    id="storeName"
                    {...register("storeName")}
                    placeholder="My Premium Store"
                    className="h-12"
                  />
                  {errors.storeName && (
                    <p className="text-sm text-red-600">
                      {errors.storeName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeSlug">Store URL Slug *</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300  text-gray-500 text-sm">
                      store.com/
                    </span>
                    <Input
                      id="storeSlug"
                      {...register("storeSlug")}
                      placeholder="my-premium-store"
                      className="h-12 rounded-l-none"
                    />
                  </div>
                  {errors.storeSlug && (
                    <p className="text-sm text-red-600">
                      {errors.storeSlug.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Store Tagline</Label>
                <Input
                  id="tagline"
                  {...register("tagline")}
                  placeholder="Your one-stop shop for premium products"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Store Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Tell your customers about your store's mission, values, and what makes you special..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="favicon">Favicon URL</Label>
                  <Input
                    id="favicon"
                    value={favicon}
                    onChange={(e) => setFavicon(e.target.value)}
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Business Info */}
        {currentStep === 2 && (
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-600" />
                Business Information
              </CardTitle>
              <CardDescription>
                Your business details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Business Type</Label>
                <Select
                  value={watchedValues.businessType}
                  onValueChange={(value: "individual" | "business") =>
                    setValue("businessType", value)
                  }
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        Individual
                      </div>
                    </SelectItem>
                    <SelectItem value="business">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        Business Entity
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {watchedValues.businessType === "business" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4  rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      {...register("businessName")}
                      placeholder="My Business LLC"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID / EIN</Label>
                    <Input
                      id="taxId"
                      {...register("taxId")}
                      placeholder="12-3456789"
                      className="h-12"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="contact@mystore.com"
                    className="h-12"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="+1 (555) 123-4567"
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  {...register("website")}
                  placeholder="https://www.mystore.com"
                  className="h-12"
                />
                {errors.website && (
                  <p className="text-sm text-red-600">
                    {errors.website.message}
                  </p>
                )}
              </div>

              <div className="space-y-4 p-4  rounded-lg">
                <h4 className="font-medium flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Business Address
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      {...register("address")}
                      placeholder="123 Business Street"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      {...register("city")}
                      placeholder="New York"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      {...register("state")}
                      placeholder="NY"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      {...register("zipCode")}
                      placeholder="10001"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      {...register("country")}
                      placeholder="US"
                      className="h-12"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Customization */}
        {currentStep === 3 && (
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-600" />
                Design & Customization
              </CardTitle>
              <CardDescription>
                Customize your store&apos;s appearance and regional settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Brand Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      {...register("primaryColor")}
                      placeholder="#3B82F6"
                      className="h-12"
                    />
                    <div
                      className="w-12 h-12 rounded border-2 border-gray-300 shadow-inner"
                      style={{
                        backgroundColor:
                          watchedValues.primaryColor || "#3B82F6",
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      {...register("secondaryColor")}
                      placeholder="#1E40AF"
                      className="h-12"
                    />
                    <div
                      className="w-12 h-12 rounded border-2 border-gray-300 shadow-inner"
                      style={{
                        backgroundColor:
                          watchedValues.secondaryColor || "#1E40AF",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={watchedValues.currency}
                    onValueChange={(value) => setValue("currency", value)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">🇺🇸 USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">🇪🇺 EUR - Euro</SelectItem>
                      <SelectItem value="GBP">
                        🇬🇧 GBP - British Pound
                      </SelectItem>
                      <SelectItem value="CAD">
                        🇨🇦 CAD - Canadian Dollar
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={watchedValues.timezone}
                    onValueChange={(value) => setValue("timezone", value)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">
                        🕐 Eastern Time
                      </SelectItem>
                      <SelectItem value="America/Chicago">
                        🕑 Central Time
                      </SelectItem>
                      <SelectItem value="America/Denver">
                        🕒 Mountain Time
                      </SelectItem>
                      <SelectItem value="America/Los_Angeles">
                        🕓 Pacific Time
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={watchedValues.language}
                    onValueChange={(value) => setValue("language", value)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                      <SelectItem value="es">🇪🇸 Spanish</SelectItem>
                      <SelectItem value="fr">🇫🇷 French</SelectItem>
                      <SelectItem value="de">🇩🇪 German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Payments & Shipping */}
        {currentStep === 4 && (
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-orange-50">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-600" />
                Payments & Shipping
              </CardTitle>
              <CardDescription>
                Configure payment methods and shipping options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Methods
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover: transition-colors">
                    <input
                      type="checkbox"
                      id="stripe"
                      checked={
                        watchedValues.paymentMethods?.includes("stripe") ||
                        false
                      }
                      onChange={(e) => {
                        const current = watchedValues.paymentMethods || [];
                        if (e.target.checked) {
                          setValue("paymentMethods", [...current, "stripe"]);
                        } else {
                          setValue(
                            "paymentMethods",
                            current.filter((m) => m !== "stripe")
                          );
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <Label htmlFor="stripe" className="font-medium">
                        Stripe
                      </Label>
                      <p className="text-sm text-gray-500">
                        Credit cards, debit cards, digital wallets
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover: transition-colors">
                    <input
                      type="checkbox"
                      id="paypal"
                      checked={
                        watchedValues.paymentMethods?.includes("paypal") ||
                        false
                      }
                      onChange={(e) => {
                        const current = watchedValues.paymentMethods || [];
                        if (e.target.checked) {
                          setValue("paymentMethods", [...current, "paypal"]);
                        } else {
                          setValue(
                            "paymentMethods",
                            current.filter((m) => m !== "paypal")
                          );
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <Label htmlFor="paypal" className="font-medium">
                        PayPal
                      </Label>
                      <p className="text-sm text-gray-500">
                        PayPal, PayPal Credit, bank transfers
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <Globe className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </div>

                {watchedValues.paymentMethods?.includes("stripe") && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Label htmlFor="stripeAccountId">Stripe Account ID</Label>
                    <Input
                      id="stripeAccountId"
                      {...register("stripeAccountId")}
                      placeholder="acct_1234567890abcdef"
                      className="mt-2 h-12"
                    />
                  </div>
                )}

                {watchedValues.paymentMethods?.includes("paypal") && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Label htmlFor="paypalEmail">PayPal Business Email</Label>
                    <Input
                      id="paypalEmail"
                      {...register("paypalEmail")}
                      placeholder="payments@mystore.com"
                      className="mt-2 h-12"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Truck className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Enable Shipping</h4>
                      <p className="text-sm text-gray-500">
                        Offer physical product delivery
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="shippingEnabled"
                    checked={watchedValues.shippingEnabled || false}
                    onCheckedChange={(checked) =>
                      setValue("shippingEnabled", checked)
                    }
                  />
                </div>

                {watchedValues.shippingEnabled && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <Label htmlFor="freeShippingThreshold">
                      Free shipping threshold ($)
                    </Label>
                    <Input
                      id="freeShippingThreshold"
                      type="number"
                      step="0.01"
                      {...register("freeShippingThreshold", {
                        valueAsNumber: true,
                      })}
                      placeholder="50.00"
                      className="mt-2 h-12"
                    />
                    <p className="text-sm text-green-600 mt-2">
                      Orders above this amount get free shipping
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Policies */}
        {currentStep === 5 && (
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-red-50">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" />
                Legal Policies & Store Status
              </CardTitle>
              <CardDescription>
                Important legal information and store configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="termsOfService"
                    className="flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4 text-blue-500" />
                    Terms of Service
                  </Label>
                  <Textarea
                    id="termsOfService"
                    {...register("termsOfService")}
                    placeholder="Enter your terms of service agreement..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="privacyPolicy"
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4 text-green-500" />
                    Privacy Policy
                  </Label>
                  <Textarea
                    id="privacyPolicy"
                    {...register("privacyPolicy")}
                    placeholder="Enter your privacy policy..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="refundPolicy"
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4 text-orange-500" />
                    Refund Policy
                  </Label>
                  <Textarea
                    id="refundPolicy"
                    {...register("refundPolicy")}
                    placeholder="Enter your refund and return policy..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="space-y-4 p-4  rounded-lg border">
                <h4 className="font-medium flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Store Configuration
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="status">Store Status</Label>
                    <Select
                      value={watchedValues.status}
                      onValueChange={(
                        value: "draft" | "active" | "suspended"
                      ) => setValue("status", value)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div>
                              <div className="font-medium">Draft</div>
                              <div className="text-xs text-gray-500">
                                Store is being prepared
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="active">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div>
                              <div className="font-medium">Active</div>
                              <div className="text-xs text-gray-500">
                                Store is live and accepting orders
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="suspended">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div>
                              <div className="font-medium">Suspended</div>
                              <div className="text-xs text-gray-500">
                                Store is temporarily closed
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-amber-500" />
                      <div>
                        <Label htmlFor="featured" className="font-medium">
                          Featured Store
                        </Label>
                        <p className="text-sm text-gray-500">
                          Highlight in marketplace
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="featured"
                      checked={watchedValues.featured || false}
                      onCheckedChange={(checked) =>
                        setValue("featured", checked)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={fillTestData}
                  className="flex-1"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Fill Test Data
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Navigation */}
        <div className="flex justify-between items-center pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="h-12"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              Step {currentStep} of {steps.length}
            </Badge>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="h-12"
            >
              Cancel
            </Button>

            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={nextStep}
                className="h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSaving}
                className="h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {isSaving ? (
                  <>
                    <Loader size={16} text="" className="mr-2" />
                    Saving Store...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save & Launch Store
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default function DualStoreForm({
  storeData,
  onSave,
  onCancel,
  isSaving = false,
  isEditPage = false,
}: StoreFormProps) {
  const [formType, setFormType] = useState<"selection" | "basic" | "advanced">(
    "selection"
  );
  const [showDetails, setShowDetails] = useState(false);
  const isEditingForm = isEditPage === true;

  if (formType === "basic") {
    return (
      <BasicStoreForm
        storeData={storeData}
        onSave={onSave}
        onCancel={() => setFormType("selection")}
        isSaving={isSaving}
      />
    );
  }

  if (formType === "advanced") {
    return (
      <AdvancedStoreForm
        storeData={storeData}
        onSave={onSave}
        onCancel={() => setFormType("selection")}
        isSaving={isSaving}
      />
    );
  }

  return (
    <div>
      <div className="flex gap-3 mb-8">
        <span className="text-sm text-muted-foreground">
          Show Complete details
        </span>
        <Switch checked={showDetails} onCheckedChange={setShowDetails} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ">
        <div
          className="group relative bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1"
          onClick={() => setFormType("basic")}
        >
          {!isEditingForm && (
            <div className="absolute -top-3 right-4 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-medium shadow-sm">
              Recommended
            </div>
          )}

          <div className="flex h-fit flex-col">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-card-foreground">
                  Quick Setup
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isEditingForm
                    ? "Quick edits to essential settings"
                    : "Get started with the essentials"}
                </p>
              </div>
            </div>

            {showDetails && (
              <div className="space-y-4 mb-6">
                <div className="space-y-3">
                  {[
                    "Store name and description",
                    "Basic contact information",
                    "Business type selection",
                    "Store status control",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 pt-3 border-t">
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                    ~3 minutes
                  </span>
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                    5 fields
                  </span>
                </div>
              </div>
            )}

            <Button>
              <Zap className="w-4 h-4" />
              {isEditingForm ? "Quick Edit" : "Start Quick Setup"}
            </Button>
          </div>
        </div>

        {/* Complete Setup */}
        <div
          className="group relative bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1"
          onClick={() => setFormType("advanced")}
        >
          <div className="flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-secondary/50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Settings className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-card-foreground">
                  Complete Setup
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isEditingForm
                    ? "Full control over all store settings"
                    : "Configure every aspect of your store"}
                </p>
              </div>
            </div>

            {showDetails && (
              <div className="space-y-4 mb-6">
                <div className="space-y-3">
                  {[
                    "Everything in Quick Setup",
                    "Custom branding & colors",
                    "Payment method configuration",
                    "Shipping settings & policies",
                    "Legal pages & terms",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-secondary/50 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-secondary-foreground" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-3 border-t flex-wrap">
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                    ~10 min
                  </span>
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                    25+ fields
                  </span>
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                    5 steps
                  </span>
                </div>
              </div>
            )}

            <Button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground">
              <Settings className="w-4 h-4" />
              {isEditingForm ? "Complete Edit" : "Start Complete Setup"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
