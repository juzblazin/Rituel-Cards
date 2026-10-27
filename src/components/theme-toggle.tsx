"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/cn";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
      className={cn("relative", className)}
    >
      <Sun
        aria-hidden="true"
        className="size-4 rotate-90 scale-0 transition-all duration-300 motion-reduce:transition-none dark:rotate-0 dark:scale-100"
      />
      <Moon
        aria-hidden="true"
        className="absolute size-4 rotate-0 scale-100 transition-all duration-300 motion-reduce:transition-none dark:-rotate-90 dark:scale-0"
      />
    </Button>
  );
}
