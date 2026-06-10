import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ADDITIONAL_PARTICIPATING_COUNTRIES,
  EU_MEMBER_STATES,
  OTHER_COUNTRY_VALUE,
} from '../data/countries'
import { supabase } from '../lib/supabase'
import { emptyFormData, type ReportFormData } from '../types/report'
import CountryCombobox from './CountryCombobox'
import DatePicker from './DatePicker'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 shadow-sm transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/15 sm:text-sm sm:py-2.5'

const choiceClass = (checked: boolean) =>
  `inline-flex min-h-[2.75rem] cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
    checked
      ? 'border-teal-500 bg-teal-50 text-teal-900 ring-2 ring-teal-500/20'
      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
  }`

const labelClass =
  'mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500'

const hintClass = 'mb-2 text-xs leading-relaxed text-slate-500'

const fieldCardClass =
  'flex flex-col rounded-xl border border-slate-100 bg-slate-50/50 p-4'

function FormNumberField({
  id,
  name,
  label,
  value,
  onChange,
  hint,
  className = '',
}: {
  id: string
  name: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  hint?: string
  className?: string
}) {
  return (
    <div className={`${fieldCardClass} ${className}`.trim()}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {hint ? <p className={hintClass}>{hint}</p> : null}
      <input
        id={id}
        type="number"
        min={0}
        inputMode="numeric"
        name={name}
        value={value}
        onChange={onChange}
        className={`${inputClass} bg-white`}
      />
    </div>
  )
}

function ChoiceGroup({
  legend,
  hint,
  name,
  value,
  onChange,
  options,
  columns = 2,
  legendClass = labelClass,
}: {
  legend: string
  hint?: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  options: readonly (readonly [string, string])[]
  columns?: 1 | 2 | 3
  legendClass?: string
}) {
  const gridClass =
    columns === 1
      ? 'grid-cols-1'
      : columns === 3
        ? 'grid-cols-1 sm:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2'

  return (
    <div>
      <span className={legendClass}>{legend}</span>
      {hint ? <p className={hintClass}>{hint}</p> : null}
      <div className={`grid gap-2 ${gridClass}`}>
        {options.map(([optionValue, optionLabel]) => {
          const id = `${name}-${optionValue}`
          const checked = value === optionValue

          return (
            <label
              key={optionValue}
              htmlFor={id}
              className={`${choiceClass(checked)} w-full`}
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={optionValue}
                checked={checked}
                onChange={onChange}
                className="h-4 w-4 shrink-0 border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="min-w-0 flex-1 leading-snug">{optionLabel}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

function toNumber(value: string): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function resolveCountry(formData: ReportFormData): string | null {
  if (!formData.country) return null
  if (formData.country === OTHER_COUNTRY_VALUE) {
    const other = formData.countryOther.trim()
    return other || null
  }
  return formData.country
}

function SectionHeader({
  n,
  title,
  children,
}: {
  n: number
  title: string
  children?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:gap-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 text-sm font-bold text-white shadow-md shadow-teal-600/25">
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-lg font-semibold text-slate-900 sm:text-xl">
          {title}
        </h3>
        {children}
      </div>
    </div>
  )
}

function Alert({
  type,
  children,
}: {
  type: 'error' | 'success'
  children: ReactNode
}) {
  const styles =
    type === 'error'
      ? 'border-red-200/90 bg-red-50 text-red-900'
      : 'border-emerald-200/90 bg-emerald-50 text-emerald-900'

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`rounded-2xl border px-4 py-3.5 text-sm font-medium shadow-sm sm:px-5 sm:py-4 ${styles}`}
    >
      {children}
    </div>
  )
}

function ParticipatingCountriesPanel() {
  return (
    <div className="space-y-5 text-sm leading-relaxed text-slate-600">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-teal-800">
          EU
        </p>
        <p className="mt-1 font-medium text-slate-800">All EU Member States</p>
        <ul className="mt-3 grid grid-cols-1 gap-x-4 gap-y-0.5 sm:grid-cols-2">
          {EU_MEMBER_STATES.map((c) => (
            <li key={c} className="truncate py-0.5 text-slate-600">
              {c}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        {['Türkiye', 'United Kingdom', 'Switzerland', 'Norway'].map((c) => (
          <span
            key={c}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
          >
            {c}
          </span>
        ))}
      </div>

      <div>
        <p className="font-medium text-slate-800">
          Additional non-European countries
        </p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {ADDITIONAL_PARTICIPATING_COUNTRIES.filter(
            (c) =>
              c !== 'Türkiye' &&
              c !== 'United Kingdom' &&
              c !== 'Switzerland' &&
              c !== 'Norway',
          ).map((c) => (
            <li
              key={c}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600"
            >
              {c}
            </li>
          ))}
        </ul>
      </div>

      <p className="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs italic text-slate-500">
        Other participating countries as applicable
      </p>
    </div>
  )
}

export default function HantavirusPortal() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState<ReportFormData>(emptyFormData)

  const isOtherCountry = formData.country === OTHER_COUNTRY_VALUE

  const computedTotalCases = useMemo(
    () => toNumber(formData.confirmedCases) + toNumber(formData.suspectedCases),
    [formData.confirmedCases, formData.suspectedCases],
  )

  const computedTotalEnrolled = useMemo(
    () =>
      toNumber(formData.enrolledPcrPositive) +
      toNumber(formData.enrolledPcrNegative),
    [formData.enrolledPcrPositive, formData.enrolledPcrNegative],
  )

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target
    const next =
      type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
          ? value
          : ''
        : value

    setFormData((prev) => {
      const updated = { ...prev, [name]: next }
      if (name === 'ethicsApproval' && next !== 'approved') {
        updated.ethicsApprovalDate = ''
      }
      return updated
    })
    setSuccess(null)
  }

  const handleCountryChange = (country: string) => {
    setFormData((prev) => ({
      ...prev,
      country,
      countryOther:
        country === OTHER_COUNTRY_VALUE ? prev.countryOther : '',
    }))
    setSuccess(null)
  }

  const handleReset = () => {
    setFormData(emptyFormData())
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const country = resolveCountry(formData)

    if (!country) {
      setError(
        isOtherCountry
          ? 'Please specify the other participating country.'
          : 'Please select a country.',
      )
      setLoading(false)
      return
    }

    if (!formData.reportDate) {
      setError('Please select the date of report/update.')
      setLoading(false)
      return
    }

    const { data, error: submitError } = await supabase.rpc(
      'submit_hantavirus_report',
      {
        p_country: country,
        p_report_date: formData.reportDate,
        p_study_protocol: formData.studyProtocol || 'navis',
        p_institution: null,
        p_focal_point: null,
        p_contact: null,
        p_total_cases: computedTotalCases,
        p_confirmed_cases: toNumber(formData.confirmedCases),
        p_suspected_cases: toNumber(formData.suspectedCases),
        p_deaths_cases: toNumber(formData.deathsCases),
        p_deaths_contacts: toNumber(formData.deathsContacts),
        p_contacts_became_cases: toNumber(formData.contactsBecameCases),
        p_boat_contacts: 0,
        p_boat_exposure: null,
        p_airplane_contacts: 0,
        p_airplane_exposure: null,
        p_hcw_contacts: 0,
        p_hcw_exposure: null,
        p_ethics_approval: formData.ethicsApproval || null,
        p_ethics_approval_date: formData.ethicsApprovalDate || null,
        p_enrolled_pcr_positive: toNumber(formData.enrolledPcrPositive),
        p_enrolled_pcr_negative: toNumber(formData.enrolledPcrNegative),
      },
    )

    if (submitError) {
      const msg = submitError.message
      setError(
        msg.includes('submit_hantavirus_report') ||
          msg.includes('p_study_protocol') ||
          msg.includes('p_deaths_cases') ||
          msg.includes('p_contacts_became_cases') ||
          msg.includes('p_enrolled_pcr_positive')
          ? 'Server setup incomplete: run supabase/migration-regulatory-v4.sql in Supabase SQL Editor.'
          : msg,
      )
    } else {
      const updated =
        data &&
        typeof data === 'object' &&
        'updated' in data &&
        Boolean((data as { updated?: boolean }).updated)

      setFormData(emptyFormData())
      setSuccess(
        updated
          ? 'Your report for this country and date has been updated. Thank you.'
          : 'Your report has been submitted successfully. Thank you.',
      )
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    setLoading(false)
  }

  return (
    <div className="relative min-h-screen">
      <div
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(165deg,#ecfdf8_0%,#f4f7f6_35%,#f8fafc_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed -right-20 top-0 h-72 w-72 rounded-full bg-teal-300/20 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10 lg:px-8">
        <header className="mb-8 sm:mb-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-white/80 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-teal-800 shadow-sm backdrop-blur-sm sm:text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                Data collection
              </p>
              <h1 className="font-display text-balance text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                Natural History of Andes Virus Infection (NAVIS)
              </h1>
              <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-slate-600 sm:mt-4 sm:text-base">
                National focal points and country correspondents can use this
                portal to submit and regularly update epidemiological information
                for the Natural History of Andes Virus Infection (NAVIS) study.
              </p>
            </div>
            <Link
              to="/admin"
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <svg
                className="h-4 w-4 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Admin space
            </Link>
          </div>
        </header>

        {(error || success) && (
          <div className="mb-6 space-y-3">
            {error && <Alert type="error">{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Mobile: collapsible reference */}
          <details className="group rounded-2xl border border-slate-200/90 bg-white/90 shadow-sm backdrop-blur-sm lg:hidden open:shadow-md">
            <summary className="cursor-pointer list-none px-5 py-4 font-display text-base font-semibold text-slate-900 marker:hidden [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-2">
                Participating Countries
                <svg
                  className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
            </summary>
            <div className="border-t border-slate-100 px-5 pb-5 pt-2">
              <ParticipatingCountriesPanel />
            </div>
          </details>

          {/* Desktop sidebar */}
          <aside className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-6 rounded-2xl border border-slate-200/90 bg-white/90 p-6 shadow-lg shadow-slate-200/30 backdrop-blur-sm">
              <h2 className="font-display text-lg font-semibold text-slate-900">
                Participating Countries
              </h2>
              <div className="mt-5">
                <ParticipatingCountriesPanel />
              </div>
            </div>
          </aside>

          <main className="lg:col-span-8">
            <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/40 sm:rounded-3xl">
              <div className="border-b border-slate-100 bg-gradient-to-r from-teal-50/80 to-white px-5 py-6 sm:px-8 sm:py-7">
                <h2 className="font-display text-xl font-semibold text-slate-900 sm:text-2xl">
                  Country Information to be Reported
                </h2>
                <p className="mt-1.5 text-sm text-slate-600">
                  For each country, please provide the following information.
                </p>
              </div>

              <form
                className="space-y-10 px-5 py-8 sm:space-y-12 sm:px-8 sm:py-10"
                onSubmit={handleSubmit}
                onReset={handleReset}
              >
                <section className="space-y-6">
                  <SectionHeader n={1} title="General Country Information">
                    <p className="mt-1 hidden text-sm text-slate-500 sm:block">
                      Country and report date
                    </p>
                  </SectionHeader>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <p className={labelClass}>Country name</p>
                      <CountryCombobox
                        value={formData.country}
                        onChange={handleCountryChange}
                        required
                        disabled={loading}
                      />
                    </div>

                    {isOtherCountry && (
                      <div className="sm:col-span-2">
                        <label htmlFor="countryOther" className={labelClass}>
                          Specify country
                        </label>
                        <input
                          id="countryOther"
                          type="text"
                          name="countryOther"
                          required
                          value={formData.countryOther}
                          onChange={handleChange}
                          placeholder="Enter country name"
                          className={inputClass}
                        />
                      </div>
                    )}

                    <div className="sm:col-span-2">
                      <ChoiceGroup
                        legend="Study protocol"
                        hint="e.g. Ireland may report under the ISARIC Hantavirus protocol instead of NAVIS."
                        name="studyProtocol"
                        value={formData.studyProtocol}
                        onChange={handleChange}
                        options={[
                          ['navis', 'NAVIS'],
                          ['isaric', 'ISARIC Hantavirus protocol'],
                        ]}
                        columns={2}
                      />
                    </div>

                    <div className="sm:col-span-2 sm:max-w-xs">
                      <label htmlFor="reportDate" className={labelClass}>
                        Date of report/update
                      </label>
                      <DatePicker
                        id="reportDate"
                        name="reportDate"
                        required
                        value={formData.reportDate}
                        onChange={handleChange}
                        placeholder="Select report date…"
                      />
                      <p className="mt-1.5 text-xs text-slate-500">
                        A new submission for the same country on the same day
                        replaces that day&apos;s report.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <SectionHeader n={2} title="Epidemiological Data">
                    <p className="mt-1 hidden text-sm text-slate-500 sm:block">
                      Confirmed cases are PCR+; contacts are PCR−
                    </p>
                  </SectionHeader>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormNumberField
                      id="confirmedCases"
                      name="confirmedCases"
                      label="Confirmed cases (PCR+)"
                      value={formData.confirmedCases}
                      onChange={handleChange}
                    />
                    <FormNumberField
                      id="suspectedCases"
                      name="suspectedCases"
                      label="Contacts (PCR−)"
                      value={formData.suspectedCases}
                      onChange={handleChange}
                    />
                    <FormNumberField
                      id="contactsBecameCases"
                      name="contactsBecameCases"
                      label="Contacts who became cases (PCR− → PCR+)"
                      value={formData.contactsBecameCases}
                      onChange={handleChange}
                      className="sm:col-span-2"
                    />

                    <div className={`${fieldCardClass} sm:col-span-2`}>
                      <span className={labelClass}>Deaths</span>
                      <p className={hintClass}>
                        Reported separately from the total (not included in the
                        PCR+ / PCR− sum above).
                      </p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormNumberField
                          id="deathsCases"
                          name="deathsCases"
                          label="PCR+ (confirmed cases)"
                          hint="Count"
                          value={formData.deathsCases}
                          onChange={handleChange}
                          className="border-0 bg-transparent p-0"
                        />
                        <FormNumberField
                          id="deathsContacts"
                          name="deathsContacts"
                          label="PCR− (contacts)"
                          hint="Count"
                          value={formData.deathsContacts}
                          onChange={handleChange}
                          className="border-0 bg-transparent p-0"
                        />
                      </div>
                    </div>

                    <div
                      className={`${fieldCardClass} sm:col-span-2 sm:max-w-sm sm:justify-self-end`}
                    >
                      <span className={labelClass}>Total cases</span>
                      <p className={hintClass}>
                        Confirmed (PCR+) + Contacts (PCR−). Deaths are not
                        included.
                      </p>
                      <output
                        htmlFor="confirmedCases suspectedCases"
                        className={`${inputClass} block bg-slate-50 tabular-nums text-slate-900`}
                        aria-live="polite"
                      >
                        {computedTotalCases}
                      </output>
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <SectionHeader n={3} title="Regulatory" />

                  <div className="rounded-2xl border border-violet-100/80 bg-gradient-to-b from-violet-50/50 to-white p-5 sm:p-6">
                    <fieldset className="space-y-6">
                      <legend className="sr-only">Regulatory information</legend>

                      <ChoiceGroup
                        legend="Ethics approval status"
                        name="ethicsApproval"
                        value={formData.ethicsApproval}
                        onChange={handleChange}
                        options={[
                          ['in_preparation', 'In preparation'],
                          ['submitted', 'Submitted'],
                          ['approved', 'Approved'],
                        ]}
                        columns={3}
                      />

                      {formData.ethicsApproval === 'approved' && (
                        <div className="max-w-md">
                          <label
                            htmlFor="ethicsApprovalDate"
                            className={labelClass}
                          >
                            Ethics approval date{' '}
                            <span className="font-normal normal-case text-slate-400">
                              (optional)
                            </span>
                          </label>
                          <DatePicker
                            id="ethicsApprovalDate"
                            name="ethicsApprovalDate"
                            value={formData.ethicsApprovalDate}
                            onChange={handleChange}
                            placeholder="Select approval date…"
                            className="mt-1"
                          />
                        </div>
                      )}

                      <div className={`${fieldCardClass} sm:col-span-2`}>
                        <span className={labelClass}>Enrolled participants</span>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <FormNumberField
                            id="enrolledPcrPositive"
                            name="enrolledPcrPositive"
                            label="Enrolled PCR+"
                            value={formData.enrolledPcrPositive}
                            onChange={handleChange}
                            className="border-0 bg-transparent p-0"
                          />
                          <FormNumberField
                            id="enrolledPcrNegative"
                            name="enrolledPcrNegative"
                            label="Enrolled PCR−"
                            value={formData.enrolledPcrNegative}
                            onChange={handleChange}
                            className="border-0 bg-transparent p-0"
                          />
                        </div>
                        <div className="mt-4 border-t border-slate-100 pt-4">
                          <span className={labelClass}>Total enrolled</span>
                          <p className={hintClass}>
                            Enrolled PCR+ + Enrolled PCR−
                          </p>
                          <output
                            htmlFor="enrolledPcrPositive enrolledPcrNegative"
                            className={`${inputClass} block bg-slate-50 tabular-nums text-slate-900`}
                            aria-live="polite"
                          >
                            {computedTotalEnrolled}
                          </output>
                        </div>
                      </div>
                    </fieldset>
                  </div>
                </section>

                <div className="sticky bottom-0 -mx-5 flex flex-col-reverse gap-3 border-t border-slate-100 bg-white/95 px-5 py-4 backdrop-blur-md sm:static sm:mx-0 sm:flex-row sm:justify-end sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:pt-4">
                  <button
                    type="reset"
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.99] disabled:opacity-50 sm:w-auto sm:py-3"
                  >
                    Reset form
                  </button>
                  <button
                    disabled={loading}
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 active:scale-[0.99] disabled:opacity-50 sm:w-auto sm:py-3"
                  >
                    {loading && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    )}
                    {loading ? 'Submitting…' : 'Submit report'}
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
