"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { MemberRole } from "@/lib/types";

export async function setMemberRole(
  reportId: string,
  userId: string,
  role: MemberRole,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("scout_report_members")
    .update({ role })
    .eq("report_id", reportId)
    .eq("user_id", userId);

  if (error) return { error: error.message };
  revalidatePath(`/reports/${reportId}`);
  return {};
}

export async function removeMember(
  reportId: string,
  userId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("scout_report_members")
    .delete()
    .eq("report_id", reportId)
    .eq("user_id", userId);

  if (error) return { error: error.message };
  revalidatePath(`/reports/${reportId}`);
  return {};
}
