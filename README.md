# Hantavirus Information Collection Portal

React + Vite + Tailwind + Supabase portal for national focal points to submit epidemiological reports.

**Repository:** [github.com/pathus90/hantavirus](https://github.com/pathus90/hantavirus)

## Setup

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Open **Project Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### 2. Database table

In **SQL Editor**, run [`supabase/setup-complete.sql`](./supabase/setup-complete.sql) (table, RLS, admin read, upsert per country/day).

If the project already exists, run [`supabase/migration-upsert-report.sql`](./supabase/migration-upsert-report.sql) once.

### 3. Local app

```bash
cp .env.example .env
# Edit .env with your Supabase URL and anon key

npm install
npm run dev
```

Open http://localhost:5173

## Features

- Form connected to `hantavirus_reports` (all fields wired with React state)
- Upsert on submit: same **country** + **report date** updates the existing row; otherwise a new report is created
- Live table refresh after each submission
- Error messages for API / validation failures

## Scripts

| Command        | Description        |
|----------------|--------------------|
| `npm run dev`  | Development server |
| `npm run build`| Production build   |
| `npm run preview` | Preview build   |
