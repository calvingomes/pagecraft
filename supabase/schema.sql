-- Enable for UUID generation if not already enabled.
create extension if not exists pgcrypto;

-- Profiles linked to Supabase Auth users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Write-once username registry
create table if not exists public.usernames (
  username text primary key,
  uid uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Required for composite FK (username, uid) from pages.
create unique index if not exists usernames_username_uid_idx
  on public.usernames (username, uid);

-- Pages keyed by username (matching route /[username])
create table if not exists public.pages (
  username text primary key,
  uid uuid not null references auth.users(id) on delete cascade,
  title text,
  published boolean not null default true,
  background text,
  sidebar_position text,
  display_name text,
  bio_html text,
  avatar_url text,
  avatar_shape text,
  storage_bytes_used bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure page username belongs to the same uid that reserved it.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'pages_username_uid_fk'
  ) then
    alter table public.pages
      add constraint pages_username_uid_fk
      foreign key (username, uid)
      references public.usernames (username, uid)
      on delete cascade;
  end if;
end $$;

-- Blocks for each page
create table if not exists public.blocks (
  id text primary key,
  page_username text not null references public.pages(username) on delete cascade,
  uid uuid references auth.users(id) on delete set null,
  type text not null,
  "order" integer not null default 0,
  content jsonb not null default '{}'::jsonb,
  layout jsonb,
  styles jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep updated_at fresh on every update.
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();

drop trigger if exists set_pages_updated_at on public.pages;
create trigger set_pages_updated_at
before update on public.pages
for each row
execute function public.handle_updated_at();

drop trigger if exists set_blocks_updated_at on public.blocks;
create trigger set_blocks_updated_at
before update on public.blocks
for each row
execute function public.handle_updated_at();

create index if not exists blocks_page_username_order_idx
  on public.blocks (page_username, "order");

-- RLS
alter table public.profiles enable row level security;
alter table public.usernames enable row level security;
alter table public.pages enable row level security;
alter table public.blocks enable row level security;

-- Public read policies for published content
create policy "Public read pages"
  on public.pages for select
  using (true);

create policy "Public read blocks"
  on public.blocks for select
  using (true);

create policy "Public read usernames"
  on public.usernames for select
  using (true);

create policy "Public read profiles"
  on public.profiles for select
  using (true);

-- Owner write policies
create policy "Owner write profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Owner create username"
  on public.usernames for insert
  with check (auth.uid() = uid);

create policy "No update username"
  on public.usernames for update
  using (false)
  with check (false);

create policy "No delete username"
  on public.usernames for delete
  using (false);

create policy "Owner write page"
  on public.pages for all
  using (auth.uid() = uid)
  with check (auth.uid() = uid);

create policy "Owner write blocks"
  on public.blocks for all
  using (
    exists (
      select 1
      from public.pages p
      where p.username = blocks.page_username
        and p.uid = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.pages p
      where p.username = blocks.page_username
        and p.uid = auth.uid()
    )
  );
