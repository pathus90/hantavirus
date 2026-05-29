-- Upsert: one report per country per calendar day (report_date).
-- Run in Supabase → SQL Editor after setup-complete.sql

-- Remove duplicate rows (keep the newest id per country + report_date)
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
