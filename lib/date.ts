const BE_OFFSET = 543;

const THAI_MONTHS_FULL = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const THAI_MONTHS_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

export interface DateBEParts {
  day: number;
  month: number;
  year: number;
}

const pad2 = (n: number) => n.toString().padStart(2, "0");

export function parseDateBE(value: string): DateBEParts | null {
  const m = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const year = parseInt(m[3], 10);
  if (
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12 ||
    year < 2400 ||
    year > 2700
  ) {
    return null;
  }
  return { day, month, year };
}

export function formatDateBE(parts: DateBEParts): string {
  return `${pad2(parts.day)}/${pad2(parts.month)}/${parts.year}`;
}

export function dateBEToISO(parts: DateBEParts): string {
  const ad = parts.year - BE_OFFSET;
  return `${ad}-${pad2(parts.month)}-${pad2(parts.day)}`;
}

export function dateBEToJS(parts: DateBEParts): Date {
  return new Date(parts.year - BE_OFFSET, parts.month - 1, parts.day);
}

export function dateJSToBE(date: Date): DateBEParts {
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear() + BE_OFFSET,
  };
}

export function todayBE(): string {
  return formatDateBE(dateJSToBE(new Date()));
}

export function shiftDateBE(value: string, days: number): string | null {
  const parts = parseDateBE(value);
  if (!parts) return null;
  const d = dateBEToJS(parts);
  d.setDate(d.getDate() + days);
  return formatDateBE(dateJSToBE(d));
}

export function formatThaiLong(value: string): string {
  const parts = parseDateBE(value);
  if (!parts) return value;
  return `${parts.day} ${THAI_MONTHS_FULL[parts.month - 1]} ${parts.year}`;
}

export function formatThaiShort(value: string): string {
  const parts = parseDateBE(value);
  if (!parts) return value;
  return `${parts.day} ${THAI_MONTHS_SHORT[parts.month - 1]} ${parts.year}`;
}

export function isoToDateBE(iso: string): string | null {
  const m = iso.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return null;
  const year = parseInt(m[1], 10) + BE_OFFSET;
  const month = parseInt(m[2], 10);
  const day = parseInt(m[3], 10);
  return formatDateBE({ day, month, year });
}
