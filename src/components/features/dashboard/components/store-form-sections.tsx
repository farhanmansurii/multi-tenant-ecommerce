"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FormFieldHook } from "@/components/ui/form-field";
import { StoreFormData } from "@/lib/domains/stores/validation";
import { Controller, UseFormReturn } from "react-hook-form";

interface StoreFormSectionsProps {
  form: UseFormReturn<StoreFormData>;
  mode: "create" | "edit";
}

export const BasicsSection = ({ form, mode }: StoreFormSectionsProps) => (
  <section className="space-y-6">
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
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
        disabled={mode === "edit"}
        description={mode === "edit" ? "Store URL can’t be changed after creation." : undefined}
      />

      <div className="md:col-span-2">
        <FormFieldHook
          form={form}
          name="description"
          label="Description"
          type="textarea"
          placeholder="What do you sell, and why should customers care?"
          rows={4}
          required
        />
      </div>
    </div>

    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
      <FormFieldHook
        form={form}
        name="email"
        label="Support Email"
        type="email"
        placeholder="support@mystore.com"
        required
      />

      <FormFieldHook
        form={form}
        name="primaryColor"
        label="Brand Color"
        type="color"
        placeholder="#3B82F6"
        required
      />
    </div>
  </section>
);

export const CheckoutSection = ({ form }: StoreFormSectionsProps) => (
  <section className="space-y-6">
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
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
    </div>

    <div>
      <Label className="text-base font-medium">Payment Methods *</Label>
      <Controller
        control={form.control}
        name="paymentMethods"
        render={({ field }) => (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            {[
              { id: "stripe", label: "Stripe" },
              { id: "cod", label: "Cash on Delivery" },
            ].map((method) => (
              <div key={method.id} className="flex items-center space-x-2">
                <Checkbox
                  id={method.id}
                  checked={field.value?.includes(method.id as any)}
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
  </section>
);

export const PoliciesSection = ({ form }: StoreFormSectionsProps) => (
  <section className="space-y-6">
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
  </section>
);

