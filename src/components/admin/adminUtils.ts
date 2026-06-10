import type { HantavirusReport } from '../../types/report'
import {
  ETHICS_LABELS,
  normalizeEthics,
  reportCasesTotal,
  reportDeathsTotal,
  reportEnrolledTotal,
} from '../../types/report'

export type AdminFilters = {
  country: string
  ethics: string
  protocol: string
  dateFrom: string
  dateTo: string
}

export const emptyAdminFilters = (): AdminFilters => ({
  country: '',
  ethics: '',
  protocol: '',
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

    if (filters.protocol && (r.study_protocol ?? 'navis') !== filters.protocol) {
      return false
    }

    if (filters.ethics) {
      const v = normalizeEthics(r.ethics_approval)
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

export function sumCases(reports: HantavirusReport[]): number {
  return reports.reduce((s, r) => s + reportCasesTotal(r), 0)
}

export function sumDeaths(reports: HantavirusReport[]): number {
  return reports.reduce((s, r) => s + reportDeathsTotal(r), 0)
}

export function sumEnrolled(reports: HantavirusReport[]): number {
  return reports.reduce((s, r) => s + reportEnrolledTotal(r), 0)
}

export type CountryCaseRow = {
  country: string
  total: number
  confirmed: number
  suspected: number
  deaths: number
  enrolledPcrPositive: number
  enrolledPcrNegative: number
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
      enrolledPcrPositive: 0,
      enrolledPcrNegative: 0,
      enrolled: 0,
    }
    row.total += reportCasesTotal(r)
    row.confirmed += r.confirmed_cases ?? 0
    row.suspected += r.suspected_cases ?? 0
    row.deaths += reportDeathsTotal(r)
    row.enrolledPcrPositive += r.enrolled_pcr_positive ?? 0
    row.enrolledPcrNegative += r.enrolled_pcr_negative ?? 0
    row.enrolled += reportEnrolledTotal(r)
    map.set(country, row)
  }

  return [...map.values()].sort((a, b) => b.total - a.total)
}

export type EthicsSlice = { name: string; value: number; fill: string }

const ETHICS_COLORS: Record<string, string> = {
  approved: '#0d9488',
  submitted: '#6366f1',
  in_preparation: '#f59e0b',
  unset: '#cbd5e1',
}

export function ethicsBreakdown(reports: HantavirusReport[]): EthicsSlice[] {
  const counts = new Map<string, number>()

  for (const r of reports) {
    const v = normalizeEthics(r.ethics_approval)
    const key = v || 'unset'
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const order = ['approved', 'submitted', 'in_preparation', 'unset']

  return order
    .filter((k) => (counts.get(k) ?? 0) > 0)
    .map((k) => ({
      name: k === 'unset' ? 'Not set' : (ETHICS_LABELS[k] ?? k),
      value: counts.get(k) ?? 0,
      fill: ETHICS_COLORS[k] ?? '#64748b',
    }))
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

export function fmtEthics(value: string | null | undefined): string {
  const v = normalizeEthics(value)
  if (!v) return '—'
  return ETHICS_LABELS[v] ?? v
}

export function fmtProtocol(value: string | null | undefined): string {
  const v = value ?? 'navis'
  return v === 'isaric' ? 'ISARIC' : 'NAVIS'
}
