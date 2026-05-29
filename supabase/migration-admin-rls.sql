-- Restrict report reads to authenticated admin users.
-- Public collection portal keeps INSERT only (anon).

drop policy if exists "Allow public read" on public.hantavirus_reports;

create policy "Allow authenticated read"
  on public.hantavirus_reports
  for select
  to authenticated
  using (true);

-- Ensure insert policy still exists for the collection form:
-- create policy "Allow public insert" ... (see schema.sql)
