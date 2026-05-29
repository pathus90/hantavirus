import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { HantavirusReport } from '../../types/report'

function fmt(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

function fmtDate(value: string | null | undefined): string {
  if (!value) return '—'
  return value.slice(0, 10)
}

type Props = {
  onLogout: () => void
}

export default function AdminDashboard({ onLogout }: Props) {
  const [reports, setReports] = useState<HantavirusReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onLogout()
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
              Collected reports
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {reports.length} submission{reports.length === 1 ? '' : 's'}
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

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
            {error.includes('row-level security') && (
              <p className="mt-2 text-xs">
                Run <code className="rounded bg-red-100 px-1">supabase/migration-admin-rls.sql</code>{' '}
                and sign in with a Supabase Auth user.
              </p>
            )}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-200" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-500">
            No reports submitted yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <th className="whitespace-nowrap px-3 py-3">Country</th>
                    <th className="whitespace-nowrap px-3 py-3">Institution</th>
                    <th className="whitespace-nowrap px-3 py-3">Focal point</th>
                    <th className="whitespace-nowrap px-3 py-3">Contact</th>
                    <th className="whitespace-nowrap px-3 py-3">Report date</th>
                    <th className="whitespace-nowrap px-3 py-3 text-right">Total</th>
                    <th className="whitespace-nowrap px-3 py-3 text-right">Confirmed</th>
                    <th className="whitespace-nowrap px-3 py-3 text-right">Contacts</th>
                    <th className="whitespace-nowrap px-3 py-3 text-right">Deaths</th>
                    <th className="whitespace-nowrap px-3 py-3 text-right">Boat</th>
                    <th className="whitespace-nowrap px-3 py-3">Boat details</th>
                    <th className="whitespace-nowrap px-3 py-3 text-right">Air</th>
                    <th className="whitespace-nowrap px-3 py-3">Air details</th>
                    <th className="whitespace-nowrap px-3 py-3">Ethics</th>
                    <th className="whitespace-nowrap px-3 py-3">Ethics date</th>
                    <th className="whitespace-nowrap px-3 py-3 text-right">Enrolled</th>
                    <th className="whitespace-nowrap px-3 py-3">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports.map((r) => (
                    <tr key={r.id} className="hover:bg-teal-50/30">
                      <td className="whitespace-nowrap px-3 py-3 font-medium text-slate-900">
                        {fmt(r.country)}
                      </td>
                      <td className="max-w-[10rem] truncate px-3 py-3 text-slate-700">
                        {fmt(r.institution)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                        {fmt(r.focal_point)}
                      </td>
                      <td className="max-w-[10rem] truncate px-3 py-3 text-slate-700">
                        {fmt(r.contact)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                        {fmtDate(r.report_date)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                        {fmt(r.total_cases)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                        {fmt(r.confirmed_cases)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                        {fmt(r.suspected_cases)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                        {fmt(r.deaths)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                        {fmt(r.boat_contacts)}
                      </td>
                      <td className="max-w-[12rem] truncate px-3 py-3 text-slate-600">
                        {fmt(r.boat_exposure)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                        {fmt(r.airplane_contacts)}
                      </td>
                      <td className="max-w-[12rem] truncate px-3 py-3 text-slate-600">
                        {fmt(r.airplane_exposure)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 capitalize text-slate-700">
                        {fmt(r.ethics_approval)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                        {fmtDate(r.ethics_approval_date)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                        {fmt(r.enrolled_participants)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-slate-500">
                        {fmtDate(r.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
