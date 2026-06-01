export type StudyProtocol = 'navis' | 'isaric'

export type EthicsApproval =
  | ''
  | 'in_preparation'
  | 'submitted'
  | 'approved'

export type HantavirusReport = {
  id: number
  country: string | null
  institution: string | null
  focal_point: string | null
  contact: string | null
  report_date: string | null
  study_protocol: string | null
  total_cases: number | null
  confirmed_cases: number | null
  suspected_cases: number | null
  deaths: number | null
  deaths_cases: number | null
  deaths_contacts: number | null
  boat_contacts: number | null
  boat_exposure: string | null
  airplane_contacts: number | null
  airplane_exposure: string | null
  ethics_approval: string | null
  ethics_approval_date: string | null
  enrolled_participants: number | null
  created_at: string | null
}

export type ReportFormData = {
  country: string
  countryOther: string
  studyProtocol: StudyProtocol | ''
  reportDate: string
  confirmedCases: string
  suspectedCases: string
  deaths: string
  boatContacts: string
  boatExposure: string
  airplaneContacts: string
  airplaneExposure: string
  ethicsApproval: EthicsApproval
  ethicsApprovalDate: string
  enrolledParticipants: string
}

export const emptyFormData = (): ReportFormData => ({
  country: '',
  countryOther: '',
  studyProtocol: 'navis',
  reportDate: '',
  confirmedCases: '',
  suspectedCases: '',
  deaths: '',
  boatContacts: '',
  boatExposure: '',
  airplaneContacts: '',
  airplaneExposure: '',
  ethicsApproval: '',
  ethicsApprovalDate: '',
  enrolledParticipants: '',
})

export const ETHICS_LABELS: Record<string, string> = {
  in_preparation: 'In preparation',
  submitted: 'Submitted',
  approved: 'Approved',
  yes: 'Approved',
  no: 'In preparation',
}

export const PROTOCOL_LABELS: Record<string, string> = {
  navis: 'NAVIS',
  isaric: 'ISARIC Hantavirus protocol',
}

export function reportDeathsTotal(r: HantavirusReport): number {
  if (r.deaths != null && r.deaths > 0) return r.deaths
  return (r.deaths_cases ?? 0) + (r.deaths_contacts ?? 0)
}

export function reportCasesTotal(r: HantavirusReport): number {
  const computed = (r.confirmed_cases ?? 0) + (r.suspected_cases ?? 0)
  if (computed > 0) return computed
  return r.total_cases ?? 0
}

export function normalizeEthics(value: string | null | undefined): string {
  const v = (value ?? '').toLowerCase()
  if (v === 'yes') return 'approved'
  if (v === 'no') return 'in_preparation'
  return v
}
