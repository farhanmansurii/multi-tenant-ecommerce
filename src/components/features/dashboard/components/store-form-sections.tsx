"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { FormFieldHook } from "@/components/ui/form-field";
import { StoreFormData } from "@/lib/domains/stores/validation";
import { UseFormReturn } from "react-hook-form";

interface StoreFormSectionsProps {
  form: UseFormReturn<StoreFormData>;
}

export const BasicInformationSection = ({ form }: StoreFormSectionsProps) => (
  <section className="space-y-6">
    <div className="grid gap-6 md:grid-cols-2">
      <FormFieldHook
        form={form}
        name="storeName"
        label="Store Name"
        type="text"
        placeholder="My Awesome Store"
        required
      />

      <FormFieldHook
        form={form}
        name="storeSlug"
        label="Store URL"
        type="text"
        placeholder="my-store"
        prefix="mystore.com/"
        required
      />

      <div className="md:col-span-2">
        <FormFieldHook
          form={form}
          name="tagline"
          label="Tagline"
          type="text"
          placeholder="Your store's catchy tagline"
          description="Optional catchy phrase for your store"
        />
      </div>

      <div className="md:col-span-2">
        <FormFieldHook
          form={form}
          name="description"
          label="Description"
          type="textarea"
          placeholder="Tell customers what makes your store special..."
          rows={4}
          required
        />
      </div>
    </div>
  </section>
);

export const BusinessDetailsSection = ({ form }: StoreFormSectionsProps) => (
  <div className="space-y-6">
    <div className="grid gap-6 md:grid-cols-2">
      <FormFieldHook
        form={form}
        name="businessType"
        label="Business Type"
        type="select"
        options={[
          { value: "individual", label: "Individual" },
          { value: "business", label: "Business" },
          { value: "nonprofit", label: "Nonprofit" },
        ]}
        required
      />

      <FormFieldHook
        form={form}
        name="businessName"
        label="Business / Legal Name"
        type="text"
        placeholder="Acme Inc."
        required
      />

      <FormFieldHook
        form={form}
        name="taxId"
        label="Tax ID"
        type="text"
        placeholder="GST / EIN / VAT"
      />

      <FormFieldHook
        form={form}
        name="email"
        label="Contact Email"
        type="email"
        placeholder="hello@mystore.com"
        required
      />

      <FormFieldHook
        form={form}
        name="phone"
        label="Phone Number"
        type="tel"
        placeholder="+1 (555) 123-4567"
      />

      <div className="md:col-span-2">
        <FormFieldHook
          form={form}
          name="website"
          label="Website"
          type="url"
          placeholder="https://www.mystore.com"
        />
      </div>
    </div>

    <div className="space-y-4">
      <h4 className="font-medium">Business Address</h4>
      <div className="space-y-4">
        <FormFieldHook
          form={form}
          name="address"
          label="Street Address"
          type="text"
          placeholder="123 Main Street"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormFieldHook
            form={form}
            name="city"
            label="City"
            type="text"
            placeholder="New York"
          />

          <FormFieldHook
            form={form}
            name="state"
            label="State"
            type="text"
            placeholder="NY"
          />

          <FormFieldHook
            form={form}
            name="zipCode"
            label="ZIP Code"
            type="text"
            placeholder="10001"
          />
        </div>

        <FormFieldHook
          form={form}
          name="country"
          label="Country"
          type="select"
          placeholder="Select country"
          options={[
            { value: "US", label: "United States" },
            { value: "CA", label: "Canada" },
            { value: "GB", label: "United Kingdom" },
            { value: "AU", label: "Australia" },
            { value: "DE", label: "Germany" },
            { value: "FR", label: "France" },
            { value: "IN", label: "India" },
            { value: "other", label: "Other" },
          ]}
        />
      </div>
    </div>
  </div>
);

export const BrandingSection = ({ form }: StoreFormSectionsProps) => (
  <div className="grid gap-6 md:grid-cols-2">
    <FormFieldHook
      form={form}
      name="primaryColor"
      label="Primary Color"
      type="color"
      placeholder="#3B82F6"
      required
    />

    <FormFieldHook
      form={form}
      name="secondaryColor"
      label="Secondary Color"
      type="color"
      placeholder="#10B981"
    />

    <FormFieldHook
      form={form}
      name="currency"
      label="Currency"
      type="select"
      placeholder="Select currency"
      options={[
        { value: "USD", label: "USD - US Dollar" },
        { value: "EUR", label: "EUR - Euro" },
        { value: "GBP", label: "GBP - British Pound" },
        { value: "CAD", label: "CAD - Canadian Dollar" },
        { value: "AUD", label: "AUD - Australian Dollar" },
        { value: "JPY", label: "JPY - Japanese Yen" },
        { value: "INR", label: "INR - Indian Rupee" },
      ]}
      required
    />

    <FormFieldHook
      form={form}
      name="language"
      label="Language"
      type="select"
      placeholder="Select language"
      options={[
        { value: "en", label: "English" },
        { value: "es", label: "Spanish" },
        { value: "fr", label: "French" },
        { value: "de", label: "German" },
        { value: "it", label: "Italian" },
        { value: "pt", label: "Portuguese" },
        { value: "hi", label: "Hindi" },
      ]}
      required
    />

    <FormFieldHook
      form={form}
      name="timezone"
      label="Timezone"
      type="select"
      placeholder="Select timezone"
      options={[
        { value: "America/New_York", label: "Eastern Time (ET)" },
        { value: "America/Chicago", label: "Central Time (CT)" },
        { value: "America/Denver", label: "Mountain Time (MT)" },
        { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
        { value: "Europe/London", label: "London (GMT)" },
        { value: "Europe/Paris", label: "Paris (CET)" },
        { value: "Asia/Tokyo", label: "Tokyo (JST)" },
        { value: "Asia/Kolkata", label: "India (IST)" },
        { value: "Australia/Sydney", label: "Sydney (AEST)" },
      ]}
      required
    />
  </div>
);

import { Controller } from "react-hook-form";


export const PaymentAndShippingSection = ({ form }: StoreFormSectionsProps) => (
  <div className="space-y-6">
    <div>
      <Label className="text-base font-medium">Payment Methods *</Label>
      <Controller
        control={form.control}
        name="paymentMethods"
        render={({ field }) => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            {[
              { id: "stripe", label: "Stripe" },
              { id: "paypal", label: "PayPal" },
              { id: "upi", label: "UPI" },
              { id: "cod", label: "Cash on Delivery" },
            ].map((method) => (
              <div key={method.id} className="flex items-center space-x-2">
                <Checkbox
                  id={method.id}
                  checked={field.value?.includes(method.id)}
                  onCheckedChange={(checked) => {
                    const current = field.value || [];
                    if (checked) {
                      field.onChange([...current, method.id]);
                    } else {
                      field.onChange(current.filter((m: string) => m !== method.id));
                    }
                  }}
                />
                <Label htmlFor={method.id}>{method.label}</Label>
              </div>
            ))}
          </div>
        )}
      />
      {form.formState.errors.paymentMethods && (
        <p className="text-sm text-destructive mt-2">
          {form.formState.errors.paymentMethods.message}
        </p>
      )}
    </div>

    <div className="grid gap-6 md:grid-cols-2">
      <FormFieldHook
        form={form}
        name="stripeAccountId"
        label="Stripe Account ID"
        type="text"
        placeholder="acct_1234567890"
      />

      <FormFieldHook
        form={form}
        name="paypalEmail"
        label="PayPal Email"
        type="email"
        placeholder="payments@mystore.com"
      />

      <FormFieldHook
        form={form}
        name="upiId"
        label="UPI ID"
        type="text"
        placeholder="yourname@paytm"
      />
    </div>

    <div className="space-y-4">
      <FormFieldHook
        form={form}
        name="codEnabled"
        label="Enable Cash on Delivery"
        type="switch"
      />

      <FormFieldHook
        form={form}
        name="shippingEnabled"
        label="Enable Shipping"
        type="switch"
      />

      {form.watch("shippingEnabled") && (
        <div className="space-y-4 pl-6">
          <FormFieldHook
            form={form}
            name="freeShippingThreshold"
            label="Free Shipping Threshold"
            type="number"
            placeholder="50.00"
            step="0.01"
            min={0}
            description="Minimum order amount for free shipping"
          />
        </div>
      )}
    </div>
  </div>
);

export const LegalPoliciesSection = ({ form }: StoreFormSectionsProps) => (
  <div className="space-y-6">
    <FormFieldHook
      form={form}
      name="termsOfService"
      label="Terms of Service"
      type="textarea"
      placeholder="Enter your terms of service..."
      rows={4}
      required
    />

    <FormFieldHook
      form={form}
      name="privacyPolicy"
      label="Privacy Policy"
      type="textarea"
      placeholder="Enter your privacy policy..."
      rows={4}
      required
    />

    <FormFieldHook
      form={form}
      name="refundPolicy"
      label="Refund Policy"
      type="textarea"
      placeholder="Enter your refund policy..."
      rows={4}
      required
    />
  </div>
);

