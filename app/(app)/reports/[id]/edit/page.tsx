import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReportForm } from "@/components/reports/ReportForm";

export const metadata = { title: "Edit report" };

export default async function EditReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: report } = await supabase
    .from("scout_reports")
    .select("*")
    .eq("id", id)
    .single();
  if (!report) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href={`/reports/${id}`}
        className="mb-6 inline-block text-sm text-court-400 hover:text-court-100"
      >
        ← Back to report
      </Link>

      <h1 className="font-display text-3xl font-bold tracking-tight text-court-100">
        Edit report
      </h1>
      <p className="mb-8 mt-1 text-court-400">
        Update the matchup details and your notes.
      </p>

      <ReportForm
        reportId={report.id}
        report={{
          title: report.title,
          opponent: report.opponent ?? "",
          competition: report.competition ?? "",
          game_date: report.game_date ?? "",
          notes: report.notes ?? "",
        }}
      />
    </div>
  );
}
