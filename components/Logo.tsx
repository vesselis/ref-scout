import { cn } from "@/lib/utils";

export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-hardwood text-court-950">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v18" />
          <path d="M3 12h18" />
          <path d="M5.6 5.6c2.6 3 6.4 4.8 12.8 12.8" />
          <path d="M18.4 5.6c-2.6 3-6.4 4.8-12.8 12.8" />
        </svg>
      </span>
      {!compact && (
        <span className="font-display text-xl font-semibold tracking-tight text-court-100">
          CourtVision
        </span>
      )}
    </span>
  );
}
