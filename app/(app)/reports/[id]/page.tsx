import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Badge, EmptyState } from "@/components/ui";
import { ShareButton } from "@/components/reports/ShareButton";
import { DeleteReportButton } from "@/components/DeleteReportButton";
import { Members, type MemberItem } from "@/components/reports/Members";
import { PlayCard } from "@/components/plays/PlayCard";
import { PlayFormDialog } from "@/components/plays/PlayFormDialog";
import { primaryButton, secondaryButton } from "@/lib/styles";
import type { Play, ReportAccess } from "@/lib/types";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: report } = await supabase
    .from("scout_reports")
    .select("*")
    .eq("id", id)
    .single();
  if (!report) notFound();

  let role: ReportAccess = "viewer";
  if (report.owner_id === user.id) {
    role = "owner";
  } else {
    const { data: member } = await supabase
      .from("scout_report_members")
      .select("role")
      .eq("report_id", id)
      .eq("user_id", user.id)
      .single();
    if (member?.role === "editor") role = "editor";
  }
  const canEdit = role !== "viewer";

  const { data: plays } = await supabase
    .from("scout_plays")
    .select("*, comments:scout_play_comments(count)")
    .eq("report_id", id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const playList: Play[] = (plays ?? []).map((p) => ({
    ...p,
    comment_count:
      Array.isArray(p.comments) && p.comments[0] ? p.comments[0].count : 0,
  }));

  let members: MemberItem[] = [];
  if (role === "owner") {
    const { data: memberRows } = await supabase
      .from("scout_report_members")
      .select("user_id, role, profile:scout_profiles(display_name)")
      .eq("report_id", id);
    members = (memberRows ?? []) as unknown as MemberItem[];
  }

  return (
    <div>
      <Link
        href="/reports"
        className="inline-block text-sm text-court-400 hover:text-court-100"
      >
        ← All reports
      </Link>

      <div className="mt-4 mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-4xl font-bold tracking-tight text-court-100">
              {report.title}
            </h1>
            {role !== "owner" && <Badge>Shared</Badge>}
          </div>
          <p className="mt-2 text-sm text-court-400">
            {[report.opponent, report.competition].filter(Boolean).join(" · ") ||
              "No matchup details"}
            <span className="mx-2 text-court-600" aria-hidden>
              ·
            </span>
            {formatDate(report.game_date)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ShareButton token={report.share_token} />
          {canEdit && (
            <Link href={`/reports/${id}/edit`} className={secondaryButton}>
              Edit
            </Link>
          )}
          {role === "owner" && <DeleteReportButton id={report.id} />}
        </div>
      </div>

      {report.notes && (
        <p className="mb-8 max-w-3xl whitespace-pre-wrap rounded-2xl border border-court-800 bg-court-900/40 p-4 text-sm text-court-300">
          {report.notes}
        </p>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold text-court-100">
          Plays
        </h2>
        {canEdit && (
          <PlayFormDialog
            label="Add play"
            reportId={id}
            triggerClassName={primaryButton}
          />
        )}
      </div>

      {playList.length === 0 ? (
        <EmptyState
          title="No plays yet"
          description={
            canEdit
              ? "Clip the first play from game film — paste a YouTube link or upload a video."
              : "The owner hasn't added any plays yet."
          }
        />
      ) : (
        <div className="space-y-3">
          {playList.map((play) => (
            <PlayCard key={play.id} play={play} reportId={id} />
          ))}
        </div>
      )}

      {role === "owner" && (
        <section className="mt-12">
          <h2 className="mb-4 font-display text-2xl font-semibold text-court-100">
            Crew access
          </h2>
          <Members reportId={id} members={members} />
        </section>
      )}
    </div>
  );
}
