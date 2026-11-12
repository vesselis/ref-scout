"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ActionState =
  | { error?: string; success?: string }
  | undefined;

function str(value: FormDataEntryValue | null): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s === "" ? null : s;
}

export async function createReport(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in first." };

  const title = str(formData.get("title"));
  if (!title) return { error: "Give the report a title." };

  const { data, error } = await supabase
    .from("scout_reports")
    .insert({
      owner_id: user.id,
      title,
      opponent: str(formData.get("opponent")),
      competition: str(formData.get("competition")),
      game_date: str(formData.get("game_date")),
      notes: str(formData.get("notes")),
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/reports");
  redirect(`/reports/${data.id}`);
}

export async function updateReport(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const id = str(formData.get("id"));
  if (!id) return { error: "Missing report id." };

  const title = str(formData.get("title"));
  if (!title) return { error: "Give the report a title." };

  const { error } = await supabase
    .from("scout_reports")
    .update({
      title,
      opponent: str(formData.get("opponent")),
      competition: str(formData.get("competition")),
      game_date: str(formData.get("game_date")),
      notes: str(formData.get("notes")),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/reports");
  revalidatePath(`/reports/${id}`);
  return { success: "Saved" };
}

export async function deleteReport(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("scout_reports").delete().eq("id", id);
  revalidatePath("/reports");
  redirect("/reports");
}
