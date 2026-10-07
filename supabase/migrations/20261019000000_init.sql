-- Spec 7.1 and 7.2: tables, the new-user profile trigger, the cards stale-write
-- guard, and Row Level Security. Applied locally, then to staging, then to
-- production with the Supabase CLI, before merging code that needs it.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  level smallint not null default 1 check (level in (1, 2)),
  created_at timestamptz not null default now()
);

-- every new auth user gets a profile row
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.games (
  id uuid primary key,                                   -- generated on the client
  user_id uuid not null references auth.users (id) on delete cascade,
  seed bigint not null,
  level smallint not null check (level in (1, 2)),
  content_version int not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  result text check (result in ('won', 'lost', 'abandoned'))
);

create table public.review_log (
  id uuid primary key,                                   -- generated on the client, makes sync idempotent
  user_id uuid not null references auth.users (id) on delete cascade,
  game_id uuid references public.games (id) on delete set null,
  lexicon_id text not null,
  direction text not null check (direction in ('recognize', 'produce')),
  rating text not null check (rating in ('again', 'hard', 'good', 'slip')),
  detail jsonb,
  local_day date not null,
  created_at timestamptz not null
);

create index review_log_user_created on public.review_log (user_id, created_at);

create table public.cards (
  user_id uuid not null references auth.users (id) on delete cascade,
  lexicon_id text not null,
  direction text not null check (direction in ('recognize', 'produce')),
  state jsonb not null,                                  -- FSRS card state
  due timestamptz not null,
  log_count int not null,                                -- review_log rows the state was built from
  updated_at timestamptz not null default now(),
  primary key (user_id, lexicon_id, direction)
);

-- a device with an older copy of the log can never overwrite newer card state
create function public.cards_keep_newest() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.log_count < old.log_count then
    return null;  -- skip this stale update
  end if;
  return new;
end;
$$;

create trigger cards_keep_newest
  before update on public.cards
  for each row execute function public.cards_keep_newest();

-- 7.2 Row Level Security

alter table public.profiles   enable row level security;
alter table public.games      enable row level security;
alter table public.review_log enable row level security;
alter table public.cards      enable row level security;

-- profiles: read, create, and update your own row
create policy profiles_select on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy profiles_insert on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);
create policy profiles_update on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- games: read, create, and update (to set ended_at/result) your own games
create policy games_select on public.games for select to authenticated
  using ((select auth.uid()) = user_id);
create policy games_insert on public.games for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy games_update on public.games for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- review_log: append-only. No update or delete policy exists, so both are denied.
create policy review_log_select on public.review_log for select to authenticated
  using ((select auth.uid()) = user_id);
create policy review_log_insert on public.review_log for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and (game_id is null or exists (
      select 1 from public.games g
      where g.id = game_id and g.user_id = (select auth.uid())
    ))
  );

-- cards: derived cache, fully owned by the user.
create policy cards_select on public.cards for select to authenticated
  using ((select auth.uid()) = user_id);
create policy cards_insert on public.cards for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy cards_update on public.cards for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
