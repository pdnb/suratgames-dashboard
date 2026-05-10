import SummaryDashboard from "@/components/SummaryDashboard";
import { parseDateBE } from "@/lib/date";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const requested = params?.date;
  if (requested && parseDateBE(requested)) {
    redirect(`/daily?date=${encodeURIComponent(requested)}`);
  }
  return <SummaryDashboard />;
}
