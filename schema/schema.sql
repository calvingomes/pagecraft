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
  og_image_url text,
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
  viewport_mode text not null default 'desktop',
  constraint blocks_viewport_mode_check
    check (viewport_mode in ('desktop', 'mobile')),
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

create index if not exists blocks_page_username_viewport_order_idx
  on public.blocks (page_username, viewport_mode, "order");

create index if not exists blocks_page_username_viewport_idx
  on public.blocks (page_username, viewport_mode);

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

-- Storage bucket for uploaded page media (avatars, block images)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pagecraft-bucket',
  'pagecraft-bucket',
  true,
  26214400,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Consolidated Storage Policy: Users manage their own folders
drop policy if exists "Pagecraft media public read" on storage.objects;
drop policy if exists "Pagecraft media owner insert" on storage.objects;
drop policy if exists "Pagecraft media owner update" on storage.objects;
drop policy if exists "Pagecraft media owner delete" on storage.objects;
drop policy if exists "Users can manage their own files" on storage.objects;

create policy "Users can manage their own files"
on storage.objects
for all -- covers SELECT, INSERT, UPDATE, DELETE
to authenticated
using ( 
  bucket_id = 'pagecraft-bucket' 
  AND (storage.foldername(name))[1] = 'users'
  AND (storage.foldername(name))[2] = auth.uid()::text 
)
with check ( 
  bucket_id = 'pagecraft-bucket' 
  AND (storage.foldername(name))[1] = 'users'
  AND (storage.foldername(name))[2] = auth.uid()::text 
);

-- Public read access for the bucket
create policy "Public read access"
on storage.objects for select
using ( bucket_id = 'pagecraft-bucket' );
