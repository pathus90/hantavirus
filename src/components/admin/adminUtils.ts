import type { HantavirusReport } from '../../types/report'

export type AdminFilters = {
  country: string
  ethics: string
  dateFrom: string
  dateTo: string
}

export const emptyAdminFilters = (): AdminFilters => ({
  country: '',
  ethics: '',
  dateFrom: '',
  dateTo: '',
})

function reportDate(r: HantavirusReport): string {
  return (r.report_date ?? r.created_at?.slice(0, 10) ?? '').slice(0, 10)
}

export function filterReports(
  reports: HantavirusReport[],
  filters: AdminFilters,
): HantavirusReport[] {
  return reports.filter((r) => {
    if (filters.country && r.country !== filters.country) return false

    if (filters.ethics) {
      const v = (r.ethics_approval ?? '').toLowerCase()
      if (filters.ethics === 'unset' && v) return false
      if (filters.ethics !== 'unset' && v !== filters.ethics) return false
    }

    const d = reportDate(r)
    if (filters.dateFrom && d && d < filters.dateFrom) return false
    if (filters.dateTo && d && d > filters.dateTo) return false

    return true
  })
}

export function uniqueCountries(reports: HantavirusReport[]): string[] {
  return [...new Set(reports.map((r) => r.country).filter(Boolean) as string[])].sort(
    (a, b) => a.localeCompare(b),
  )
}

export function sumField(
  reports: HantavirusReport[],
  field: keyof HantavirusReport,
): number {
  return reports.reduce((s, r) => s + (Number(r[field]) || 0), 0)
}

export type CountryCaseRow = {
  country: string
  total: number
  confirmed: number
  suspected: number
  deaths: number
  enrolled: number
}

export function casesByCountry(reports: HantavirusReport[]): CountryCaseRow[] {
  const map = new Map<string, CountryCaseRow>()

  for (const r of reports) {
    const country = r.country ?? 'Unknown'
    const row = map.get(country) ?? {
      country,
      total: 0,
      confirmed: 0,
      suspected: 0,
      deaths: 0,
      enrolled: 0,
    }
    row.total += r.total_cases ?? 0
    row.confirmed += r.confirmed_cases ?? 0
    row.suspected += r.suspected_cases ?? 0
    row.deaths += r.deaths ?? 0
    row.enrolled += r.enrolled_participants ?? 0
    map.set(country, row)
  }

  return [...map.values()].sort((a, b) => b.total - a.total)
}

export type EthicsSlice = { name: string; value: number; fill: string }

export function ethicsBreakdown(reports: HantavirusReport[]): EthicsSlice[] {
  let yes = 0
  let no = 0
  let unset = 0

  for (const r of reports) {
    const v = (r.ethics_approval ?? '').toLowerCase()
    if (v === 'yes') yes++
    else if (v === 'no') no++
    else unset++
  }

  return [
    { name: 'Yes', value: yes, fill: '#0d9488' },
    { name: 'No', value: no, fill: '#64748b' },
    { name: 'Not set', value: unset, fill: '#cbd5e1' },
  ].filter((x) => x.value > 0)
}

export type TimelinePoint = { date: string; reports: number }

export function submissionsTimeline(reports: HantavirusReport[]): TimelinePoint[] {
  const map = new Map<string, number>()

  for (const r of reports) {
    const d = reportDate(r)
    if (!d) continue
    map.set(d, (map.get(d) ?? 0) + 1)
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, reports: count }))
}

export function fmt(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

export function fmtDate(value: string | null | undefined): string {
  if (!value) return '—'
  return value.slice(0, 10)
}
