"use client";

import React from "react";
import { FieldError, FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface BaseFieldProps {
  name: string;
  label: string;
  required?: boolean;
  description?: string;
  className?: string;
  error?: FieldError;
  disabled?: boolean;
}

interface InputFieldProps extends BaseFieldProps {
  type: "text" | "email" | "tel" | "url" | "number" | "password" | "date" | "datetime-local";
  placeholder?: string;
  step?: string;
  min?: number;
  max?: number;
  prefix?: string;
  suffix?: string;
  value?: string | number;
  onChange?: (value: string | number | undefined) => void;
}

interface TextareaFieldProps extends BaseFieldProps {
  type: "textarea";
  placeholder?: string;
  rows?: number;
  value?: string;
  onChange?: (value: string) => void;
}

interface SelectFieldProps extends BaseFieldProps {
  type: "select";
  placeholder?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  value?: string;
  onChange?: (value: string) => void;
}

interface SwitchFieldProps extends BaseFieldProps {
  type: "switch";
  value?: boolean;
  onChange?: (value: boolean) => void;
}

interface CheckboxFieldProps extends BaseFieldProps {
  type: "checkbox";
  value?: boolean;
  onChange?: (value: boolean) => void;
}

interface ColorFieldProps extends BaseFieldProps {
  type: "color";
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

type FormFieldProps =
  | InputFieldProps
  | TextareaFieldProps
  | SelectFieldProps
  | SwitchFieldProps
  | CheckboxFieldProps
  | ColorFieldProps;

export function FormField(props: FormFieldProps) {
  const { name, label, required, description, className, error } = props;

  const renderField = () => {
    switch (props.type) {
      case "text":
      case "email":
      case "tel":
      case "url":
      case "password":
      case "date":
      case "datetime-local":
        return (
          <div className="space-y-2">
            {props.prefix || props.suffix ? (
              <div className="flex">
                {props.prefix && (
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-muted text-muted-foreground text-sm">
                    {props.prefix}
                  </span>
                )}
                <Input
                  id={name}
                  name={name}
                  type={props.type}
                  placeholder={props.placeholder}
                  value={props.value}
                  onChange={(e) => props.onChange?.(e.target.value)}
                  disabled={props.disabled}
                  className={cn(
                    props.prefix && "rounded-l-none",
                    props.suffix && "rounded-r-none",
                    className
                  )}
                />
                {props.suffix && (
                  <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-border bg-muted text-muted-foreground text-sm">
                    {props.suffix}
                  </span>
                )}
              </div>
            ) : (
              <Input
                id={name}
                name={name}
                type={props.type}
                placeholder={props.placeholder}
                value={props.value}
                onChange={(e) => props.onChange?.(e.target.value)}
                disabled={props.disabled}
                className={className}
              />
            )}
          </div>
        );

      case "number":
        return (
          <Input
            id={name}
            name={name}
            type="number"
            placeholder={props.placeholder}
            step={props.step}
            min={props.min}
            max={props.max}
            value={props.value}
            onChange={(e) => {
              const val = e.target.value;
              props.onChange?.(val === "" ? undefined : Number(val));
            }}
            disabled={props.disabled}
            className={className}
          />
        );

      case "textarea":
        return (
          <Textarea
            id={name}
            name={name}
            placeholder={props.placeholder}
            rows={props.rows}
            value={props.value}
            onChange={(e) => props.onChange?.(e.target.value)}
            className={className}
          />
        );

      case "select":
        return (
          <div data-field={name}>
            <Select value={props.value || undefined} onValueChange={props.onChange}>
              <SelectTrigger id={name} name={name} className={cn("w-full", className)}>
                <SelectValue placeholder={props.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {props.options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "switch":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={name}
              checked={props.value}
              onCheckedChange={props.onChange}
            />
            <Label htmlFor={name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {label}
            </Label>
          </div>
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={name}
              checked={props.value}
              onCheckedChange={props.onChange}
            />
            <Label htmlFor={name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {label}
            </Label>
          </div>
        );

      case "color":
        return (
          <ColorPicker value={props.value || "#6366f1"} onChange={(hex) => props.onChange?.(hex)} />
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {props.type !== "switch" && props.type !== "checkbox" && (
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {renderField()}
      {error && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}
    </div>
  );
}

interface FormFieldHookProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  description?: string;
  className?: string;
  type: FormFieldProps["type"];
  placeholder?: string;
  options?: { value: string; label: string; disabled?: boolean }[];
  step?: string;
  min?: number;
  max?: number;
  prefix?: string;
  suffix?: string;
  rows?: number;
  disabled?: boolean;
}

import { Controller } from "react-hook-form";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { CheckIcon } from "lucide-react";
import { ColorPicker } from "@/components/ui/color-picker";


export function FormFieldHook<T extends FieldValues>({
  form,
  name,
  label,
  required,
  description,
  className,
  type,
  placeholder,
  options,
  step,
  min,
  max,
  prefix,
  suffix,
  rows,
  disabled,
}: FormFieldHookProps<T>) {
  const { control } = form;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <FormField
          name={name}
          label={label}
          required={required}
          description={description}
          className={className}
          error={error}
          type={type as any}
          placeholder={placeholder}
          options={options || []}
          step={step}
          min={min}
          max={max}
          prefix={prefix}
          suffix={suffix}
          rows={rows}
          value={field.value ?? (type === "switch" || type === "checkbox" ? false : "")}
          onChange={field.onChange}
          disabled={disabled}
        />
      )}
    />
  );
}
