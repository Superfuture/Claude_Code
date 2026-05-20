-- Aeon — email subscribers table
-- Run this once in the Supabase SQL editor for the project that the
-- Cloudflare Pages Function (functions/api/subscribe.ts) talks to.

create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text,
  created_at timestamptz not null default now()
);

create index if not exists subscribers_created_at_idx
  on subscribers (created_at desc);

-- Row Level Security: enable, then allow anon role to INSERT only.
alter table subscribers enable row level security;

drop policy if exists "anon can insert subscribers" on subscribers;
create policy "anon can insert subscribers"
  on subscribers
  for insert
  to anon
  with check (true);
