"use client";

import { useTheme } from "@/lib/theme";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === "dark";
  const label = isDark ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="fixed bottom-4 right-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-900/10 bg-white/80 text-slate-700 shadow-lg shadow-slate-900/10 backdrop-blur-md transition hover:scale-105 hover:border-sky-500/40 hover:text-sky-600 active:scale-95 dark:border-white/10 dark:bg-[var(--color-surface)]/80 dark:text-slate-200 dark:shadow-black/40 dark:hover:border-sky-400/40 dark:hover:text-sky-300 sm:bottom-6 sm:right-6"
    >
      <span className="relative inline-flex h-5 w-5 items-center justify-center">
        <Sun
          size={18}
          className={`absolute transition-all duration-300 ${
            mounted && isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          }`}
        />
        <Moon
          size={18}
          className={`absolute transition-all duration-300 ${
            mounted && isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </span>
    </button>
  );
}
