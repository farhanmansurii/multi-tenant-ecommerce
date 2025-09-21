"use client";

import { useState, useMemo } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface AutocompleteArrayInputProps {
  label: string;
  placeholder: string;
  values: string[] | undefined;
  onChange: (values: string[]) => void;
  suggestions: Array<{ id: string; name: string; color?: string }>;
  onCreateNew: (name: string) => Promise<void>;
  maxItems?: number;
  error?: string;
  className?: string;
  isLoading?: boolean;
}

export function AutocompleteArrayInput({
  label,
  placeholder,
  values,
  onChange,
  suggestions,
  onCreateNew,
  maxItems = 10,
  error,
  className,
  isLoading = false,
}: AutocompleteArrayInputProps) {
  const [inputValue, setInputValue] = useState("");

  // Ensure values is always an array
  const safeValues = useMemo(
    () => (Array.isArray(values) ? values : []),
    [values]
  );

  // Filter suggestions based on input and exclude already selected values
  const filteredSuggestions = useMemo(() => {
    if (!inputValue.trim()) return [];

    return suggestions.filter(
      (suggestion) =>
        suggestion.name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !safeValues.includes(suggestion.name)
    ).slice(0, 5); // Show max 5 suggestions
  }, [suggestions, inputValue, safeValues]);

  const canAddMore = safeValues.length < maxItems;
  const isExactMatch = suggestions.some(
    (s) => s.name.toLowerCase() === inputValue.toLowerCase()
  );
  const canCreateNew =
    inputValue.trim() &&
    !isExactMatch &&
    !safeValues.includes(inputValue.trim());

  const addItem = async (itemName: string) => {
    const trimmedValue = itemName.trim();
    if (
      trimmedValue &&
      !safeValues.includes(trimmedValue) &&
      safeValues.length < maxItems
    ) {
      onChange([...safeValues, trimmedValue]);
      setInputValue("");
    }
  };

  const removeItem = (index: number) => {
    onChange(safeValues.filter((_, i) => i !== index));
  };

  const handleCreateNew = async () => {
    if (inputValue.trim()) {
      try {
        await onCreateNew(inputValue.trim());
        await addItem(inputValue.trim());
      } catch (error) {
        console.error("Error creating new item:", error);
        await addItem(inputValue.trim());
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) {
        addItem(inputValue);
      }
    }
  };

  return (
    <div className={className}>
      <Label>{label}</Label>

      {/* Input section */}
      <div className="flex gap-2 mt-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            canAddMore ? placeholder : `Maximum ${maxItems} items reached`
          }
          disabled={!canAddMore}
        />
        <Button
          type="button"
          onClick={() => addItem(inputValue)}
          disabled={
            !inputValue.trim() ||
            safeValues.includes(inputValue.trim()) ||
            !canAddMore
          }
          size="sm"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick suggestions below input */}
      {inputValue.trim() && filteredSuggestions.length > 0 && (
        <div className="mt-2">
          <div className="text-xs text-muted-foreground mb-1">Suggestions:</div>
          <div className="flex flex-wrap gap-1">
            {filteredSuggestions.map((suggestion) => (
              <Button
                key={suggestion.id}
                variant="outline"
                size="sm"
                className="h-6 text-xs px-2"
                onClick={() => addItem(suggestion.name)}
              >
                {suggestion.color && (
                  <div
                    className="w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: suggestion.color }}
                  />
                )}
                {suggestion.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Create new option */}
      {canCreateNew && (
        <div className="mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateNew}
            disabled={isLoading}
            className="h-6 text-xs px-2"
          >
            <Plus className="h-3 w-3 mr-1" />
            {isLoading ? "Creating..." : `Create "${inputValue}"`}
          </Button>
        </div>
      )}

      {/* Selected items */}
      {safeValues.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-muted-foreground mb-2">Selected:</div>
          <div className="flex flex-wrap gap-2">
            {safeValues.map((item, index) => {
              const suggestion = suggestions.find((s) => s.name === item);
              return (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {suggestion?.color && (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: suggestion.color }}
                    />
                  )}
                  {item}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                    onClick={() => removeItem(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer info */}
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>
          {safeValues.length}/{maxItems} items
        </span>
        {error && <span className="text-destructive">{error}</span>}
      </div>
    </div>
  );
}
