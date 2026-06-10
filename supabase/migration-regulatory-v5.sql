-- Total cases = confirmed (PCR+) + contacts (PCR−) only.
-- Run after migration-regulatory-v4.sql

update public.hantavirus_reports
set total_cases = coalesce(confirmed_cases, 0) + coalesce(suspected_cases, 0);

do $$
declare
  r record;
begin
  for r in
    select pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'submit_hantavirus_report'
  loop
    execute format(
      'drop function if exists public.submit_hantavirus_report(%s)',
      r.args
    );
  end loop;
end $$;

create or replace function public.submit_hantavirus_report(
  p_country text,
  p_report_date date,
  p_study_protocol text default 'navis',
  p_institution text default null,
  p_focal_point text default null,
  p_contact text default null,
  p_total_cases integer default 0,
  p_confirmed_cases integer default 0,
  p_suspected_cases integer default 0,
  p_deaths_cases integer default 0,
  p_deaths_contacts integer default 0,
  p_contacts_became_cases integer default 0,
  p_boat_contacts integer default 0,
  p_boat_exposure text default null,
  p_airplane_contacts integer default 0,
  p_airplane_exposure text default null,
  p_hcw_contacts integer default 0,
  p_hcw_exposure text default null,
  p_ethics_approval text default null,
  p_ethics_approval_date date default null,
  p_enrolled_pcr_positive integer default 0,
  p_enrolled_pcr_negative integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_country text := nullif(trim(p_country), '');
  v_protocol text := nullif(trim(p_study_protocol), '');
  v_total integer;
  v_deaths integer;
  v_enrolled integer;
  v_id bigint;
  v_updated boolean := false;
begin
  if v_country is null then
    raise exception 'country is required';
  end if;

  if p_report_date is null then
    raise exception 'report_date is required';
  end if;

  if v_protocol is null then
    v_protocol := 'navis';
  end if;

  v_total :=
    coalesce(p_confirmed_cases, 0) + coalesce(p_suspected_cases, 0);
  v_deaths := coalesce(p_deaths_cases, 0) + coalesce(p_deaths_contacts, 0);
  v_enrolled :=
    coalesce(p_enrolled_pcr_positive, 0) + coalesce(p_enrolled_pcr_negative, 0);

  select id
  into v_id
  from public.hantavirus_reports
  where country = v_country
    and report_date = p_report_date
  limit 1;

  if v_id is not null then
    update public.hantavirus_reports
    set
      study_protocol = v_protocol,
      institution = p_institution,
      focal_point = p_focal_point,
      contact = p_contact,
      total_cases = v_total,
      confirmed_cases = p_confirmed_cases,
      suspected_cases = p_suspected_cases,
      deaths = v_deaths,
      deaths_cases = p_deaths_cases,
      deaths_contacts = p_deaths_contacts,
      contacts_became_cases = p_contacts_became_cases,
      boat_contacts = p_boat_contacts,
      boat_exposure = p_boat_exposure,
      airplane_contacts = p_airplane_contacts,
      airplane_exposure = p_airplane_exposure,
      hcw_contacts = p_hcw_contacts,
      hcw_exposure = p_hcw_exposure,
      ethics_approval = p_ethics_approval,
      ethics_approval_date = p_ethics_approval_date,
      enrolled_pcr_positive = p_enrolled_pcr_positive,
      enrolled_pcr_negative = p_enrolled_pcr_negative,
      enrolled_participants = v_enrolled
    where id = v_id;

    v_updated := true;
  else
    insert into public.hantavirus_reports (
      country,
      study_protocol,
      institution,
      focal_point,
      contact,
      report_date,
      total_cases,
      confirmed_cases,
      suspected_cases,
      deaths,
      deaths_cases,
      deaths_contacts,
      contacts_became_cases,
      boat_contacts,
      boat_exposure,
      airplane_contacts,
      airplane_exposure,
      hcw_contacts,
      hcw_exposure,
      ethics_approval,
      ethics_approval_date,
      enrolled_pcr_positive,
      enrolled_pcr_negative,
      enrolled_participants
    )
    values (
      v_country,
      v_protocol,
      p_institution,
      p_focal_point,
      p_contact,
      p_report_date,
      v_total,
      p_confirmed_cases,
      p_suspected_cases,
      v_deaths,
      p_deaths_cases,
      p_deaths_contacts,
      p_contacts_became_cases,
      p_boat_contacts,
      p_boat_exposure,
      p_airplane_contacts,
      p_airplane_exposure,
      p_hcw_contacts,
      p_hcw_exposure,
      p_ethics_approval,
      p_ethics_approval_date,
      p_enrolled_pcr_positive,
      p_enrolled_pcr_negative,
      v_enrolled
    )
    returning id into v_id;
  end if;

  return jsonb_build_object('id', v_id, 'updated', v_updated);
end;
$$;

revoke all on function public.submit_hantavirus_report(
  text, date, text, text, text, text,
  integer, integer, integer, integer, integer, integer, integer,
  text, integer, text, integer, text, text, date, integer, integer
) from public;

grant execute on function public.submit_hantavirus_report(
  text, date, text, text, text, text,
  integer, integer, integer, integer, integer, integer, integer,
  text, integer, text, integer, text, text, date, integer, integer
) to anon, authenticated;
