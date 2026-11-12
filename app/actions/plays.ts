"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { extractYouTubeId } from "@/lib/youtube";
import type { Severity, VideoType } from "@/lib/types";

export type PlayActionState = { error?: string; success?: boolean };

export interface PlayInput {
  report_id: string;
  title: string;
  description?: string | null;
  video_type: VideoType;
  youtube_url?: string | null;
  video_path?: string | null;
  start_seconds?: number | null;
  end_seconds?: number | null;
  category?: string | null;
  severity: Severity;
}

function resolveVideo(input: PlayInput): {
  youtube_id: string | null;
  video_path: string | null;
  error?: string;
} {
  if (input.video_type === "youtube") {
    const youtube_id = extractYouTubeId(input.youtube_url ?? "");
    if (!youtube_id) {
      return {
        youtube_id: null,
        video_path: null,
        error: "That YouTube link isn't valid.",
      };
    }
    return { youtube_id, video_path: null };
  }

  if (!input.video_path) {
    return {
      youtube_id: null,
      video_path: null,
      error: "Upload a video file first.",
    };
  }
  return { youtube_id: null, video_path: input.video_path };
}

export async function createPlay(input: PlayInput): Promise<PlayActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in required." };

  const title = input.title.trim();
  if (!title) return { error: "Give the play a title." };

  const video = resolveVideo(input);
  if (video.error) return { error: video.error };

  const { error } = await supabase
    .from("scout_plays")
    .insert({
      report_id: input.report_id,
      title,
      description: input.description?.trim() || null,
      video_type: input.video_type,
      youtube_id: video.youtube_id,
      video_path: video.video_path,
      start_seconds: input.start_seconds ?? null,
      end_seconds: input.end_seconds ?? null,
      category: input.category || null,
      severity: input.severity,
      created_by: user.id,
    });

  if (error) return { error: error.message };

  revalidatePath(`/reports/${input.report_id}`);
  return { success: true };
}

export async function updatePlay(
  input: PlayInput & { id: string },
): Promise<PlayActionState> {
  const supabase = await createClient();

  const title = input.title.trim();
  if (!title) return { error: "Give the play a title." };

  const video = resolveVideo(input);
  if (video.error) return { error: video.error };

  const { error } = await supabase
    .from("scout_plays")
    .update({
      title,
      description: input.description?.trim() || null,
      video_type: input.video_type,
      youtube_id: video.youtube_id,
      video_path: video.video_path,
      start_seconds: input.start_seconds ?? null,
      end_seconds: input.end_seconds ?? null,
      category: input.category || null,
      severity: input.severity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id);

  if (error) return { error: error.message };

  revalidatePath(`/reports/${input.report_id}`);
  return { success: true };
}

export async function deletePlay(id: string, reportId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("scout_plays").delete().eq("id", id);
  revalidatePath(`/reports/${reportId}`);
}

/** Generate a short-lived signed URL for a private uploaded video. */
export async function getSignedVideoUrl(path: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("scout-videos")
    .createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
}
