# CourtVision — Basketball Referee Scouting Reports

A web app for basketball referees to prepare for games by building **scouting reports** from
video clips (YouTube or uploaded footage) with a written breakdown of each play, then sharing
those reports with fellow officials.

## Product

- **Reports** are the unit of sharing: one referee prepares a report about an upcoming opponent.
- Each report holds ordered **plays**. A play = a video clip (YouTube link or uploaded file) +
  a title, a written comment, a category (foul / violation / screening / …) and a severity.
- **Comments** on plays let the crew discuss what to watch for.
- **Sharing** is a read-only link (`/r/<token>`); anyone signed in who opens it joins the report
  as a viewer, editors are added by the owner.

## Tech stack (and why)

| Layer     | Choice                                          | Rationale                                                                 |
| --------- | ----------------------------------------------- | ------------------------------------------------------------------------- |
| Frontend  | Next.js 15 (App Router) + React 19 + TypeScript | Server components, server actions, file routing, typed end-to-end         |
| Styling   | Tailwind CSS 4                                  | Utility-first, ships a small CSS bundle, easy theming                     |
| Data/Auth | Supabase (Postgres + Auth + Storage)            | One platform: relational data, email/password auth, RLS, video storage    |
| Video     | YouTube iframe (`youtube-nocookie`) + Supabase Storage | YouTube needs no API key; uploads use a private bucket + signed URLs |
| Icons     | lucide-react                                    | Lightweight, tree-shakeable                                               |
| Testing   | Playwright (webapp-testing skill)               | Real-browser smoke tests against the running app                          |
| Hosting   | Vercel (free tier)                              | Matches the existing `ref-diary` project, server + env var support        |

## Data model (schema `public`, `scout_` prefix to coexist with `ref-diary`)

- `scout_profiles` — display name per user (`id` = `auth.users.id`)
- `scout_reports` — owner, title, opponent, competition, game date, notes, `share_token`
- `scout_report_members` — report membership + role (`viewer` / `editor`)
- `scout_plays` — report, title, description, `video_type` (`youtube`/`upload`), youtube id/url,
  clip `start`/`end` seconds, category, severity, sort order
- `scout_play_comments` — play, author, body

Row Level Security: owners manage their reports; `editor` members can mutate; `viewer` members
and share-link joiners can read and comment. Videos live in a private `scout-videos` bucket under
`<report_id>/…` with signed-URL playback.

## Implementation plan

1. **Scaffold** — create-next-app, git init, GitHub repo.
2. **Foundation** — theme/design tokens, Supabase clients, env example, auth flow.
3. **Database** — SQL migration (tables + RLS + storage bucket policies).
4. **Auth** — login page, callback route, middleware.
5. **Reports** — dashboard list + create/edit/delete server actions.
6. **Plays** — report detail, play create/edit, YouTube parser + upload + signed-URL playback.
7. **Comments & sharing** — comment thread, share-link join flow.
8. **Quality** — `lint`, `build`, Playwright smoke test.
9. **Docs & deploy** — README, Vercel deploy, integration notes.

Each step is committed separately.
