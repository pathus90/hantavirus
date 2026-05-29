import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { supabase } from '../../lib/supabase'
import type { HantavirusReport } from '../../types/report'
import {
  casesByCountry,
  emptyAdminFilters,
  ethicsBreakdown,
  filterReports,
  fmt,
  fmtDate,
  submissionsTimeline,
  sumField,
  uniqueCountries,
  type AdminFilters,
} from './adminUtils'

const selectClass =
  'rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/15'

const CHART_COLORS = {
  total: '#0f766e',
  confirmed: '#14b8a6',
  suspected: '#f59e0b',
  deaths: '#ef4444',
  enrolled: '#6366f1',
  line: '#0d9488',
}

type Props = {
  onLogout: () => void
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-semibold tabular-nums text-slate-900">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

function ChartCard({
  title,
  children,
  className = '',
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ${className}`}
    >
      <h3 className="mb-4 text-sm font-semibold text-slate-800">{title}</h3>
      {children}
    </div>
  )
}

export default function AdminDashboard({ onLogout }: Props) {
  const [reports, setReports] = useState<HantavirusReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<AdminFilters>(emptyAdminFilters())
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('hantavirus_reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setReports([])
    } else {
      setReports((data as HantavirusReport[]) ?? [])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    void fetchReports()
  }, [fetchReports])

  const countries = useMemo(() => uniqueCountries(reports), [reports])

  const filtered = useMemo(
    () => filterReports(reports, filters),
    [reports, filters],
  )

  const countryCases = useMemo(() => casesByCountry(filtered), [filtered])
  const ethicsData = useMemo(() => ethicsBreakdown(filtered), [filtered])
  const timeline = useMemo(() => submissionsTimeline(filtered), [filtered])

  const hasActiveFilters =
    filters.country ||
    filters.ethics ||
    filters.dateFrom ||
    filters.dateTo

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onLogout()
  }

  const updateFilter = (key: keyof AdminFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-teal-700">
              NAVIS Admin
            </p>
            <h1 className="font-display text-xl font-semibold text-slate-900 sm:text-2xl">
              Collection dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {filtered.length} of {reports.length} report
              {reports.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void fetchReports()}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              Refresh
            </button>
            <Link
              to="/"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Collection portal
            </Link>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6">
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
            {error.includes('row-level security') && (
              <p className="mt-2 text-xs">
                Run{' '}
                <code className="rounded bg-red-100 px-1">
                  supabase/migration-admin-rls.sql
                </code>{' '}
                and sign in with a Supabase Auth user.
              </p>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-800">Filters</h2>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => setFilters(emptyAdminFilters())}
                className="text-sm font-medium text-teal-700 hover:text-teal-900"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="filter-country" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Country
              </label>
              <select
                id="filter-country"
                value={filters.country}
                onChange={(e) => updateFilter('country', e.target.value)}
                className={`${selectClass} w-full`}
              >
                <option value="">All countries</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filter-ethics" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ethics approval
              </label>
              <select
                id="filter-ethics"
                value={filters.ethics}
                onChange={(e) => updateFilter('ethics', e.target.value)}
                className={`${selectClass} w-full`}
              >
                <option value="">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="unset">Not set</option>
              </select>
            </div>
            <div>
              <label htmlFor="filter-from" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                From date
              </label>
              <input
                id="filter-from"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                className={`${selectClass} w-full`}
              />
            </div>
            <div>
              <label htmlFor="filter-to" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                To date
              </label>
              <input
                id="filter-to"
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
                className={`${selectClass} w-full`}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-500">
            No reports submitted yet.
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-500">
            No reports match the current filters.
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              <StatCard label="Reports" value={filtered.length} />
              <StatCard
                label="Countries"
                value={countryCases.length}
              />
              <StatCard
                label="Total cases"
                value={sumField(filtered, 'total_cases')}
              />
              <StatCard
                label="Deaths"
                value={sumField(filtered, 'deaths')}
              />
              <StatCard
                label="Enrolled"
                value={sumField(filtered, 'enrolled_participants')}
                sub="participants"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <ChartCard title="Cases by country" className="xl:col-span-2">
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={countryCases}
                      margin={{ top: 8, right: 8, left: 0, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="country"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        angle={-35}
                        textAnchor="end"
                        interval={0}
                        height={70}
                      />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          fontSize: '13px',
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="total"
                        name="Total"
                        fill={CHART_COLORS.total}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="confirmed"
                        name="Confirmed"
                        fill={CHART_COLORS.confirmed}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="suspected"
                        name="Contacts"
                        fill={CHART_COLORS.suspected}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="deaths"
                        name="Deaths"
                        fill={CHART_COLORS.deaths}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Submissions over time">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timeline}
                      margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: '#64748b' }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          fontSize: '13px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="reports"
                        name="Reports"
                        stroke={CHART_COLORS.line}
                        strokeWidth={2}
                        dot={{ fill: CHART_COLORS.line, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Ethics approval status">
                <div className="h-64 w-full">
                  {ethicsData.length === 0 ? (
                    <p className="flex h-full items-center justify-center text-sm text-slate-400">
                      No ethics data
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ethicsData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {ethicsData.map((entry) => (
                            <Cell key={entry.name} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </ChartCard>

              <ChartCard title="Enrolled participants by country" className="xl:col-span-2">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={countryCases.filter((c) => c.enrolled > 0)}
                      layout="vertical"
                      margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis
                        type="category"
                        dataKey="country"
                        width={100}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          fontSize: '13px',
                        }}
                      />
                      <Bar
                        dataKey="enrolled"
                        name="Enrolled"
                        fill={CHART_COLORS.enrolled}
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-slate-800">
                  Report details
                </h2>
                <p className="text-xs text-slate-500">
                  Click a row to expand exposure details
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                      <th className="px-4 py-3">Country</th>
                      <th className="px-4 py-3">Report date</th>
                      <th className="px-4 py-3 text-right">Total</th>
                      <th className="px-4 py-3 text-right">Confirmed</th>
                      <th className="px-4 py-3 text-right">Contacts</th>
                      <th className="px-4 py-3 text-right">Deaths</th>
                      <th className="px-4 py-3 text-right">Boat</th>
                      <th className="px-4 py-3 text-right">Air</th>
                      <th className="px-4 py-3">Ethics</th>
                      <th className="px-4 py-3">Ethics date</th>
                      <th className="px-4 py-3 text-right">Enrolled</th>
                      <th className="px-4 py-3">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((r) => (
                      <Fragment key={r.id}>
                        <tr
                          onClick={() =>
                            setExpandedId(expandedId === r.id ? null : r.id)
                          }
                          className={`cursor-pointer transition hover:bg-teal-50/40 ${
                            expandedId === r.id ? 'bg-teal-50/30' : ''
                          }`}
                        >
                          <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                            {fmt(r.country)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                            {fmtDate(r.report_date)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums font-medium">
                            {fmt(r.total_cases)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-teal-800">
                            {fmt(r.confirmed_cases)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                            {fmt(r.suspected_cases)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                            {fmt(r.deaths)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                            {fmt(r.boat_contacts)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                            {fmt(r.airplane_contacts)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 capitalize">
                            {fmt(r.ethics_approval)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                            {fmtDate(r.ethics_approval_date)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                            {fmt(r.enrolled_participants)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                            {fmtDate(r.created_at)}
                          </td>
                        </tr>
                        {expandedId === r.id && (
                          <tr key={`${r.id}-detail`} className="bg-slate-50/80">
                            <td colSpan={12} className="px-4 py-4">
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-cyan-100 bg-white p-4">
                                  <p className="text-xs font-semibold uppercase text-cyan-800">
                                    Maritime exposure
                                  </p>
                                  <p className="mt-2 text-sm text-slate-700">
                                    {fmt(r.boat_exposure)}
                                  </p>
                                </div>
                                <div className="rounded-xl border border-sky-100 bg-white p-4">
                                  <p className="text-xs font-semibold uppercase text-sky-800">
                                    Air travel exposure
                                  </p>
                                  <p className="mt-2 text-sm text-slate-700">
                                    {fmt(r.airplane_exposure)}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
