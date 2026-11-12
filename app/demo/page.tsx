import Link from "next/link";
import Image from "next/image";
import { Film, MessageSquare, Share2, Plus } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Badge, SeverityBadge } from "@/components/ui";
import { PlayVideo } from "@/components/plays/PlayVideo";
import { formatDate, formatSeconds } from "@/lib/utils";
import type { Play, PlayComment } from "@/lib/types";

export const metadata = { title: "Demo" };

const YT = "M7lc1UVf-VE"; // stable placeholder clip — swap for your own film

const reports = [
  { title: "Kaunas — pick & roll coverage", opponent: "Žalgiris Kaunas", competition: "LKL", game_date: "2026-11-20", play_count: 6, shared: false },
  { title: "Rytas — transition & illegal screens", opponent: "Rytas Vilnius", competition: "LKL", game_date: "2026-11-28", play_count: 4, shared: true },
  { title: "EuroCup — block/charge points", opponent: "Umana Reyer Venezia", competition: "EuroCup", game_date: "2026-12-02", play_count: 9, shared: false },
];

const plays: Play[] = [
  {
    id: "p1",
    report_id: "r1",
    title: "Late travel on the baseline drive",
    description:
      "Ball-handler gathers late and takes three steps into the layup. Watch the pivot foot on the left block — this is the one the crew kept missing in the first half.",
    video_type: "youtube",
    youtube_id: YT,
    video_path: null,
    start_seconds: 12,
    end_seconds: 21,
    category: "Travel",
    severity: "high",
    sort_order: 0,
    created_by: "u1",
    created_at: "2026-11-12T10:00:00Z",
    updated_at: "2026-11-12T10:00:00Z",
    comment_count: 3,
  },
  {
    id: "p2",
    report_id: "r1",
    title: "Moving screen by the 5 on the high P&R",
    description:
      "The screener leans his hip into the defender and never sets. Foul is on the screener — don't reward the ball-handler for the contact.",
    video_type: "youtube",
    youtube_id: YT,
    video_path: null,
    start_seconds: 44,
    end_seconds: 52,
    category: "Moving screen",
    severity: "medium",
    sort_order: 1,
    created_by: "u1",
    created_at: "2026-11-12T10:05:00Z",
    updated_at: "2026-11-12T10:05:00Z",
    comment_count: 1,
  },
  {
    id: "p3",
    report_id: "r1",
    title: "Off-ball hold in the lane",
    description:
      "Subtle two-hand hold on the cutter as he curls off the screen. Easy to miss from lead — trail has the best angle.",
    video_type: "upload",
    youtube_id: null,
    video_path: "r1/clip-hold.mp4",
    start_seconds: null,
    end_seconds: null,
    category: "Off-ball foul",
    severity: "low",
    sort_order: 2,
    created_by: "u1",
    created_at: "2026-11-12T10:12:00Z",
    updated_at: "2026-11-12T10:12:00Z",
    comment_count: 0,
  },
];

const comments: PlayComment[] = [
  {
    id: "c1",
    play_id: "p1",
    author_id: "u1",
    body: "This is exactly the one we flagged in the pre-game. Call it the same way all game.",
    created_at: "2026-11-12T11:00:00Z",
    author: { id: "u1", display_name: "Deividas Mačiulskis" },
  },
  {
    id: "c2",
    play_id: "p1",
    author_id: "u2",
    body: "From trail, the gather is much easier to read than from lead.",
    created_at: "2026-11-12T11:14:00Z",
    author: { id: "u2", display_name: "Tomas K." },
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-medium uppercase tracking-widest text-court-400">
      {children}
    </p>
  );
}

export default function DemoPage() {
  return (
    <div className="min-h-screen">
      {/* Demo header */}
      <header className="sticky top-0 z-30 border-b border-court-800 bg-court-950/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <Badge tone="amber">Demo · sample data</Badge>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-16 px-4 py-10 sm:px-6">
        {/* Intro */}
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl font-bold tracking-tight text-court-100">
            How CourtVision works
          </h1>
          <p className="mt-2 text-court-400">
            Three screens: your reports, a report&apos;s plays, and a single play with
            the crew discussion. Everything below is sample data — in the real app it
            comes from your Supabase project.
          </p>
        </div>

        {/* ─── 1. Reports list ─── */}
        <section>
          <SectionLabel>1 · Your scouting reports</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <div
                key={report.title}
                className="group rounded-2xl border border-court-700 bg-court-900/60 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-xl font-semibold text-court-100">
                    {report.title}
                  </h3>
                  {report.shared && <Badge>Shared</Badge>}
                </div>
                <p className="mt-1 text-sm text-court-400">
                  {report.opponent} · {report.competition}
                </p>
                <div className="mt-5 flex items-center gap-4 text-xs text-court-400">
                  <span className="tabular">
                    {report.play_count} plays
                  </span>
                  <span aria-hidden>·</span>
                  <span>{formatDate(report.game_date)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 2. Report detail ─── */}
        <section>
          <SectionLabel>2 · Inside a report</SectionLabel>
          <div className="rounded-2xl border border-court-700 bg-court-900/40 p-5 sm:p-6">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl font-bold text-court-100">
                  Kaunas — pick &amp; roll coverage
                </h2>
                <p className="mt-1 text-sm text-court-400">
                  Žalgiris Kaunas · LKL · {formatDate("2026-11-20")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-court-700 px-3 py-2 text-sm text-court-300"
                >
                  <Share2 className="h-4 w-4" /> Copy share link
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-hardwood px-3 py-2 text-sm font-semibold text-court-950"
                >
                  <Plus className="h-4 w-4" /> Add play
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {plays.map((play) => (
                <div
                  key={play.id}
                  className="flex gap-4 rounded-2xl border border-court-700 bg-court-900/60 p-4"
                >
                  <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg bg-court-800">
                    {play.video_type === "youtube" && play.youtube_id ? (
                      <Image
                        src={`https://i.ytimg.com/vi/${play.youtube_id}/hqdefault.jpg`}
                        alt=""
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-court-500">
                        <Film className="h-6 w-6" />
                      </div>
                    )}
                    {play.start_seconds != null && (
                      <span className="tabular absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[10px] text-court-100">
                        {formatSeconds(play.start_seconds)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-lg font-semibold text-court-100">
                        {play.title}
                      </h3>
                      <SeverityBadge severity={play.severity} />
                    </div>
                    {play.category && (
                      <p className="mt-0.5 text-xs text-court-400">{play.category}</p>
                    )}
                    {play.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-court-400">
                        {play.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-3 text-xs text-court-500">
                      {play.video_type === "upload" && <span>Uploaded clip</span>}
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {play.comment_count ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 3. Play detail ─── */}
        <section>
          <SectionLabel>3 · A single play, with crew notes</SectionLabel>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0">
              <PlayVideo play={plays[0]} />
              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-display text-2xl font-bold text-court-100">
                      {plays[0].title}
                    </h2>
                    <SeverityBadge severity={plays[0].severity} />
                  </div>
                  {plays[0].category && (
                    <p className="mt-1 text-sm text-court-400">{plays[0].category}</p>
                  )}
                </div>
              </div>
              {plays[0].description && (
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-court-300">
                  {plays[0].description}
                </p>
              )}
              <p className="mt-4 text-xs text-court-500">
                Clip: {formatSeconds(plays[0].start_seconds)} –{" "}
                {formatSeconds(plays[0].end_seconds)} · Placeholder footage — paste any
                YouTube link to use your own film.
              </p>
            </div>

            <aside>
              <h3 className="font-display text-xl font-semibold text-court-100">
                Crew notes
              </h3>
              <ul className="mt-5 space-y-4">
                {comments.map((comment) => (
                  <li key={comment.id} className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-court-800 text-xs font-semibold text-court-300">
                      {comment.author?.display_name?.slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-sm font-medium text-court-100">
                          {comment.author?.display_name}
                        </span>
                        <span className="shrink-0 text-xs text-court-500">
                          {new Date(comment.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-court-300">{comment.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex gap-3">
                <input
                  placeholder="Add a note for the crew…"
                  className="w-full rounded-lg border border-court-700 bg-court-950/70 px-3 py-2.5 text-sm text-court-100 placeholder:text-court-600"
                />
                <button
                  type="button"
                  className="rounded-lg bg-hardwood px-4 py-2.5 text-sm font-semibold text-court-950"
                >
                  Post
                </button>
              </div>
            </aside>
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-2xl border border-court-700 bg-court-900/40 p-6 text-center">
          <p className="text-court-300">
            This is a preview. The real app is identical, backed by your Supabase
            project.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-hardwood px-4 py-2.5 text-sm font-semibold text-court-950 hover:bg-hardwood-strong"
          >
            Sign in to build your own
          </Link>
        </div>
      </main>
    </div>
  );
}
