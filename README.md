# CourtVision — Basketball Referee Scouting

A web app for basketball referees to prepare for games by building **scouting reports** from game
film — clip plays (YouTube or an uploaded video), write your read on each one, and share the whole
report with your crew.

## What it does

- **Reports** are the unit of sharing: one official prepares a report for an upcoming opponent.
- **Plays** hold a video clip (a YouTube link or an uploaded file) plus a title, a written
  breakdown, a category and a severity (`Note` / `Watch` / `Critical`).
- **Crew notes** on each play let the crew discuss what to watch for.
- **Sharing** is a read-only link (`/r/<token>`). Anyone signed in who opens it joins the report as
  a viewer; the owner can promote people to editors (editors can add/edit plays).

## Stack

| Layer     | Choice                                          |
| --------- | ----------------------------------------------- |
| Frontend  | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling   | Tailwind CSS 4                                  |
| Data/Auth | Supabase — Postgres, Auth (email/password), RLS |
| Video     | YouTube iframe (`youtube-nocookie`) + Supabase Storage (private bucket, signed URLs) |
| Icons     | lucide-react                                    |
| Hosting   | Vercel (free tier)                              |

## Local setup

1. **Create a free project** at [supabase.com](https://supabase.com) — or reuse an existing one
   (the schema is namespaced `scout_*` so it can coexist with other apps).
2. **Run the migration.** Open **SQL Editor** and paste/run
   [`supabase/migrations/20261112000001_init.sql`](supabase/migrations/20261112000001_init.sql).
   It creates the tables, Row Level Security policies, the `scout-videos` storage bucket, and a
   trigger that creates a profile for every new (and existing) user.
3. **Enable sign-ups** so officials can create accounts:
   **Authentication → Sign In / Up** → enable **"Allow new users to sign up"**.
4. **Copy env vars.** `cp .env.local.example .env.local`, then fill in
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from
   **Project Settings → API**.
5. **Run it.**

   ```bash
   npm install
   npm run dev
   ```

   Open http://localhost:3000, create an account, and build your first report.

## Video: how the two sources work

**YouTube** — paste any YouTube link. The app extracts the video id and embeds it with the
privacy-enhanced `youtube-nocookie.com` player. Optionally set a **clip start/end** (in `mm:ss`) to
focus the crew on the exact moment. No API key required.

**Uploaded video** — files are uploaded straight from the browser to the private `scout-videos`
bucket under `<report_id>/<uuid>.<ext>`. Playback uses a **short-lived signed URL** generated
server-side, so footage is never public. Access is enforced by storage RLS: only report
owners/editors can upload, and only report members can read.

### What you may want to configure for video

- **Bucket size limit** — defaults to 50 MiB per file (`config.toml`, `storage.file_size_limit`).
  For real game film you'll likely want more; raise it in the dashboard under **Storage**.
- **Production-grade video (recommended upgrade)** — Supabase Storage serves the raw file as-is.
  If you need adaptive bitrate / transcoding / thumbnails, swap the upload target for
  [Mux](https://mux.com) or [Cloudinary](https://cloudinary.com): upload there, store the returned
  playback URL in `scout_plays.video_path`, and the `<video>` player keeps working unchanged. This
  is the one integration step I'd flag before you put real footage through it.

## Deploy (Vercel, free)

1. Push this repo to GitHub.
2. In Vercel: **Add New → Project** → import the repo.
3. Add the two env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) and deploy.
4. Add your deployed URL to Supabase **Authentication → URL Configuration** (Site URL + redirect
   allowlist) so sign-in redirects resolve.

## Scripts

```bash
npm run dev     # local dev server (Turbopack)
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## Project layout

| Path                      | What it is                                              |
| ------------------------- | ------------------------------------------------------- |
| `app/(app)/reports/`      | report list, create, edit, detail                       |
| `app/(app)/reports/[id]/plays/[playId]` | play detail + crew notes                   |
| `app/(app)/r/[token]`     | share-link join handler (calls `join_report_by_token`)  |
| `app/actions/`            | server actions: reports, plays, comments                |
| `components/`             | UI: forms, cards, video player, comments, header        |
| `lib/supabase/`           | browser + server clients                                |
| `lib/`                    | types, utils, YouTube parsing, shared styles            |
| `middleware.ts`           | session refresh + auth redirects                        |
| `supabase/migrations/`    | SQL schema, RLS, storage policies                       |

## Database schema

- `scout_profiles` — display name per user (`id` = `auth.users.id`)
- `scout_reports` — owner, title, opponent, competition, game date, notes, `share_token`
- `scout_report_members` — report membership + role (`viewer` / `editor`)
- `scout_plays` — report, title, description, video type/id/path, clip start/end, category, severity
- `scout_play_comments` — play, author, body

Row Level Security: owners manage their reports; `editor` members can mutate plays; `viewer`
members (and share-link joiners) can read and comment. The `join_report_by_token` RPC validates a
share token and self-inserts a viewer membership.
