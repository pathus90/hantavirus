-- Run in Supabase SQL Editor if the table already exists (adds section 4 fields).

alter table public.hantavirus_reports
  add column if not exists ethics_approval text,
  add column if not exists ethics_approval_date date,
  add column if not exists enrolled_participants integer;
