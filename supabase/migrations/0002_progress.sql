-- Per-question study progress: a user can mark a question as "ready" (mastered)
-- or "hidden" (not relevant). Statuses are mutually exclusive: setting one clears
-- the other. Default UI hides both; toggle chips reveal them.

create table if not exists public.progress (
  user_id       uuid not null references auth.users(id) on delete cascade,
  category_slug text not null,
  question_id   text not null,
  status        text not null check (status in ('ready', 'hidden')),
  updated_at    timestamptz not null default now(),
  primary key (user_id, category_slug, question_id)
);

create index if not exists idx_progress_user_status
  on public.progress (user_id, status);

alter table public.progress enable row level security;

drop policy if exists "user owns progress" on public.progress;
create policy "user owns progress" on public.progress
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Trigger to refresh updated_at on every row change.
drop trigger if exists tr_progress_updated_at on public.progress;
create trigger tr_progress_updated_at
  before update on public.progress
  for each row execute function public.set_updated_at();
