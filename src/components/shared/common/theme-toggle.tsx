"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

type ModeToggleProps = React.ComponentProps<typeof Button>;

export function ModeToggle({ variant = "ghost", size = "icon", className, ...props }: ModeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const handleThemeChange = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <Button
      onClick={handleThemeChange}
      variant={variant}
      size={size}
      className={`relative ${className ?? ""}`}
      {...props}
    >
      <span suppressHydrationWarning>
        {mounted && (theme === "light" ? (
          <Sun className="h-[1.2rem] w-[1.2rem] " />
        ) : (
          <Moon className=" h-[1.2rem] w-[1.2rem]" />
        ))}
      </span>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
