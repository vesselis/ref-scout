import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ShareLinkHandler({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("join_report_by_token", {
    p_token: token,
  });

  if (error || !data) {
    notFound();
  }

  redirect(`/reports/${data}`);
}
