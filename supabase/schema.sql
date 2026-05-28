-- Run this in Supabase → SQL Editor after creating your project.

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

-- Dev: allow anon read/write (tighten for production with RLS + auth)
alter table public.hantavirus_reports enable row level security;

create policy "Allow public read"
  on public.hantavirus_reports
  for select
  to anon, authenticated
  using (true);

create policy "Allow public insert"
  on public.hantavirus_reports
  for insert
  to anon, authenticated
  with check (true);
