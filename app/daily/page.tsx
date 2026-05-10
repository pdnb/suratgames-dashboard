import Dashboard from "@/components/DailyDashboard";
import { todayBE, parseDateBE } from "@/lib/date";

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DailyPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const requested = params?.date;
  const initialDate =
    requested && parseDateBE(requested) ? requested : todayBE();
  return <Dashboard initialDate={initialDate} />;
}
