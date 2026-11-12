import { Film } from "lucide-react";
import { youtubeEmbedUrl } from "@/lib/youtube";
import type { Play } from "@/lib/types";

export function PlayVideo({
  play,
  signedUrl,
}: {
  play: Play;
  signedUrl?: string | null;
}) {
  if (play.video_type === "youtube" && play.youtube_id) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
        <iframe
          src={youtubeEmbedUrl(play.youtube_id, play.start_seconds, play.end_seconds)}
          title={play.title}
          loading="lazy"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (play.video_type === "upload" && signedUrl) {
    return (
      <video
        src={signedUrl}
        controls
        playsInline
        className="aspect-video w-full rounded-xl bg-black"
      />
    );
  }

  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-court-800 text-court-500">
      <Film className="h-8 w-8" />
    </div>
  );
}
