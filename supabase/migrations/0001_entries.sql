-- Viz it sync table. Run in the Supabase SQL editor, or with `supabase db push`.
-- Each user can only ever see and change their own rows (row-level security below).

create table if not exists public.entries (
  id               uuid primary key,
  user_id          uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at       timestamptz not null default now(),
  -- Set by the device that made the change; the newer side wins when merging.
  updated_at       timestamptz not null default now(),
  -- Tombstone: other devices delete their copy when they see this.
  deleted_at       timestamptz,
  -- Set by the server on every write; devices pull rows changed since their last pull.
  synced_at        timestamptz not null default now(),
  -- Null unless the user turned on "Sync my written text".
  text             text,
  emotions         jsonb not null default '[]'::jsonb,
  valence          real not null default 0,
  confidence       real not null default 0,
  user_rating      smallint check (user_rating between 1 and 10),
  user_adjusted    boolean not null default false,
  tags             text[] not null default '{}',
  analyzer_version text not null default ''
);

create index if not exists entries_user_synced_idx on public.entries (user_id, synced_at);

alter table public.entries enable row level security;

create policy "Users read their own entries" on public.entries
  for select using (auth.uid() = user_id);
create policy "Users add their own entries" on public.entries
  for insert with check (auth.uid() = user_id);
create policy "Users change their own entries" on public.entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete their own entries" on public.entries
  for delete using (auth.uid() = user_id);

create or replace function public.entries_touch_synced_at()
returns trigger
language plpgsql
as $$
begin
  new.synced_at := now();
  return new;
end;
$$;

drop trigger if exists entries_touch_synced_at on public.entries;
create trigger entries_touch_synced_at
  before insert or update on public.entries
  for each row execute function public.entries_touch_synced_at();
