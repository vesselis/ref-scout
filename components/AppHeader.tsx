import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "./Logo";
import { SignOutButton } from "./SignOutButton";

export async function AppHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let label = user?.email ?? "Account";
  if (user) {
    const { data } = await supabase
      .from("scout_profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();
    if (data?.display_name) label = data.display_name;
  }

  return (
    <header className="sticky top-0 z-30 border-b border-court-800 bg-court-950/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/reports" aria-label="CourtVision home">
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-court-400 sm:block">{label}</span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
