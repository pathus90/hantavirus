export type EthicsApproval = '' | 'yes' | 'no'

export type HantavirusReport = {
  id: number
  country: string | null
  institution: string | null
  focal_point: string | null
  contact: string | null
  report_date: string | null
  total_cases: number | null
  confirmed_cases: number | null
  suspected_cases: number | null
  deaths: number | null
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
  reportDate: string
  totalCases: string
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
  reportDate: '',
  totalCases: '',
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
