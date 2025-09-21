import { Controller, Control } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { ProductFormValues } from "@/lib/validations/product-form";

interface SwitchFieldProps {
  name: keyof ProductFormValues;
  label: string;
  description: string;
  control: Control<ProductFormValues>;
}

export const SwitchField = ({
  name,
  label,
  description,
  control
}: SwitchFieldProps) => (
  <Controller
    control={control}
    name={name}
    render={({ field }) => (
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Switch
          checked={field.value as boolean}
          onCheckedChange={field.onChange}
        />
      </div>
    )}
  />
);
