import { cn } from "@/lib/utils";

/** Decorative half-court line art used as a low-opacity backdrop. */
export function CourtMarkings({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("text-court-400", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.35"
      aria-hidden="true"
    >
      {/* half-court line */}
      <line x1="50" y1="0" x2="50" y2="100" />
      {/* center circle */}
      <circle cx="50" cy="50" r="14" />
      {/* free-throw lane (key) */}
      <rect x="42" y="10" width="16" height="30" />
      <rect x="42" y="60" width="16" height="30" />
      {/* free-throw circles */}
      <path d="M 50 40 a 7 7 0 0 0 -7 -7" />
      <path d="M 50 40 a 7 7 0 0 1 7 -7" />
      <path d="M 50 60 a 7 7 0 0 0 -7 7" />
      <path d="M 50 60 a 7 7 0 0 1 7 7" />
      {/* three-point arcs */}
      <path d="M 20 10 A 42 42 0 0 1 80 10" />
      <path d="M 20 90 A 42 42 0 0 0 80 90" />
    </svg>
  );
}
