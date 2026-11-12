import Link from "next/link";
import Image from "next/image";
import { Film, MessageSquare } from "lucide-react";
import { formatSeconds } from "@/lib/utils";
import { SeverityBadge } from "@/components/ui";
import type { Play } from "@/lib/types";

export function PlayCard({
  play,
  reportId,
}: {
  play: Play;
  reportId: string;
}) {
  const thumbnail =
    play.video_type === "youtube" && play.youtube_id
      ? `https://i.ytimg.com/vi/${play.youtube_id}/hqdefault.jpg`
      : null;

  return (
    <Link
      href={`/reports/${reportId}/plays/${play.id}`}
      className="group flex gap-4 rounded-2xl border border-court-700 bg-court-900/60 p-4 transition-colors hover:border-court-600"
    >
      <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg bg-court-800">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt=""
            fill
            sizes="160px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-court-500">
            <Film className="h-6 w-6" />
          </div>
        )}
        {play.start_seconds != null && (
          <span className="tabular absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[10px] text-court-100">
            {formatSeconds(play.start_seconds)}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-display text-lg font-semibold text-court-100 group-hover:text-hardwood">
            {play.title}
          </h3>
          <SeverityBadge severity={play.severity} />
        </div>

        {play.category && (
          <p className="mt-0.5 text-xs text-court-400">{play.category}</p>
        )}

        {play.description && (
          <p className="mt-2 line-clamp-2 text-sm text-court-400">
            {play.description}
          </p>
        )}

        <div className="mt-3 flex items-center gap-3 text-xs text-court-500">
          {play.video_type === "upload" && <span>Uploaded clip</span>}
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {play.comment_count ?? 0}
          </span>
        </div>
      </div>
    </Link>
  );
}
