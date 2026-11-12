export type VideoType = "youtube" | "upload";
export type MemberRole = "viewer" | "editor";
export type Severity = "low" | "medium" | "high";

/** Effective access a signed-in user has to a report. */
export type ReportAccess = "owner" | "editor" | "viewer";

export interface Profile {
  id: string;
  display_name: string | null;
}

export interface Report {
  id: string;
  owner_id: string;
  title: string;
  opponent: string | null;
  competition: string | null;
  game_date: string | null;
  notes: string | null;
  share_token: string;
  created_at: string;
  updated_at: string;
  // Joined, non-persisted fields:
  role?: ReportAccess;
  play_count?: number;
}

export interface Play {
  id: string;
  report_id: string;
  title: string;
  description: string | null;
  video_type: VideoType;
  youtube_id: string | null;
  video_path: string | null;
  start_seconds: number | null;
  end_seconds: number | null;
  category: string | null;
  severity: Severity;
  sort_order: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined:
  comment_count?: number;
  author?: Profile | null;
}

export interface PlayComment {
  id: string;
  play_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author?: Profile | null;
}

export const PLAY_CATEGORIES = [
  "Block / charge",
  "Shooting foul",
  "Off-ball foul",
  "Travel",
  "Carrying / double dribble",
  "Three seconds",
  "Moving screen",
  "Out of bounds",
  "Goaltending",
  "Unsportsmanlike",
  "Clock / timeout",
  "Other",
] as const;

export const SEVERITY_LABELS: Record<Severity, string> = {
  low: "Note",
  medium: "Watch",
  high: "Critical",
};
