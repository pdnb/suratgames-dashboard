# SuratGames 41 — Realtime Dashboard

แอป Next.js ที่ดึงข้อมูลจากเว็บไซต์การกีฬาแห่งประเทศไทย ([suratgames.sat.or.th](https://suratgames.sat.or.th/)) สำหรับงาน **สุราษฎร์ธานีเกมส์ — กีฬาเยาวชนแห่งชาติครั้งที่ 41** แสดงผลแบบหลายมุมมอง: สรุปภาพรวมทั้งงาน ตารางแข่งรายวัน และมุมมองปฏิทินกริด (ถ้าเปิดใช้ URL) โดย decode ภาษาไทยจากต้นทาง (**Windows-874**) ฝั่ง server ก่อน parse

## มุมมองและเส้นทาง

| เส้นทาง | คำอธิบาย |
| -------- | -------- |
| **`/`** | **สรุปภาพรวม** — KPI รวม, กราฟความคืบหน้ารายวัน, รายการแมตช์สด, ตารางเหรียญ, กริดความคืบหน้าตามชนิดกีฬา, รายการรอบชิงวันนี้ ฯลฯ (ดึง `/api/all-overview` + `/api/medals`) |
| **`/daily`** | **ตารางรายวัน** — เลือกวันที่ พ.ศ., กรอง/ค้นหา, การ์ดต่อชนิดกีฬา, แมตช์ LIVE ขึ้นบน (ดึง `/api/schedule` + `/api/medals`) |
| **`/schedule`** | **ปฏิทินกริด** — มิติกีฬา × วัน (`/api/schedule-grid`) *(ลิงก์ในเมนูหลักถูกคอมเมนต์ไว้ใน `SiteNav` — เปิดได้โดยตรงที่ URL)* |
| **`/summary`** | redirect ถาวร (308) ไป **`/`** |

ถ้าเปิดหน้าแรกพร้อม `?date=DD/MM/YYYY` (พ.ศ.) ที่ parse ได้ ระบบจะ **redirect** ไป **`/daily?date=...`** เพื่อดูตารางของวันนั้น

ตัวอย่าง:

```
http://localhost:3000/daily?date=05/05/2569
http://localhost:3000/?date=05/05/2569   → redirect ไป /daily?date=05%2F05%2F2569
```

## คุณสมบัติหลัก

**สรุปภาพรวม (`/`)**

- หัวข้องานปรับได้ผ่าน `NEXT_PUBLIC_EVENT_TITLE` / `NEXT_PUBLIC_EVENT_SUBTITLE`
- สรุปตัวเลขรวม (แมตช์, รอบชิง, สถานะ LIVE / จบ / รอ)
- กราฟและรายการที่อิงข้อมูล day-by-day จากต้นทาง
- แผงแมตช์ที่กำลังแข่ง และรายการรอบชิงของวันนี้ (ตามวันที่ พ.ศ. ของเซิร์ฟเวอร์)
- ตารางเหรียญอันดับต้น ๆ
- สลับธีมสว่าง/มืดได้ (`ThemeToggle`)

**ตารางรายวัน (`/daily`)**

- เลือกวันที่แบบ **พ.ศ.** (ปุ่มเลื่อนวันก่อน/ถัดไป)
- กรองตาม **สถานะ** (กำลังแข่ง / รอแข่ง / จบแล้ว), **ชนิดกีฬา** และ **รอบการแข่งขัน**; ค้นหาตามทีม / รายการ / สนาม
- **ชนิดกีฬาที่ชอบ** (ดาว) — จัดเรียงขึ้นบน; เก็บใน `localStorage` (`favorite-sports`)
- สลับมุมมองแมตช์ **กริด / รายการ** (`LayoutModeToggle`); จำค่าใน `localStorage` (`match-layout`)
- การ์ดแมตช์ LIVE มีขอบเน้นและ pulse; จัดเรียงให้ขึ้นบน
- รีเฟรชอัตโนมัติ **ทุก 5 นาที** + ปุ่มรีเฟรชทันที + เวลาอัปเดตล่าสุด (SWR, revalidate on focus)

**ทั่วไป**

- รองรับมือถือ (responsive)
- ฟอนต์ภาษาไทย (Noto Sans Thai)

## สถาปัตยกรรม

```
Browser ─┬─► GET /api/schedule?date=…        ──► lib/scraper.ts ──► SOURCE_BASE_URL (env)
         ├─► GET /api/all-overview           │     • Buffer → iconv-lite (windows-874 → UTF-8)
         ├─► GET /api/medals                 │     • cheerio → JSON ตาม type ใน lib/types.ts
         ├─► GET /api/schedule-grid          │
         └─► GET /api/schedule-final          │
              │
              ├─ schedule / medals / schedule-grid / schedule-final:
              │    in-memory cache ~5 นาที, Cache-Control s-maxage=300
              └─ all-overview:
                   in-memory cache ~2 นาที, Cache-Control s-maxage=120

UI: SWR — หน้าสรุปและตารางรายวัน/กริดรีเฟรช client ทุก 5 นาที (300_000 ms)
```

จุดสำคัญ: เว็บต้นทางใช้ encoding **Windows-874 (TIS-620)** จึงต้อง decode ฝั่ง server ก่อน parse — ไม่งั้นภาษาไทยจะอ่านไม่ออก

## โครงสร้างไฟล์ (จัดกลุ่ม)

```
app/
  layout.tsx, globals.css, page.tsx          # รูท, ฟอนต์, ธีม
  daily/page.tsx                               # ตารางรายวัน
  schedule/page.tsx                            # ปฏิทินกริด
  summary/page.tsx                             # redirect → /
  api/
    schedule/route.ts
    all-overview/route.ts
    medals/route.ts
    schedule-grid/route.ts
    schedule-final/route.ts
components/
  SummaryDashboard.tsx, DailyDashboard.tsx, ScheduleGridDashboard.tsx
  SiteNav.tsx, ThemeToggle.tsx, RefreshIndicator.tsx, LayoutModeToggle.tsx
  DatePickerBE.tsx, FilterBar.tsx, StatsHeader.tsx
  SportSection.tsx, MatchRow.tsx, StatusBadge.tsx, ChampionshipSection.tsx
  LiveMatchesPanel.tsx, TopMedalsWidget.tsx, SportProgressGrid.tsx
  DailyProgressChart.tsx, DailyFinalsProgressChart.tsx, TodayFinalsList.tsx
  …
lib/
  types.ts, date.ts, scraper.ts, site-config.ts
  championship-round.ts, round-order.ts, favorite-sports.ts, match-layout.ts
  theme.tsx
.env.example
```

## การตั้งค่า (Environment)

คัดลอกจาก [`.env.example`](.env.example) เป็น `.env.local` แล้วปรับตามต้องการ:

| ตัวแปร | ขอบเขต | คำอธิบาย |
| ------ | ------ | -------- |
| `SOURCE_BASE_URL` | Server | URL ฐานของเว็บต้นทางสำหรับ scrape (ค่าเริ่มต้น `https://suratgames.sat.or.th/`) |
| `NEXT_PUBLIC_EVENT_TITLE` | Client | หัวข้อหลักบนหน้าสรุปภาพรวม (`/`) |
| `NEXT_PUBLIC_EVENT_SUBTITLE` | Client | คำบรรยายใต้หัวข้อบนหน้าสรุปภาพรวม |

ค่าที่อ่านจาก env รวมศูนย์ที่ [`lib/site-config.ts`](lib/site-config.ts) — scraper ใช้ `SOURCE_BASE_URL` สร้างลิงก์ทุกหน้าต้นทาง

## การติดตั้งและรัน

ต้องการ Node.js เวอร์ชัน **18.18+** หรือใหม่กว่า

### Development (พัฒนาในเครื่อง)

```bash
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm install
npm run dev
```

เปิดเบราว์เซอร์ที่ <http://localhost:3000> — หน้าแรกคือ **สรุปภาพรวม** ตารางรายวันของวันนี้ (พ.ศ.) อยู่ที่ **`/daily`**

```bash
npm run lint
```

### Production (เซิร์ฟเวอร์ / deploy)

ขั้นตอนสำหรับรันแบบ production บนเครื่องหรือ VPS (ไม่ใช่ `next dev`):

1. **ตั้งค่า environment** — สร้าง `.env.local` (หรือตั้งตัวแปรในระบบ deploy) จาก [`.env.example`](.env.example):

   ```bash
   cp .env.example .env.local   # Windows: copy .env.example .env.local
   ```

   | ตัวแปร | หมายเหตุ production |
   | ------ | ------------------- |
   | `SOURCE_BASE_URL` | ต้องเข้าถึงได้จากเซิร์ฟเวอร์ (outbound HTTP ไปเว็บต้นทาง) |
   | `NEXT_PUBLIC_EVENT_*` | ฝังตอน **`npm run build`** — เปลี่ยนค่าต้อง build ใหม่ |

2. **ติดตั้ง dependencies และ build**

   ```bash
   npm ci
   npm run build
   ```

   `npm ci` ใช้ lockfile ให้เวอร์ชันแพ็กเกจตรงกับที่ทดสอบแล้ว (แนะนำบนเซิร์ฟเวอร์) — ถ้าไม่มี `package-lock.json` ให้ใช้ `npm install` แทน

3. **สตาร์ทแอป**

   ```bash
   npm start
   ```

   ค่าเริ่มต้นฟังที่พอร์ต **3000** — เปลี่ยนพอร์ตได้:

   ```bash
   # Linux / macOS
   PORT=8080 npm start

   # Windows (PowerShell)
   $env:PORT=8080; npm start
   ```

   เปิด <http://localhost:3000> (หรือพอร์ตที่ตั้ง) — ใช้ reverse proxy (เช่น Nginx, Caddy) หน้า Node ถ้าต้องการ HTTPS หรือโดเมนจริง

4. **รันค้างหลังปิดเทอร์มินัล (ตัวเลือก)** — ใช้ process manager เช่น [PM2](https://pm2.keymetrics.io/):

   ```bash
   npm install -g pm2
   pm2 start npm --name suratgame-dashboard -- start
   pm2 save
   pm2 startup
   ```

**Deploy บน Vercel / แพลตฟอร์ม serverless:** push repo แล้วตั้ง Environment Variables ใน dashboard ให้ตรงกับ `.env.example` (โดยเฉพาะ `NEXT_PUBLIC_*` ก่อน build) — API routes จะ scrape ฝั่ง server ตาม `SOURCE_BASE_URL` เช่นเดียวกับรันด้วย `npm start`

**ตรวจหลัง deploy:** ลอง `GET /api/medals` และเปิด `/` กับ `/daily` ว่าโหลดข้อมูลและภาษาไทยถูกต้อง

## API

| Endpoint | คำอธิบาย | Cache (โดยประมาณ) |
| -------- | -------- | ------------------- |
| `GET /api/schedule?date=DD/MM/YYYY` | ตารางแข่งของวันนั้น (พ.ศ.); ไม่ระบุ `date` = วันนี้ | Server ~5 นาที, `s-maxage=300` |
| `GET /api/all-overview` | ภาพรวมทุกวันแข่ง + สปอร์ต + แมตช์สด + รอบชิงวันนี้ | Server ~2 นาที, `s-maxage=120` |
| `GET /api/medals` | ตารางเหรียญ | Server ~5 นาที, `s-maxage=300` |
| `GET /api/schedule-grid` | มิติกีฬา × วัน (compete / final) | Server ~5 นาที, `s-maxage=300` |
| `GET /api/schedule-final` | ข้อมูลจากหน้า schedule รอบชิง/สรุปเหรียญ (matrix) — **ยังไม่ถูกเรียกจาก UI** แต่เปิดใช้เป็น JSON ได้ | Server ~5 นาที, `s-maxage=300` |

### `GET /api/schedule?date=DD/MM/YYYY`

| พารามิเตอร์ | คำอธิบาย |
| ----------- | -------- |
| `date` | วันที่ พ.ศ. `DD/MM/YYYY` เช่น `05/05/2569` (ไม่ระบุ = วันนี้) |

ตัวอย่างผลลัพธ์ (ย่อ — ฟิลด์ใน `stats` และ `championshipSummary` อาจมีตามที่ parse ได้):

```json
{
  "dateBE": "05/05/2569",
  "dateAD": "2026-05-05",
  "fetchedAt": "2026-05-05T02:30:00.000Z",
  "sourceUrl": "https://suratgames.sat.or.th/compettable2-dwt.asp?dateid=05%2F05%2F2569",
  "stats": {
    "totalSports": 6,
    "totalMatches": 72,
    "liveMatches": 2,
    "finishedMatches": 2,
    "pendingMatches": 68,
    "championshipMatchCount": 0,
    "finishedChampionshipMatchCount": 0,
    "goldMedalEvents": 0
  },
  "championshipSummary": [],
  "sports": [
    {
      "name": "ฮอกกี้",
      "total": 9,
      "liveCount": 2,
      "finishedCount": 2,
      "pendingCount": 5,
      "matches": [
        {
          "id": "HK001",
          "sportId": "119",
          "sport": "ฮอกกี้",
          "event": "กลางแจ้ง Outdoor ทีมชาย สาย A คู่ที่ 1 นครนายก vs บุรีรัมย์",
          "round": "รอบแรก",
          "time": "08:00",
          "venue": "สนามฟุตบอล โรงเรียนพุนพินพิทยาคม",
          "venueUrl": "https://suratgames.sat.or.th/?stche_id=HK001&st_sportid=119",
          "startListUrl": "https://suratgames.sat.or.th/Startlist-dwt.asp?stdate=05/05/2569&stche_id=HK001&sthest=46",
          "resultUrl": "https://suratgames.sat.or.th/rep_hockey.asp?stche_id=HK001&st_sportid=119&f_hestid=46",
          "status": "FINISHED"
        }
      ]
    }
  ]
}
```

## หมายเหตุ

- ข้อมูลทั้งหมดเป็นกรรมสิทธิ์ของการกีฬาแห่งประเทศไทย ([suratgames.sat.or.th](https://suratgames.sat.or.th/)). โปรเจกต์นี้เป็นเพียงตัวกลางในการแสดงผลเท่านั้น
- เวลาเริ่มแข่งเป็นค่าโดยประมาณ ตารางอาจมีการเปลี่ยนแปลงตามประกาศจากต้นทาง
- การดึงข้อมูลแยกเป็นหลายฟังก์ชันใน [`lib/scraper.ts`](lib/scraper.ts) — หากต้นทางเปลี่ยน HTML structure อาจต้องปรับจุด parse ที่เกี่ยวข้อง

## Tech Stack

- [Next.js 15.1](https://nextjs.org/) (App Router) + React 19
- TypeScript 5.7
- [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first config)
- [SWR](https://swr.vercel.app/) — auto-refresh + revalidation
- [cheerio](https://cheerio.js.org/) — HTML parsing
- [iconv-lite](https://github.com/ashtuchkin/iconv-lite) — Windows-874 decoding
- [date-fns](https://date-fns.org/) v4, [lucide-react](https://lucide.dev/)
