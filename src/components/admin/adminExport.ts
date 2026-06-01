import * as XLSX from 'xlsx'
import {
  reportCasesTotal,
  reportDeathsTotal,
  type HantavirusReport,
} from '../../types/report'
import type { CountryCaseRow, EthicsSlice, TimelinePoint } from './adminUtils'
import { fmtDate, fmtEthics, fmtProtocol } from './adminUtils'

export type ExportSheet = {
  name: string
  rows: Record<string, string | number | null | undefined>[]
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export function rowsToCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const lines = [
    headers.map(csvEscape).join(','),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const v = row[h]
          if (v === null || v === undefined) return ''
          return csvEscape(String(v))
        })
        .join(','),
    ),
  ]
  return lines.join('\r\n')
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  const csv = rowsToCsv(rows)
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  triggerDownload(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`)
}

export function downloadExcel(filename: string, sheets: ExportSheet[]) {
  const wb = XLSX.utils.book_new()
  for (const sheet of sheets) {
    const ws = XLSX.utils.json_to_sheet(sheet.rows)
    XLSX.utils.book_append_sheet(wb, ws, sheet.name.slice(0, 31))
  }
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  triggerDownload(blob, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`)
}

export function reportRows(reports: HantavirusReport[]) {
  return reports.map((r) => ({
    ID: r.id,
    Country: r.country ?? '',
    Protocol: fmtProtocol(r.study_protocol),
    Institution: r.institution ?? '',
    'Focal point': r.focal_point ?? '',
    Contact: r.contact ?? '',
    'Report date': fmtDate(r.report_date) === '—' ? '' : fmtDate(r.report_date),
    Total: reportCasesTotal(r) || '',
    'Confirmed cases (PCR+)': r.confirmed_cases ?? '',
    'Contacts (PCR−)': r.suspected_cases ?? '',
    Deaths: reportDeathsTotal(r) || '',
    'Boat contacts': r.boat_contacts ?? '',
    'Maritime exposure': r.boat_exposure ?? '',
    'Air contacts': r.airplane_contacts ?? '',
    'Air travel exposure': r.airplane_exposure ?? '',
    'Ethics status': fmtEthics(r.ethics_approval),
    'Ethics approval date':
      fmtDate(r.ethics_approval_date) === '—' ? '' : fmtDate(r.ethics_approval_date),
    'Enrolled participants': r.enrolled_participants ?? '',
    Submitted: fmtDate(r.created_at) === '—' ? '' : fmtDate(r.created_at),
  }))
}

export function countryCaseRows(rows: CountryCaseRow[]) {
  return rows.map((r) => ({
    Country: r.country,
    Total: r.total,
    'Confirmed (PCR+)': r.confirmed,
    'Contacts (PCR−)': r.suspected,
    Deaths: r.deaths,
    'Enrolled participants': r.enrolled,
  }))
}

export function timelineRows(points: TimelinePoint[]) {
  return points.map((p) => ({
    Date: p.date,
    'Reports submitted': p.reports,
  }))
}

export function ethicsRows(slices: EthicsSlice[]) {
  return slices.map((s) => ({
    Status: s.name,
    Count: s.value,
  }))
}

function exportBasename(): string {
  const d = new Date().toISOString().slice(0, 10)
  return `navis-export-${d}`
}

export function exportReportsCsv(reports: HantavirusReport[]) {
  downloadCsv(`${exportBasename()}-reports`, reportRows(reports))
}

export function exportCountryCasesCsv(rows: CountryCaseRow[]) {
  downloadCsv(`${exportBasename()}-cases-by-country`, countryCaseRows(rows))
}

export function exportTimelineCsv(points: TimelinePoint[]) {
  downloadCsv(`${exportBasename()}-submissions-timeline`, timelineRows(points))
}

export function exportEthicsCsv(slices: EthicsSlice[]) {
  downloadCsv(`${exportBasename()}-ethics`, ethicsRows(slices))
}

export function exportAllExcel(
  reports: HantavirusReport[],
  countryCases: CountryCaseRow[],
  timeline: TimelinePoint[],
  ethics: EthicsSlice[],
) {
  downloadExcel(`${exportBasename()}-all`, [
    { name: 'Reports', rows: reportRows(reports) },
    { name: 'Cases by country', rows: countryCaseRows(countryCases) },
    { name: 'Submissions timeline', rows: timelineRows(timeline) },
    { name: 'Ethics approval', rows: ethicsRows(ethics) },
  ])
}

export function exportReportsExcel(reports: HantavirusReport[]) {
  downloadExcel(`${exportBasename()}-reports`, [
    { name: 'Reports', rows: reportRows(reports) },
  ])
}
