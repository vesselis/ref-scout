import Link from "next/link";
import { ReportForm } from "@/components/reports/ReportForm";

export const metadata = { title: "New report" };

export default function NewReportPage() {
  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/reports"
        className="mb-6 inline-block text-sm text-court-400 hover:text-court-100"
      >
        ← Back to reports
      </Link>

      <h1 className="font-display text-3xl font-bold tracking-tight text-court-100">
        New scouting report
      </h1>
      <p className="mb-8 mt-1 text-court-400">
        Name the matchup, then add plays from game film.
      </p>

      <ReportForm />
    </div>
  );
}
