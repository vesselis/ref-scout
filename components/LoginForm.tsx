"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

export function LoginForm({
  next,
  initialError,
}: {
  next?: string;
  initialError?: string | null;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    const supabase = createClient();
    const destination = next ?? "/reports";

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName.trim() || undefined } },
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      if (data.session) {
        router.push(destination);
        router.refresh();
        return;
      }
      setMode("signin");
      setNotice("Account created. Check your inbox to confirm, then sign in.");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    router.push(destination);
    router.refresh();
  }

  const inputClass =
    "w-full rounded-lg border border-court-700 bg-court-950/70 px-3 py-2.5 text-sm text-court-100 placeholder:text-court-600 focus:border-hardwood focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex rounded-lg border border-court-700 p-1 text-sm">
        {(["signin", "signup"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setMode(value);
              setError(null);
              setNotice(null);
            }}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 font-medium transition-colors",
              mode === value
                ? "bg-hardwood text-court-950"
                : "text-court-400 hover:text-court-100",
            )}
          >
            {value === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      {mode === "signup" && (
        <div>
          <label htmlFor="displayName" className="mb-1.5 block text-xs text-court-400">
            Name
          </label>
          <input
            id="displayName"
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Jane Doe"
            className={inputClass}
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs text-court-400">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs text-court-400">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className={inputClass}
        />
      </div>

      {error && (
        <p className="rounded-lg border border-severity-high/40 bg-severity-high/10 px-3 py-2 text-sm text-severity-high">
          {error}
        </p>
      )}
      {notice && (
        <p className="rounded-lg border border-court-700 bg-court-800/60 px-3 py-2 text-sm text-court-300">
          {notice}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-hardwood px-3 py-2.5 text-sm font-semibold text-court-950 transition-colors hover:bg-hardwood-strong disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "One moment…"
          : mode === "signin"
            ? "Sign in"
            : "Create account"}
      </button>
    </form>
  );
}
