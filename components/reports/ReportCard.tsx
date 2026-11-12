import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui";

export interface ReportListItem {
  id: string;
  title: string;
  opponent: string | null;
  competition: string | null;
  game_date: string | null;
  updated_at: string;
  play_count: number;
  is_owner: boolean;
}

export function ReportCard({ report }: { report: ReportListItem }) {
  return (
    <Link
      href={`/reports/${report.id}`}
      className="group block rounded-2xl border border-court-700 bg-court-900/60 p-5 transition-colors hover:border-court-600"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-display text-xl font-semibold text-court-100 group-hover:text-hardwood">
            {report.title}
          </h3>
          <p className="mt-1 truncate text-sm text-court-400">
            {[report.opponent, report.competition].filter(Boolean).join(" · ") ||
              "No matchup details"}
          </p>
        </div>
        {!report.is_owner && <Badge>Shared</Badge>}
      </div>

      <div className="mt-5 flex items-center gap-4 text-xs text-court-400">
        <span className="tabular">
          {report.play_count} {report.play_count === 1 ? "play" : "plays"}
        </span>
        <span aria-hidden>·</span>
        <span>{formatDate(report.game_date)}</span>
      </div>
    </Link>
  );
}
