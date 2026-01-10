"use client";

import { useCallback } from "react";
import { AlertCircle, ChevronRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FormValidationErrorsProps {
  errors: Record<string, { message?: string } | undefined>;
  onErrorClick?: (fieldName: string) => void;
  className?: string;
}

const fieldLabels: Record<string, string> = {
  storeName: "Store Name",
  storeSlug: "Store URL",
  description: "Description",
  email: "Email",
  phone: "Phone",
  website: "Website",
  address: "Address",
  city: "City",
  state: "State",
  zipCode: "ZIP Code",
  country: "Country",
  primaryColor: "Primary Color",
  secondaryColor: "Secondary Color",
  currency: "Currency",
  timezone: "Timezone",
  language: "Language",
  paymentMethods: "Payment Methods",
  codEnabled: "Cash on Delivery",
  shippingEnabled: "Shipping",
  freeShippingThreshold: "Free Shipping Threshold",
  shippingRates: "Shipping Rates",
  termsOfService: "Terms of Service",
  privacyPolicy: "Privacy Policy",
  refundPolicy: "Refund Policy",
  businessName: "Business Name",
  businessType: "Business Type",
  tagline: "Tagline",
};


export function FormValidationErrors({
  errors,
  onErrorClick,
  className,
}: FormValidationErrorsProps) {
  const errorEntries = Object.entries(errors).filter(
    ([_, error]) => error !== undefined
  );

  if (errorEntries.length === 0) {
    return null;
  }

  const handleErrorClick = useCallback(
    (fieldName: string) => {
      onErrorClick?.(fieldName);
    },
    [onErrorClick]
  );

  return (
    <Alert variant="destructive" className={cn("mb-6", className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="mb-2">
        Please fix the following {errorEntries.length === 1 ? "error" : "errors"}:
      </AlertTitle>
      <AlertDescription>
        <ul className="space-y-2 mt-2">
          {errorEntries.map(([fieldName, error]) => {
            const label = fieldLabels[fieldName] || fieldName;
            const message = error?.message || "Invalid value";

            return (
              <li key={fieldName}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-left justify-start text-destructive hover:text-destructive hover:underline font-normal"
                  onClick={() => handleErrorClick(fieldName)}
                >
                  <span className="flex items-center gap-2">
                    <ChevronRight className="h-3 w-3" />
                    <span>
                      <strong>{label}:</strong> {message}
                    </span>
                  </span>
                </Button>
              </li>
            );
          })}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
