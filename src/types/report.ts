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
  contacts_became_cases: number | null
  hcw_contacts: number | null
  hcw_exposure: string | null
  ethics_approval: string | null
  ethics_approval_date: string | null
  enrolled_participants: number | null
  enrolled_pcr_positive: number | null
  enrolled_pcr_negative: number | null
  created_at: string | null
}

export type ReportFormData = {
  country: string
  countryOther: string
  studyProtocol: StudyProtocol | ''
  reportDate: string
  totalCases: string
  confirmedCases: string
  suspectedCases: string
  contactsBecameCases: string
  deathsCases: string
  deathsContacts: string
  ethicsApproval: EthicsApproval
  ethicsApprovalDate: string
  enrolledPcrPositive: string
  enrolledPcrNegative: string
}

export const emptyFormData = (): ReportFormData => ({
  country: '',
  countryOther: '',
  studyProtocol: 'navis',
  reportDate: '',
  totalCases: '',
  confirmedCases: '',
  suspectedCases: '',
  contactsBecameCases: '',
  deathsCases: '',
  deathsContacts: '',
  ethicsApproval: '',
  ethicsApprovalDate: '',
  enrolledPcrPositive: '',
  enrolledPcrNegative: '',
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

export function reportEnrolledTotal(r: HantavirusReport): number {
  const fromSplit =
    (r.enrolled_pcr_positive ?? 0) + (r.enrolled_pcr_negative ?? 0)
  if (fromSplit > 0) return fromSplit
  return r.enrolled_participants ?? 0
}

export function reportDeathsTotal(r: HantavirusReport): number {
  const fromSplit = (r.deaths_cases ?? 0) + (r.deaths_contacts ?? 0)
  if (fromSplit > 0) return fromSplit
  return r.deaths ?? 0
}

export function reportCasesTotal(r: HantavirusReport): number {
  if (r.total_cases != null && r.total_cases > 0) return r.total_cases
  return (r.confirmed_cases ?? 0) + (r.suspected_cases ?? 0)
}

export function normalizeEthics(value: string | null | undefined): string {
  const v = (value ?? '').toLowerCase()
  if (v === 'yes') return 'approved'
  if (v === 'no') return 'in_preparation'
  return v
}
