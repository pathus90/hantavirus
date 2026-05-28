-- Run in Supabase SQL Editor if ethics_approval_date column is missing.

alter table public.hantavirus_reports
  add column if not exists ethics_approval_date date;
