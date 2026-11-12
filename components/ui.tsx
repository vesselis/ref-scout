import { cn } from "@/lib/utils";
import { Severity } from "@/lib/types";

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: "neutral" | "amber" | "red" | "green";
  children: React.ReactNode;
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "border-court-700 bg-court-800/60 text-court-300",
    amber: "border-hardwood/40 bg-hardwood/10 text-hardwood",
    red: "border-severity-high/40 bg-severity-high/10 text-severity-high",
    green: "border-severity-low/40 bg-severity-low/10 text-severity-low",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const map: Record<Severity, { tone: "green" | "amber" | "red"; label: string }> = {
    low: { tone: "green", label: "Note" },
    medium: { tone: "amber", label: "Watch" },
    high: { tone: "red", label: "Critical" },
  };
  return <Badge tone={map[severity].tone}>{map[severity].label}</Badge>;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-court-700 px-6 py-16 text-center">
      <p className="font-display text-2xl font-semibold text-court-100">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-court-400">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
