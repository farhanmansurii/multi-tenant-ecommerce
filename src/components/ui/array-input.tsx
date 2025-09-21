"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ArrayInputProps {
  label: string;
  placeholder: string;
  values: string[] | undefined;
  onChange: (values: string[]) => void;
  maxItems?: number;
  error?: string;
  className?: string;
}

export function ArrayInput({
  label,
  placeholder,
  values,
  onChange,
  maxItems = 10,
  error,
  className,
}: ArrayInputProps) {
  const [inputValue, setInputValue] = useState("");

  // Ensure values is always an array
  const safeValues = Array.isArray(values) ? values : [];

  const addItem = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !safeValues.includes(trimmedValue) && safeValues.length < maxItems) {
      onChange([...safeValues, trimmedValue]);
      setInputValue("");
    }
  };

  const removeItem = (index: number) => {
    onChange(safeValues.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  const canAddMore = safeValues.length < maxItems;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>

      {/* Input field */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={canAddMore ? placeholder : `Maximum ${maxItems} items reached`}
          disabled={!canAddMore}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={addItem}
          disabled={!inputValue.trim() || safeValues.includes(inputValue.trim()) || !canAddMore}
          size="sm"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Display current items */}
      {safeValues.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {safeValues.map((item, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
            >
              {item}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => removeItem(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Helper text */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{safeValues.length}/{maxItems} items</span>
        {error && <span className="text-red-600">{error}</span>}
      </div>
    </div>
  );
}
