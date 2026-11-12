"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="rounded-lg border border-court-700 px-3 py-1.5 text-sm text-court-300 transition-colors hover:border-court-600 hover:text-court-100 disabled:opacity-60"
    >
      Sign out
    </button>
  );
}
