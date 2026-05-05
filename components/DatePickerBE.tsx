"use client";

import {
  dateBEToISO,
  formatThaiLong,
  isoToDateBE,
  parseDateBE,
  shiftDateBE,
} from "@/lib/date";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useId, useMemo } from "react";

interface Props {
  value: string;
  onChange: (next: string) => void;
}

export default function DatePickerBE({ value, onChange }: Props) {
  const id = useId();
  const isoValue = useMemo(() => {
    const parts = parseDateBE(value);
    return parts ? dateBEToISO(parts) : "";
  }, [value]);

  const handleNative = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iso = e.target.value;
    if (!iso) return;
    const be = isoToDateBE(iso);
    if (be) onChange(be);
  };

  const handleShift = (days: number) => {
    const next = shiftDateBE(value, days);
    if (next) onChange(next);
  };

  const longLabel = formatThaiLong(value);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 p-1 pr-2 dark:border-white/10 dark:bg-white/5">
      <button
        type="button"
        onClick={() => handleShift(-1)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-900/5 hover:text-sky-700 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-sky-300"
        aria-label="วันก่อนหน้า"
      >
        <ChevronLeft size={16} />
      </button>
      <label
        htmlFor={id}
        className="inline-flex items-center gap-2 px-2 text-sm text-slate-900 dark:text-slate-100"
      >
        <Calendar size={14} className="opacity-70" />
        <span className="font-medium">{longLabel}</span>
        <input
          id={id}
          type="date"
          value={isoValue}
          onChange={handleNative}
          className="absolute h-0 w-0 opacity-0"
          tabIndex={-1}
        />
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById(id) as HTMLInputElement | null;
            el?.showPicker?.();
            el?.focus();
          }}
          className="ml-1 rounded-md border border-slate-900/10 px-2 py-0.5 text-xs text-slate-600 hover:border-sky-500/40 hover:text-sky-700 dark:border-white/10 dark:text-slate-300 dark:hover:border-sky-400/40 dark:hover:text-sky-300"
        >
          เปลี่ยน
        </button>
      </label>
      <button
        type="button"
        onClick={() => handleShift(1)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-900/5 hover:text-sky-700 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-sky-300"
        aria-label="วันถัดไป"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
