import { NextResponse } from "next/server";
import { fetchAllDayByDay } from "@/lib/scraper";
import type { AllOverview } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CacheEntry {
  data: AllOverview;
  expiresAt: number;
}

const CACHE_TTL_MS = 120_000;
let currentCache: CacheEntry | null = null;
let inflight: Promise<AllOverview> | null = null;

async function getOverview(): Promise<AllOverview> {
  const now = Date.now();
  if (currentCache && currentCache.expiresAt > now) return currentCache.data;
  if (inflight) return inflight;

  inflight = fetchAllDayByDay()
    .then((data) => {
      currentCache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
      return data;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export async function GET() {
  try {
    const data = await getOverview();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "ดึงข้อมูลไม่สำเร็จ";
    return NextResponse.json(
      {
        error: "ไม่สามารถดึงข้อมูลภาพรวมจากต้นทางได้",
        detail: message,
      },
      { status: 502 }
    );
  }
}
