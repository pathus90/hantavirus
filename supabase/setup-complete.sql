-- ============================================================
-- NAVIS — Run this ENTIRE script in Supabase → SQL Editor → Run
-- Replace with your Supabase project reference if needed.
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

-- 4) One report per country per day (upsert via RPC)
delete from public.hantavirus_reports a
using public.hantavirus_reports b
where a.id < b.id
  and a.country is not null
  and b.country is not null
  and a.report_date is not null
  and b.report_date is not null
  and a.country = b.country
  and a.report_date = b.report_date;

create unique index if not exists hantavirus_reports_country_report_date_uidx
  on public.hantavirus_reports (country, report_date);

create or replace function public.submit_hantavirus_report(
  p_country text,
  p_report_date date,
  p_institution text default null,
  p_focal_point text default null,
  p_contact text default null,
  p_total_cases integer default 0,
  p_confirmed_cases integer default 0,
  p_suspected_cases integer default 0,
  p_deaths integer default 0,
  p_boat_contacts integer default 0,
  p_boat_exposure text default null,
  p_airplane_contacts integer default 0,
  p_airplane_exposure text default null,
  p_ethics_approval text default null,
  p_ethics_approval_date date default null,
  p_enrolled_participants integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_country text := nullif(trim(p_country), '');
  v_id bigint;
  v_updated boolean := false;
begin
  if v_country is null then
    raise exception 'country is required';
  end if;

  if p_report_date is null then
    raise exception 'report_date is required';
  end if;

  select id
  into v_id
  from public.hantavirus_reports
  where country = v_country
    and report_date = p_report_date
  limit 1;

  if v_id is not null then
    update public.hantavirus_reports
    set
      institution = p_institution,
      focal_point = p_focal_point,
      contact = p_contact,
      total_cases = p_total_cases,
      confirmed_cases = p_confirmed_cases,
      suspected_cases = p_suspected_cases,
      deaths = p_deaths,
      boat_contacts = p_boat_contacts,
      boat_exposure = p_boat_exposure,
      airplane_contacts = p_airplane_contacts,
      airplane_exposure = p_airplane_exposure,
      ethics_approval = p_ethics_approval,
      ethics_approval_date = p_ethics_approval_date,
      enrolled_participants = p_enrolled_participants
    where id = v_id;

    v_updated := true;
  else
    insert into public.hantavirus_reports (
      country,
      institution,
      focal_point,
      contact,
      report_date,
      total_cases,
      confirmed_cases,
      suspected_cases,
      deaths,
      boat_contacts,
      boat_exposure,
      airplane_contacts,
      airplane_exposure,
      ethics_approval,
      ethics_approval_date,
      enrolled_participants
    )
    values (
      v_country,
      p_institution,
      p_focal_point,
      p_contact,
      p_report_date,
      p_total_cases,
      p_confirmed_cases,
      p_suspected_cases,
      p_deaths,
      p_boat_contacts,
      p_boat_exposure,
      p_airplane_contacts,
      p_airplane_exposure,
      p_ethics_approval,
      p_ethics_approval_date,
      p_enrolled_participants
    )
    returning id into v_id;
  end if;

  return jsonb_build_object('id', v_id, 'updated', v_updated);
end;
$$;

revoke all on function public.submit_hantavirus_report(
  text, date, text, text, text,
  integer, integer, integer, integer, integer, text, integer, text,
  text, date, integer
) from public;

grant execute on function public.submit_hantavirus_report(
  text, date, text, text, text,
  integer, integer, integer, integer, integer, text, integer, text,
  text, date, integer
) to anon, authenticated;

-- 5) Expose table to API (if needed)
-- Dashboard → Settings → API → Data API enabled
