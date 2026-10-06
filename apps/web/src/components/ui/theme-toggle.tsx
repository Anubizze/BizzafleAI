"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dark = !mounted || theme === "dark";

  return (
    <button
      type="button"
      aria-label="Переключить тему"
      onClick={() => setTheme(dark ? "light" : "dark")}
      className={`inline-flex size-10 items-center justify-center rounded-full border border-line text-ink-muted transition duration-300 hover:text-ink ${className ?? ""}`}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
