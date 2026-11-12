-- CourtVision — initial schema.
-- Run this in Supabase → SQL Editor (or via `supabase db push`).
-- Uses a `scout_` prefix so it can coexist with the `ref-diary` tables.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.scout_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.scout_reports (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  opponent text,
  competition text,
  game_date date,
  notes text,
  share_token text not null unique default gen_random_uuid()::text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scout_report_members (
  report_id uuid not null references public.scout_reports (id) on delete cascade,
  user_id uuid not null references public.scout_profiles (id) on delete cascade,
  role text not null default 'viewer' check (role in ('viewer', 'editor')),
  created_at timestamptz not null default now(),
  primary key (report_id, user_id)
);

create table if not exists public.scout_plays (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.scout_reports (id) on delete cascade,
  title text not null,
  description text,
  video_type text not null default 'youtube' check (video_type in ('youtube', 'upload')),
  youtube_id text,
  video_path text,
  start_seconds integer,
  end_seconds integer,
  category text,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high')),
  sort_order integer not null default 0,
  created_by uuid references public.scout_profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scout_play_comments (
  id uuid primary key default gen_random_uuid(),
  play_id uuid not null references public.scout_plays (id) on delete cascade,
  author_id uuid not null references public.scout_profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists scout_reports_owner_idx on public.scout_reports (owner_id);
create index if not exists scout_plays_report_idx on public.scout_plays (report_id, sort_order);
create index if not exists scout_play_comments_play_idx on public.scout_play_comments (play_id, created_at);
create index if not exists scout_report_members_user_idx on public.scout_report_members (user_id);

-- ---------------------------------------------------------------------------
-- Membership helpers (SECURITY DEFINER so RLS policies don't recurse)
-- ---------------------------------------------------------------------------

create or replace function public.is_report_owner(p_report_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from scout_reports r
    where r.id = p_report_id and r.owner_id = auth.uid()
  );
$$;

create or replace function public.is_report_member(p_report_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from scout_reports r where r.id = p_report_id and r.owner_id = auth.uid()
    union all
    select 1 from scout_report_members m
    where m.report_id = p_report_id and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_report_editor(p_report_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from scout_reports r where r.id = p_report_id and r.owner_id = auth.uid()
    union all
    select 1 from scout_report_members m
    where m.report_id = p_report_id and m.user_id = auth.uid() and m.role = 'editor'
  );
$$;

-- Join a report from a share token. Callable via RPC by any authenticated user;
-- validates the token and self-inserts a 'viewer' membership.
create or replace function public.join_report_by_token(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_report_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select id into v_report_id from scout_reports where share_token = p_token;
  if v_report_id is null then
    raise exception 'Report not found';
  end if;

  insert into scout_report_members (report_id, user_id, role)
  values (v_report_id, auth.uid(), 'viewer')
  on conflict (report_id, user_id) do nothing;

  return v_report_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.scout_profiles enable row level security;
alter table public.scout_reports enable row level security;
alter table public.scout_report_members enable row level security;
alter table public.scout_plays enable row level security;
alter table public.scout_play_comments enable row level security;

-- profiles
create policy "profiles_select" on public.scout_profiles for select
  using (auth.role() = 'authenticated');
create policy "profiles_insert" on public.scout_profiles for insert
  with check (id = auth.uid());
create policy "profiles_update" on public.scout_profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- reports
create policy "reports_select" on public.scout_reports for select
  using (public.is_report_member(id));
create policy "reports_insert" on public.scout_reports for insert
  with check (owner_id = auth.uid());
create policy "reports_update" on public.scout_reports for update
  using (public.is_report_editor(id)) with check (public.is_report_editor(id));
create policy "reports_delete" on public.scout_reports for delete
  using (public.is_report_owner(id));

-- membership
create policy "members_select" on public.scout_report_members for select
  using (public.is_report_member(report_id));
create policy "members_insert" on public.scout_report_members for insert
  with check (public.is_report_owner(report_id));
create policy "members_update" on public.scout_report_members for update
  using (public.is_report_owner(report_id)) with check (public.is_report_owner(report_id));
create policy "members_delete" on public.scout_report_members for delete
  using (public.is_report_owner(report_id));

-- plays
create policy "plays_select" on public.scout_plays for select
  using (public.is_report_member(report_id));
create policy "plays_insert" on public.scout_plays for insert
  with check (public.is_report_editor(report_id));
create policy "plays_update" on public.scout_plays for update
  using (public.is_report_editor(report_id)) with check (public.is_report_editor(report_id));
create policy "plays_delete" on public.scout_plays for delete
  using (public.is_report_editor(report_id));

-- comments
create policy "comments_select" on public.scout_play_comments for select
  using (
    exists (
      select 1 from scout_plays p
      where p.id = play_id and public.is_report_member(p.report_id)
    )
  );
create policy "comments_insert" on public.scout_play_comments for insert
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from scout_plays p
      where p.id = play_id and public.is_report_member(p.report_id)
    )
  );
create policy "comments_update" on public.scout_play_comments for update
  using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "comments_delete" on public.scout_play_comments for delete
  using (
    author_id = auth.uid()
    or exists (
      select 1 from scout_plays p
      where p.id = play_id and public.is_report_owner(p.report_id)
    )
  );

-- ---------------------------------------------------------------------------
-- Auto-create a profile for every new auth user
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.scout_profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for users that already exist (e.g. from another app).
insert into public.scout_profiles (id, display_name)
select id, coalesce(raw_user_meta_data->>'display_name', split_part(email, '@', 1))
from auth.users
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Storage: private video bucket + policies keyed on <report_id>/<file>
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('scout-videos', 'scout-videos', false)
on conflict (id) do nothing;

create policy "videos_select" on storage.objects for select
  using (
    bucket_id = 'scout-videos'
    and auth.role() = 'authenticated'
    and public.is_report_member(((storage.foldername(name))[1])::uuid)
  );
create policy "videos_insert" on storage.objects for insert
  with check (
    bucket_id = 'scout-videos'
    and auth.role() = 'authenticated'
    and public.is_report_editor(((storage.foldername(name))[1])::uuid)
  );
create policy "videos_delete" on storage.objects for delete
  using (
    bucket_id = 'scout-videos'
    and auth.role() = 'authenticated'
    and public.is_report_editor(((storage.foldername(name))[1])::uuid)
  );
