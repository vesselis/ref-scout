"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addComment(input: {
  playId: string;
  reportId: string;
  body: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in required." };

  const body = input.body.trim();
  if (!body) return { error: "Comment can't be empty." };

  const { error } = await supabase
    .from("scout_play_comments")
    .insert({ play_id: input.playId, author_id: user.id, body });

  if (error) return { error: error.message };

  revalidatePath(`/reports/${input.reportId}`);
  revalidatePath(`/reports/${input.reportId}/plays/${input.playId}`);
  return {};
}

export async function deleteComment(input: {
  id: string;
  reportId: string;
  playId: string;
}): Promise<void> {
  const supabase = await createClient();
  await supabase.from("scout_play_comments").delete().eq("id", input.id);
  revalidatePath(`/reports/${input.reportId}/plays/${input.playId}`);
  revalidatePath(`/reports/${input.reportId}`);
}
