import { LoginForm } from "@/components/LoginForm";
import { CourtMarkings } from "@/components/CourtMarkings";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.14]">
        <CourtMarkings className="h-[110vmin] w-[110vmin]" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-10 text-center">
          <p className="font-display text-5xl font-bold tracking-tight text-court-100">
            CourtVision
          </p>
          <p className="mt-3 text-sm text-court-400">
            Clip the plays. Write your read. Brief the crew.
          </p>
        </div>

        <div className="rounded-2xl border border-court-700 bg-court-900/80 p-6 shadow-2xl shadow-black/40 backdrop-blur">
          <LoginForm next={next} initialError={error === "auth" ? "Could not sign you in. Please try again." : null} />
        </div>

        <p className="mt-8 text-center text-xs text-court-600">
          Built for officials, by officials.
        </p>
      </div>
    </main>
  );
}
