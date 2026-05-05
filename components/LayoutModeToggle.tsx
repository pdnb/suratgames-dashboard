"use client";

import type { MatchLayoutMode } from "@/lib/match-layout";
import { LayoutGrid, List } from "lucide-react";

interface Props {
  value: MatchLayoutMode;
  onChange: (mode: MatchLayoutMode) => void;
}

const baseBtn =
  "inline-flex items-center justify-center rounded-full border border-transparent p-2 text-slate-600 transition hover:border-slate-900/20 hover:bg-slate-900/10 dark:text-slate-300 dark:hover:border-white/20 dark:hover:bg-white/10";

const activeBtn =
  "border-sky-500/60 bg-sky-500/15 text-sky-700 dark:border-sky-400/50 dark:bg-sky-500/10 dark:text-sky-200";

export default function LayoutModeToggle({ value, onChange }: Props) {
  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-full border border-slate-900/10 bg-slate-900/5 p-1 dark:border-white/10 dark:bg-white/5"
      role="group"
      aria-label="มุมมองรายการ"
    >
      <button
        type="button"
        onClick={() => onChange("grid")}
        title="แสดงแบบกริด"
        aria-pressed={value === "grid"}
        className={`${baseBtn} ${value === "grid" ? activeBtn : ""}`}
      >
        <LayoutGrid size={16} aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        title="แสดงแบบรายการ"
        aria-pressed={value === "list"}
        className={`${baseBtn} ${value === "list" ? activeBtn : ""}`}
      >
        <List size={16} aria-hidden />
      </button>
    </div>
  );
}
