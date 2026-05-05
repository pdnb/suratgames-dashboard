import { NextResponse } from "next/server";
import { fetchSchedule } from "@/lib/scraper";
import { todayBE, parseDateBE } from "@/lib/date";
import type { Schedule } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CacheEntry {
  data: Schedule;
  expiresAt: number;
}

const CACHE_TTL_MS = 60_000;
const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<Schedule>>();

async function getSchedule(dateBE: string): Promise<Schedule> {
  const now = Date.now();
  const cached = cache.get(dateBE);
  if (cached && cached.expiresAt > now) return cached.data;

  const existing = inflight.get(dateBE);
  if (existing) return existing;

  const promise = fetchSchedule(dateBE)
    .then((data) => {
      cache.set(dateBE, { data, expiresAt: Date.now() + CACHE_TTL_MS });
      return data;
    })
    .finally(() => {
      inflight.delete(dateBE);
    });

  inflight.set(dateBE, promise);
  return promise;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const dateParam = url.searchParams.get("date") || todayBE();

  if (!parseDateBE(dateParam)) {
    return NextResponse.json(
      {
        error: "รูปแบบวันที่ไม่ถูกต้อง",
        detail: "กรุณาระบุวันที่ในรูปแบบ DD/MM/YYYY (พ.ศ.) เช่น 05/05/2569",
      },
      { status: 400 }
    );
  }

  try {
    const data = await getSchedule(dateParam);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "ดึงข้อมูลไม่สำเร็จ";
    return NextResponse.json(
      {
        error: "ไม่สามารถดึงข้อมูลจากต้นทางได้",
        detail: message,
      },
      { status: 502 }
    );
  }
}
