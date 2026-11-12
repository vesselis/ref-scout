/** Join class names, dropping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Format an ISO date string (or null) as a readable date. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Format a whole number of seconds as mm:ss. */
export function formatSeconds(value: number | null | undefined): string | null {
  if (value == null || value < 0) return null;
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** Parse a "1m30s" / "90" / "1:30" style string into whole seconds, or null. */
export function parseSeconds(input: string): number | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;

  const clock = trimmed.match(/^(?:(\d+):)?(\d{1,2})$/);
  if (clock) {
    const minutes = clock[1] ? parseInt(clock[1], 10) : 0;
    const seconds = parseInt(clock[2], 10);
    return minutes * 60 + seconds;
  }

  const parts = trimmed.match(/(?:(\d+)m)?(?:(\d+)s)?/);
  if (parts && (parts[1] || parts[2])) {
    return (parseInt(parts[1] || "0", 10) * 60) + parseInt(parts[2] || "0", 10);
  }

  const plain = Number(trimmed);
  return Number.isFinite(plain) ? plain : null;
}

export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
