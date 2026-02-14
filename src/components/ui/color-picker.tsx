"use client";

import * as React from "react";
import { Check, Palette } from "lucide-react";
import { HexColorPicker, HexColorInput } from "react-colorful";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const PRESETS = [
  "#0ea5e9",
  "#2563eb",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#64748b",
];

function normalizeHex(value: string) {
  const v = value.trim();
  if (!v) return "#6366f1";
  if (v.startsWith("#")) return v.slice(0, 7);
  return `#${v}`.slice(0, 7);
}

function isHexColor(value: string) {
  return /^#([0-9a-fA-F]{6})$/.test(value.trim());
}

type Props = {
  label?: string;
  value: string;
  onChange: (hex: string) => void;
  className?: string;
};

export function ColorPicker({ label, value, onChange, className }: Props) {
  const safe = normalizeHex(value);
  const valid = isHexColor(safe);
  const display = valid ? safe.toUpperCase() : safe;

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <Label className="text-sm font-medium">{label}</Label> : null}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-10 w-full justify-start gap-2 rounded-xl px-3 font-normal",
              !valid && "border-destructive/60",
            )}
          >
            <span
              className="h-5 w-5 rounded-md border border-border/60"
              style={{ backgroundColor: valid ? safe : "#000000" }}
            />
            <span className="flex-1 truncate text-left font-mono text-xs">{display}</span>
            <Palette className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3" align="start">
          <div className="space-y-3">
            <div className="grid grid-cols-6 gap-2">
              {PRESETS.map((hex) => {
                const isActive = hex.toLowerCase() === safe.toLowerCase();
                return (
                  <button
                    key={hex}
                    type="button"
                    className={cn(
                      "h-8 w-8 rounded-md border border-border/60 transition-transform",
                      "hover:scale-[1.04] active:scale-[0.98]",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      isActive && "ring-2 ring-ring ring-offset-2",
                    )}
                    style={{ backgroundColor: hex }}
                    onClick={() => onChange(hex)}
                    aria-label={`Preset ${hex}`}
                  >
                    {isActive ? <Check className="mx-auto h-4 w-4 text-white drop-shadow" /> : null}
                  </button>
                );
              })}
            </div>

            <div className="rounded-xl border border-border/50 bg-card/40 p-3">
              <HexColorPicker color={valid ? safe : "#6366f1"} onChange={onChange} />
            </div>

            <div className="grid grid-cols-[1fr_auto] items-center gap-2">
              <HexColorInput
                color={safe}
                onChange={(v) => onChange(normalizeHex(v))}
                prefixed
                className={cn(
                  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs font-mono shadow-sm",
                  "ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  !valid && "border-destructive/60",
                )}
              />
              <span
                className="h-9 w-9 rounded-lg border border-border/60"
                style={{ backgroundColor: valid ? safe : "#000000" }}
                aria-hidden="true"
              />
            </div>
            {!valid ? (
              <p className="text-[11px] text-muted-foreground">
                Use a 6-digit hex like <span className="font-mono">#10B981</span>.
              </p>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
