-- Interview Prep cloud sync schema
-- Run this in the Supabase SQL editor when bootstrapping a new project.

-- ───────────── Tables ─────────────

create table if not exists public.favorites (
  user_id       uuid not null references auth.users(id) on delete cascade,
  category_slug text not null,
  question_id   text not null,
  created_at    timestamptz not null default now(),
  primary key (user_id, category_slug, question_id)
);

create table if not exists public.interviews (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  description     text,
  category_slugs  text[] not null default '{}',
  focus_keys      text[] not null default '{}',
  position        int   not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_interviews_user_position
  on public.interviews (user_id, position, created_at desc);

-- ───────────── Row Level Security ─────────────

alter table public.favorites  enable row level security;
alter table public.interviews enable row level security;

-- A user only sees and modifies their own rows.
drop policy if exists "user owns favorites"  on public.favorites;
drop policy if exists "user owns interviews" on public.interviews;

create policy "user owns favorites" on public.favorites
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user owns interviews" on public.interviews
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ───────────── Auto-update timestamp ─────────────

create or replace function public.set_updated_at()
  returns trigger
  language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tr_interviews_updated_at on public.interviews;
create trigger tr_interviews_updated_at
  before update on public.interviews
  for each row execute function public.set_updated_at();
