-- ============================================================
-- NAVIS — Run this ENTIRE script in Supabase → SQL Editor → Run
-- Project: lldfvbicomlivgxnqiux (or your project)
-- ============================================================

-- 1) Table (safe if already exists)
create table if not exists public.hantavirus_reports (
  id bigint generated always as identity primary key,
  country text,
  institution text,
  focal_point text,
  contact text,
  report_date date,
  total_cases integer,
  confirmed_cases integer,
  suspected_cases integer,
  deaths integer,
  boat_contacts integer,
  boat_exposure text,
  airplane_contacts integer,
  airplane_exposure text,
  ethics_approval text,
  ethics_approval_date date,
  enrolled_participants integer,
  created_at timestamp with time zone default timezone('utc', now())
);

-- 2) New columns (if table was created earlier)
alter table public.hantavirus_reports
  add column if not exists ethics_approval text,
  add column if not exists ethics_approval_date date,
  add column if not exists enrolled_participants integer;

-- 3) Row Level Security
alter table public.hantavirus_reports enable row level security;

drop policy if exists "Allow public read" on public.hantavirus_reports;
drop policy if exists "Allow public insert" on public.hantavirus_reports;
drop policy if exists "Allow authenticated read" on public.hantavirus_reports;

-- Public form: INSERT only (collection portal)
create policy "Allow public insert"
  on public.hantavirus_reports
  for insert
  to anon, authenticated
  with check (true);

-- Admin portal: SELECT when logged in
create policy "Allow authenticated read"
  on public.hantavirus_reports
  for select
  to authenticated
  using (true);

-- 4) Expose table to API (if needed)
-- Dashboard → Settings → API → Data API enabled
