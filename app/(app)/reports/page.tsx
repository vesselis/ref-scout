import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ReportCard, type ReportListItem } from "@/components/reports/ReportCard";
import { EmptyState } from "@/components/ui";
import { primaryButton } from "@/lib/styles";

export const metadata = { title: "Scouting reports" };

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("scout_reports")
    .select(
      "id, title, opponent, competition, game_date, updated_at, owner_id, plays:scout_plays(count)",
    )
    .order("updated_at", { ascending: false });

  const reports: ReportListItem[] = (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    opponent: row.opponent,
    competition: row.competition,
    game_date: row.game_date,
    updated_at: row.updated_at,
    play_count: Array.isArray(row.plays) && row.plays[0] ? row.plays[0].count : 0,
    is_owner: row.owner_id === user.id,
  }));

  const owned = reports.filter((r) => r.is_owner);
  const shared = reports.filter((r) => !r.is_owner);

  return (
    <div>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-court-100">
            Scouting reports
          </h1>
          <p className="mt-1 text-court-400">
            Your game preparations and the ones shared with you.
          </p>
        </div>
        <Link href="/reports/new" className={primaryButton}>
          New report
        </Link>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          title="No reports yet"
          description="Create your first scouting report to start clipping plays from game film."
          action={
            <Link href="/reports/new" className={primaryButton}>
              New report
            </Link>
          }
        />
      ) : (
        <div className="space-y-10">
          {owned.length > 0 && (
            <section>
              <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-court-400">
                Yours
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {owned.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            </section>
          )}

          {shared.length > 0 && (
            <section>
              <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-court-400">
                Shared with you
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {shared.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
