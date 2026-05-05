import Dashboard from "@/components/Dashboard";
import { todayBE, parseDateBE } from "@/lib/date";

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const requested = params?.date;
  const initialDate =
    requested && parseDateBE(requested) ? requested : todayBE();
  return <Dashboard initialDate={initialDate} />;
}
