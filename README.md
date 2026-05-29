# NAVIS — Data Collection Portal (Hantavirus)

Web portal for the **Natural History of Andes Virus Infection (NAVIS)** study: national focal points submit epidemiological data, and an admin dashboard lets authorized users view, filter, chart, and export results.

**Repository:** [github.com/pathus90/hantavirus](https://github.com/pathus90/hantavirus)

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| Data | Supabase (PostgreSQL + Auth + API) |
| Admin charts | Recharts |
| Admin export | CSV, Excel (xlsx) |

## Features

### Public portal (`/`)

- Collection form (country, date, epidemiological data, exposures, regulatory fields)
- Country combobox and custom date picker
- **Upsert**: a submission for the **same country** and **same report date** updates that day’s report; otherwise a new report is created
- Link to the admin area

### Admin area (`/admin`)

- Supabase Auth sign-in (email / password)
- Filters: country, ethics approval, date range
- KPIs and charts (cases by country, submissions over time, ethics, enrolled participants)
- Detailed table with expandable exposure fields
- CSV / Excel export (full reports and aggregated datasets)
- Sign out → redirects to the home page

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project

## Local setup

```bash
git clone https://github.com/pathus90/hantavirus.git
cd hantavirus
npm install
cp .env.example .env
```

Fill in `.env` (see below), then:

```bash
npm run dev
```

App URL: [http://localhost:5173](http://localhost:5173)

## Supabase configuration

### 1. Environment variables

Copy [`.env.example`](./.env.example) to `.env` (**local file**, not committed):

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_public_anon_key
```

Get these from **Project Settings → API** (project URL + **anon public** key only).

### 2. Database

In **SQL Editor**, run in order:

1. [`supabase/setup-complete.sql`](./supabase/setup-complete.sql) — table, RLS, admin read, upsert function  
2. If the database already existed without upsert: [`supabase/migration-upsert-report.sql`](./supabase/migration-upsert-report.sql) (once)

Other optional migrations depending on project history: see [`supabase/`](./supabase/).

### 3. Admin accounts

Create users under **Authentication → Users** (*Add user*, enable *Auto Confirm User*).

Admin credentials **must not** be stored in this Git repository.

## Security and secrets

| Safe to commit | **Never** commit |
|----------------|------------------|
| `.env.example` (placeholders) | `.env`, `.env.local`, `.env.production` |
| Source code | Supabase `service_role` key |
| SQL scripts | Admin passwords, private tokens |

- Only the **anon** (public) key is used in the browser.
- RLS allows the public role **INSERT** only; **SELECT** on reports is limited to **authenticated** users (admin).
- Upserts go through the `submit_hantavirus_report` SQL function (`SECURITY DEFINER`), without granting `UPDATE` to `anon`.

Before each push, confirm no secrets appear in the diff:

```bash
git status
git diff
```

## npm scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

## Project structure

```
src/
  components/
    HantavirusPortal.tsx   # Public form
    CountryCombobox.tsx
    DatePicker.tsx
    admin/
      AdminPortal.tsx      # Auth + admin routing
      AdminDashboard.tsx   # Dashboard
      AdminLogin.tsx
      adminUtils.ts
      adminExport.ts
  lib/supabase.ts
  types/report.ts
supabase/                  # SQL scripts
```

## Routes

| Path | Access |
|------|--------|
| `/` | Public — data collection |
| `/admin` | Sign-in required — dashboard |

## Deployment

1. Build: `npm run build` (output in `dist/`)
2. Host static files (Vercel, Netlify, etc.)
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the hosting platform’s environment variables
4. Ensure SQL scripts have been run on the production Supabase project

## Contributing

Please read our [Contributor Code of Conduct](./CODE_OF_CONDUCT.md) before opening issues or pull requests.

When contributing:

- Do not commit secrets (`.env`, passwords, `service_role` keys, or real patient data).
- Match existing code style and keep changes focused.
- Update the README if you change setup, routes, or Supabase scripts.

## License

Private project — internal NAVIS use / authorized collaborators only.
