import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatSeconds } from "@/lib/utils";
import { SeverityBadge } from "@/components/ui";
import { PlayVideo } from "@/components/plays/PlayVideo";
import { Comments } from "@/components/plays/Comments";
import { PlayFormDialog } from "@/components/plays/PlayFormDialog";
import { DeletePlayButton } from "@/components/plays/DeletePlayButton";
import { secondaryButton } from "@/lib/styles";
import type { PlayComment, ReportAccess } from "@/lib/types";

export default async function PlayDetailPage({
  params,
}: {
  params: Promise<{ id: string; playId: string }>;
}) {
  const { id, playId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: play } = await supabase
    .from("scout_plays")
    .select("*, author:scout_profiles(display_name)")
    .eq("id", playId)
    .single();
  if (!play) notFound();

  const { data: report } = await supabase
    .from("scout_reports")
    .select("id, owner_id, title")
    .eq("id", play.report_id)
    .single();

  let role: ReportAccess = "viewer";
  if (report && report.owner_id === user.id) {
    role = "owner";
  } else {
    const { data: member } = await supabase
      .from("scout_report_members")
      .select("role")
      .eq("report_id", play.report_id)
      .eq("user_id", user.id)
      .single();
    if (member?.role === "editor") role = "editor";
  }
  const canEdit = role !== "viewer";

  let signedUrl: string | null = null;
  if (play.video_type === "upload" && play.video_path) {
    const { data: signed } = await supabase.storage
      .from("scout-videos")
      .createSignedUrl(play.video_path, 3600);
    signedUrl = signed?.signedUrl ?? null;
  }

  const { data: comments } = await supabase
    .from("scout_play_comments")
    .select("*, author:scout_profiles(display_name)")
    .eq("play_id", playId)
    .order("created_at", { ascending: true });

  return (
    <div>
      <Link
        href={`/reports/${id}`}
        className="inline-block text-sm text-court-400 hover:text-court-100"
      >
        ← Back to report
      </Link>

      <div className="mt-4 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <PlayVideo play={play} signedUrl={signedUrl} />

          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="font-display text-3xl font-bold tracking-tight text-court-100">
                  {play.title}
                </h1>
                <SeverityBadge severity={play.severity} />
              </div>
              {play.category && (
                <p className="mt-1 text-sm text-court-400">{play.category}</p>
              )}
            </div>

            {canEdit && (
              <div className="flex items-center gap-2">
                <PlayFormDialog
                  label="Edit"
                  reportId={id}
                  play={play}
                  triggerClassName={secondaryButton}
                />
                <DeletePlayButton id={play.id} reportId={id} />
              </div>
            )}
          </div>

          {play.description && (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-court-300">
              {play.description}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-1 text-xs text-court-500">
            {(play.start_seconds != null || play.end_seconds != null) && (
              <span className="tabular">
                Clip: {formatSeconds(play.start_seconds) ?? "0:00"} –{" "}
                {formatSeconds(play.end_seconds) ?? "end"}
              </span>
            )}
            {play.author?.display_name && (
              <span>Added by {play.author.display_name}</span>
            )}
          </div>
        </div>

        <aside>
          <Comments
            playId={play.id}
            reportId={id}
            comments={(comments ?? []) as PlayComment[]}
            currentUserId={user.id}
            isOwner={role === "owner"}
          />
        </aside>
      </div>
    </div>
  );
}
