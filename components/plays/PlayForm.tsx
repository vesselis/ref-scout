"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createPlay, updatePlay } from "@/app/actions/plays";
import {
  PLAY_CATEGORIES,
  SEVERITY_LABELS,
  type Play,
  type Severity,
  type VideoType,
} from "@/lib/types";
import { cn, formatSeconds } from "@/lib/utils";
import { inputClass, labelClass, primaryButton, secondaryButton } from "@/lib/styles";

export function PlayForm({
  reportId,
  play,
  onClose,
}: {
  reportId: string;
  play?: Play;
  onClose: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [videoType, setVideoType] = useState<VideoType>(
    play?.video_type ?? "youtube",
  );
  const [youtubeUrl, setYoutubeUrl] = useState(
    play?.youtube_id
      ? `https://www.youtube.com/watch?v=${play.youtube_id}`
      : "",
  );
  const [file, setFile] = useState<File | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setError(null);
    setLoading(true);

    const title = String(data.get("title") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();
    const start_seconds = parseClip(String(data.get("start_seconds") ?? ""));
    const end_seconds = parseClip(String(data.get("end_seconds") ?? ""));
    const category = String(data.get("category") ?? "") || null;
    const severity = (String(data.get("severity") ?? "medium")) as Severity;

    let video_path = play?.video_path ?? null;

    if (videoType === "upload" && file) {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "mp4";
      const filename = `${crypto.randomUUID()}.${ext}`;
      const path = `${reportId}/${filename}`;
      const { error: uploadError } = await supabase.storage
        .from("scout-videos")
        .upload(path, file);
      if (uploadError) {
        setError(uploadError.message);
        setLoading(false);
        return;
      }
      video_path = path;
    }

    const input = {
      report_id: reportId,
      title,
      description: description || null,
      video_type: videoType,
      youtube_url: videoType === "youtube" ? youtubeUrl : null,
      video_path: videoType === "upload" ? video_path : null,
      start_seconds,
      end_seconds,
      category,
      severity,
    };

    const result = play
      ? await updatePlay({ ...input, id: play.id })
      : await createPlay(input);

    setLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    onClose();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="play-title" className={labelClass}>
          Title
        </label>
        <input
          id="play-title"
          name="title"
          required
          defaultValue={play?.title ?? ""}
          placeholder="e.g. Late travel on the baseline drive"
          className={inputClass}
        />
      </div>

      <div>
        <span className={labelClass}>Clip source</span>
        <div className="flex rounded-lg border border-court-700 p-1 text-sm">
          {(["youtube", "upload"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setVideoType(value)}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 font-medium transition-colors",
                videoType === value
                  ? "bg-hardwood text-court-950"
                  : "text-court-400 hover:text-court-100",
              )}
            >
              {value === "youtube" ? "YouTube" : "Upload"}
            </button>
          ))}
        </div>
      </div>

      {videoType === "youtube" ? (
        <div>
          <label htmlFor="youtube-url" className={labelClass}>
            YouTube link
          </label>
          <input
            id="youtube-url"
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
            className={inputClass}
          />
        </div>
      ) : (
        <div>
          <label htmlFor="video-file" className={labelClass}>
            Video file
          </label>
          <input
            id="video-file"
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-court-400 file:mr-4 file:rounded-lg file:border-0 file:bg-court-800 file:px-4 file:py-2 file:text-sm file:text-court-100 hover:file:bg-court-700"
          />
          {play?.video_path && !file && (
            <p className="mt-1.5 text-xs text-court-400">
              A video is already uploaded. Choose a new file to replace it.
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_seconds" className={labelClass}>
            Clip start
          </label>
          <input
            id="start_seconds"
            name="start_seconds"
            defaultValue={play?.start_seconds != null ? formatSeconds(play.start_seconds) ?? "" : ""}
            placeholder="0:00"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="end_seconds" className={labelClass}>
            Clip end
          </label>
          <input
            id="end_seconds"
            name="end_seconds"
            defaultValue={play?.end_seconds != null ? formatSeconds(play.end_seconds) ?? "" : ""}
            placeholder="0:15"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className={labelClass}>
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={play?.category ?? ""}
            className={inputClass}
          >
            <option value="">— choose —</option>
            {PLAY_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="severity" className={labelClass}>
            Severity
          </label>
          <select
            id="severity"
            name="severity"
            defaultValue={play?.severity ?? "medium"}
            className={inputClass}
          >
            {(Object.keys(SEVERITY_LABELS) as Severity[]).map((value) => (
              <option key={value} value={value}>
                {SEVERITY_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          What to watch for
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={play?.description ?? ""}
          placeholder="Describe the play and what the crew should look for…"
          className={inputClass}
        />
      </div>

      {error && (
        <p className="rounded-lg border border-severity-high/40 bg-severity-high/10 px-3 py-2 text-sm text-severity-high">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className={primaryButton}>
          {loading ? "Saving…" : play ? "Save changes" : "Add play"}
        </button>
        <button type="button" onClick={onClose} className={secondaryButton}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function parseClip(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const clock = trimmed.match(/^(?:(\d+):)?(\d{1,2})$/);
  if (clock) {
    const minutes = clock[1] ? parseInt(clock[1], 10) : 0;
    const seconds = parseInt(clock[2], 10);
    return minutes * 60 + seconds;
  }
  const plain = Number(trimmed);
  return Number.isFinite(plain) ? plain : null;
}
