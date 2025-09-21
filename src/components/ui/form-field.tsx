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
}

interface InputFieldProps extends BaseFieldProps {
  type: "text" | "email" | "tel" | "url" | "number" | "password";
  placeholder?: string;
  step?: string;
  min?: number;
  max?: number;
  prefix?: string;
  suffix?: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
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
                  type={props.type}
                  placeholder={props.placeholder}
                  value={props.value}
                  onChange={(e) => props.onChange?.(e.target.value)}
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
                type={props.type}
                placeholder={props.placeholder}
                value={props.value}
                onChange={(e) => props.onChange?.(e.target.value)}
                className={className}
              />
            )}
          </div>
        );

      case "number":
        return (
          <Input
            id={name}
            type="number"
            placeholder={props.placeholder}
            step={props.step}
            min={props.min}
            max={props.max}
            value={props.value}
            onChange={(e) => props.onChange?.(Number(e.target.value))}
            className={className}
          />
        );

      case "textarea":
        return (
          <Textarea
            id={name}
            placeholder={props.placeholder}
            rows={props.rows}
            value={props.value}
            onChange={(e) => props.onChange?.(e.target.value)}
            className={className}
          />
        );

      case "select":
        return (
          <Select value={props.value} onValueChange={props.onChange}>
            <SelectTrigger>
              <SelectValue placeholder={props.placeholder} />
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
          <div className="flex gap-2">
            <Input
              id={name}
              placeholder={props.placeholder || "#3B82F6"}
              className={cn("font-mono", className)}
              value={props.value}
              onChange={(e) => props.onChange?.(e.target.value)}
            />
            <div
              className="w-12 h-12 rounded border border-border"
              style={{
                backgroundColor: props.value || "#3B82F6",
              }}
            />
          </div>
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

// Hook-based form field component for easier integration with react-hook-form
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
}

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
}: FormFieldHookProps<T>) {
  const { formState: { errors } } = form;
  const error = errors[name] as FieldError | undefined;

  if (type === "select") {
    return (
      <FormField
        name={name}
        label={label}
        required={required}
        description={description}
        className={className}
        error={error}
        type="select"
        placeholder={placeholder}
        options={options || []}
        value={form.watch(name)}
        onChange={(value) => form.setValue(name, value as T[FieldPath<T>])}
      />
    );
  }

  if (type === "switch" || type === "checkbox") {
    return (
      <FormField
        name={name}
        label={label}
        required={required}
        description={description}
        className={className}
        error={error}
        type={type}
        value={form.watch(name)}
        onChange={(value) => form.setValue(name, value as T[FieldPath<T>])}
      />
    );
  }

  if (type === "color") {
    return (
      <FormField
        name={name}
        label={label}
        required={required}
        description={description}
        className={className}
        error={error}
        type="color"
        placeholder={placeholder}
        value={form.watch(name)}
        onChange={(value) => form.setValue(name, value as T[FieldPath<T>])}
      />
    );
  }

  if (type === "textarea") {
    return (
      <FormField
        name={name}
        label={label}
        required={required}
        description={description}
        className={className}
        error={error}
        type="textarea"
        placeholder={placeholder}
        rows={rows}
        value={form.watch(name)}
        onChange={(value) => form.setValue(name, value as T[FieldPath<T>])}
      />
    );
  }

  if (type === "number") {
    return (
      <FormField
        name={name}
        label={label}
        required={required}
        description={description}
        className={className}
        error={error}
        type="number"
        placeholder={placeholder}
        step={step}
        min={min}
        max={max}
        value={form.watch(name)}
        onChange={(value) => form.setValue(name, value as T[FieldPath<T>])}
      />
    );
  }

  // For text, email, tel, url, password
  return (
    <FormField
      name={name}
      label={label}
      required={required}
      description={description}
      className={className}
      error={error}
      type={type}
      placeholder={placeholder}
      prefix={prefix}
      suffix={suffix}
      value={form.watch(name)}
      onChange={(value) => form.setValue(name, value as T[FieldPath<T>])}
    />
  );
}
