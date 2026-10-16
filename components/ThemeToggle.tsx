"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

type ThemeToggleProps = {
  darkMode: boolean;
  onToggle: () => void;
};

export function ThemeToggle({ darkMode, onToggle }: ThemeToggleProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-lg"
      className="rounded-full bg-card shadow-sm dark:bg-card"
      onClick={onToggle}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? <Sun /> : <Moon />}
    </Button>
  );
}
