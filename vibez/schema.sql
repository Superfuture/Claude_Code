-- Vibez · Supabase schema
-- Run in: Supabase dashboard → SQL Editor → New query → paste → Run
-- Safe to re-run; uses if-not-exists / drop-policy-if-exists guards.

-- ─────────────────────────────────────────────
-- 1) Tables
-- ─────────────────────────────────────────────

create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  handle      text unique not null,
  email       text unique not null,
  name        text,
  avatar      text,
  bio         text,
  invited_by  uuid references profiles(id),
  created_at  timestamptz default now()
);

create table if not exists invites (
  code        text primary key,
  owner_id    uuid references profiles(id) on delete cascade,  -- null for seed codes
  claimed_by  uuid references profiles(id),
  claimed_at  timestamptz,
  created_at  timestamptz default now()
);

create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  tagline     text not null,
  url         text not null,
  image_url   text,
  tool        text,
  category    text,
  build_time  text,
  invite_code text references invites(code),
  maker_id    uuid references profiles(id) on delete set null,
  drop_date   date not null default ((now() at time zone 'America/Los_Angeles')::date),
  created_at  timestamptz default now()
);
create index if not exists projects_drop_date_idx on projects(drop_date desc);
create index if not exists projects_maker_idx     on projects(maker_id);

create table if not exists reactions (
  project_id  uuid references projects(id) on delete cascade,
  user_id     uuid references profiles(id) on delete cascade,
  weight      smallint not null check (weight between 1 and 5),
  created_at  timestamptz default now(),
  primary key (project_id, user_id, weight)
);

create table if not exists waitlist (
  email       text primary key,
  name        text,
  tool        text,
  source      text,
  created_at  timestamptz default now()
);

-- ─────────────────────────────────────────────
-- 2) Score view (sum of reaction weights per project)
-- ─────────────────────────────────────────────

create or replace view project_scores as
select
  p.id,
  p.slug,
  p.drop_date,
  coalesce(sum(r.weight), 0)::int as score,
  count(r.*)::int                 as reaction_count
from projects p
left join reactions r on r.project_id = p.id
group by p.id;

-- ─────────────────────────────────────────────
-- 3) Row Level Security
-- ─────────────────────────────────────────────

alter table profiles  enable row level security;
alter table invites   enable row level security;
alter table projects  enable row level security;
alter table reactions enable row level security;
alter table waitlist  enable row level security;

-- profiles: world-readable; only self can write
drop policy if exists "profiles_read_all"    on profiles;
create policy "profiles_read_all"    on profiles for select using (true);
drop policy if exists "profiles_insert_self" on profiles;
create policy "profiles_insert_self" on profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_self" on profiles;
create policy "profiles_update_self" on profiles for update using      (auth.uid() = id);

-- invites: never readable to anon; signed-in user sees their own (owned or claimed).
-- Writes only via SECURITY DEFINER RPCs below.
drop policy if exists "invites_read_own" on invites;
create policy "invites_read_own" on invites for select
  using (owner_id = auth.uid() or claimed_by = auth.uid());

-- projects: world-readable; maker can update/delete. Inserts go through submit_project RPC.
drop policy if exists "projects_read_all"      on projects;
create policy "projects_read_all"      on projects for select using (true);
drop policy if exists "projects_update_maker"  on projects;
create policy "projects_update_maker"  on projects for update using      (maker_id = auth.uid());
drop policy if exists "projects_delete_maker"  on projects;
create policy "projects_delete_maker"  on projects for delete using      (maker_id = auth.uid());

-- reactions: world-readable; user can react/unreact as themselves
drop policy if exists "reactions_read_all"     on reactions;
create policy "reactions_read_all"     on reactions for select using (true);
drop policy if exists "reactions_insert_self"  on reactions;
create policy "reactions_insert_self"  on reactions for insert with check (user_id = auth.uid());
drop policy if exists "reactions_delete_self"  on reactions;
create policy "reactions_delete_self"  on reactions for delete using      (user_id = auth.uid());

-- waitlist: anyone can insert; nobody can read (admin reads via service role)
drop policy if exists "waitlist_insert_anon" on waitlist;
create policy "waitlist_insert_anon" on waitlist for insert with check (true);

-- ─────────────────────────────────────────────
-- 4) RPCs (security-definer for safe writes from anon/auth)
-- ─────────────────────────────────────────────

-- Check an invite code is real and unused. Returns bool.
create or replace function verify_invite(p_code text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from invites
    where code = upper(p_code) and claimed_by is null
  );
$$;
grant execute on function verify_invite(text) to anon, authenticated;

-- Atomically claim an invite for the signed-in user.
create or replace function claim_invite(p_code text)
returns table (ok boolean, reason text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_rows int;
begin
  if v_uid is null then
    return query select false, 'auth_required'::text; return;
  end if;
  update invites
    set claimed_by = v_uid, claimed_at = now()
    where code = upper(p_code) and claimed_by is null;
  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    return query select false, 'invalid_or_used'::text; return;
  end if;
  return query select true, ''::text;
end;
$$;
grant execute on function claim_invite(text) to authenticated;

-- Mint N invite codes owned by the current user. Returns the codes.
create or replace function mint_invites(p_count int default 5)
returns setof text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_code text;
  i      int;
begin
  if v_uid is null then raise exception 'auth_required'; end if;
  for i in 1..p_count loop
    -- 5-char A-Z0-9 code from md5(random)
    v_code := upper(substr(translate(md5(random()::text || v_uid::text || i::text),
                                     'abcdef', 'ABCDEF'), 1, 5));
    insert into invites(code, owner_id) values (v_code, v_uid) on conflict do nothing;
    return next v_code;
  end loop;
end;
$$;
grant execute on function mint_invites(int) to authenticated;

-- Submit a project. Validates the invite, generates a unique slug, inserts.
-- Anonymous submission allowed (maker_id is null) so this works before auth is wired.
create or replace function submit_project(
  p_name        text,
  p_url         text,
  p_tagline     text,
  p_tool        text,
  p_category    text,
  p_build_time  text,
  p_image_url   text,
  p_invite_code text
) returns table (ok boolean, slug text, reason text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slug text;
  v_invite_ok boolean;
begin
  if p_invite_code is null or length(trim(p_invite_code)) = 0 then
    return query select false, ''::text, 'invite_required'::text; return;
  end if;
  select exists (select 1 from invites where code = upper(p_invite_code))
    into v_invite_ok;
  if not v_invite_ok then
    return query select false, ''::text, 'invalid_invite'::text; return;
  end if;

  -- slugify name
  v_slug := lower(regexp_replace(p_name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug);
  if v_slug = '' then v_slug := substr(md5(random()::text), 1, 8); end if;
  while exists (select 1 from projects where slug = v_slug) loop
    v_slug := v_slug || '-' || substr(md5(random()::text), 1, 4);
  end loop;

  insert into projects (slug, name, tagline, url, image_url, tool, category, build_time, invite_code, maker_id)
  values (v_slug, p_name, p_tagline, p_url, nullif(p_image_url,''), p_tool, p_category, p_build_time, upper(p_invite_code), auth.uid());

  return query select true, v_slug, ''::text;
end;
$$;
grant execute on function submit_project(text,text,text,text,text,text,text,text) to anon, authenticated;

-- ─────────────────────────────────────────────
-- 5) Seed: the original CONFIG.validInviteCodes
-- ─────────────────────────────────────────────

insert into invites (code) values
  ('VIBEZ'), ('EARLY'), ('BAGEL'), ('JP'), ('CLAUDE')
on conflict do nothing;
