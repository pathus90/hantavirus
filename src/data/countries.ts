/** EU Member States (27) — per portal specification */
export const EU_MEMBER_STATES = [
  'Austria',
  'Belgium',
  'Bulgaria',
  'Croatia',
  'Cyprus',
  'Czechia',
  'Denmark',
  'Estonia',
  'Finland',
  'France',
  'Germany',
  'Greece',
  'Hungary',
  'Ireland',
  'Italy',
  'Latvia',
  'Lithuania',
  'Luxembourg',
  'Malta',
  'Netherlands',
  'Poland',
  'Portugal',
  'Romania',
  'Slovakia',
  'Slovenia',
  'Spain',
  'Sweden',
] as const

/** Additional participating countries — per portal specification */
export const ADDITIONAL_PARTICIPATING_COUNTRIES = [
  'Türkiye',
  'United Kingdom',
  'Switzerland',
  'Norway',
  'Canada',
  'New Zealand',
  'United States',
  'Singapore',
  'Japan',
] as const

export const OTHER_COUNTRY_VALUE = '__other__'

export const OTHER_COUNTRY_LABEL =
  'Other participating country (as applicable)'

export type CountryGroup =
  | 'EU Member States'
  | 'Additional participating countries'
  | 'Other'

export type CountryOption = {
  value: string
  label: string
  group: CountryGroup
}

export const COUNTRY_OPTIONS: CountryOption[] = [
  ...EU_MEMBER_STATES.map((label) => ({
    value: label,
    label,
    group: 'EU Member States' as const,
  })),
  ...ADDITIONAL_PARTICIPATING_COUNTRIES.map((label) => ({
    value: label,
    label,
    group: 'Additional participating countries' as const,
  })),
  {
    value: OTHER_COUNTRY_VALUE,
    label: OTHER_COUNTRY_LABEL,
    group: 'Other',
  },
]

export function getCountryLabel(value: string): string {
  if (!value) return ''
  if (value === OTHER_COUNTRY_VALUE) return OTHER_COUNTRY_LABEL
  return value
}
