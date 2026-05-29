import { useState, type FormEvent, type ReactNode } from 'react'
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

const labelClass =
  'mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500'

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
      if (name === 'ethicsApproval' && next !== 'yes') {
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

    if (formData.ethicsApproval === 'yes' && !formData.ethicsApprovalDate) {
      setError('Please enter the ethics approval date.')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase
      .from('hantavirus_reports')
      .insert([
        {
          country,
          institution: null,
          focal_point: null,
          contact: null,
          report_date: formData.reportDate || null,
          total_cases: toNumber(formData.totalCases),
          confirmed_cases: toNumber(formData.confirmedCases),
          suspected_cases: toNumber(formData.suspectedCases),
          deaths: toNumber(formData.deaths),
          boat_contacts: toNumber(formData.boatContacts),
          boat_exposure: formData.boatExposure || null,
          airplane_contacts: toNumber(formData.airplaneContacts),
          airplane_exposure: formData.airplaneExposure || null,
          ethics_approval: formData.ethicsApproval || null,
          ethics_approval_date:
            formData.ethicsApproval === 'yes'
              ? formData.ethicsApprovalDate || null
              : null,
          enrolled_participants: toNumber(formData.enrolledParticipants),
        },
      ])

    if (insertError) {
      setError(insertError.message)
    } else {
      setFormData(emptyFormData())
      setSuccess('Your report has been submitted successfully. Thank you.')
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

                    <div className="sm:col-span-2 sm:max-w-xs">
                      <label htmlFor="reportDate" className={labelClass}>
                        Date of report/update
                      </label>
                      <DatePicker
                        id="reportDate"
                        name="reportDate"
                        value={formData.reportDate}
                        onChange={handleChange}
                        placeholder="Select report date…"
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <SectionHeader n={2} title="Epidemiological Data" />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {(
                      [
                        ['totalCases', 'Total'],
                        ['confirmedCases', 'Number of confirmed cases'],
                        ['suspectedCases', 'Number of contacts'],
                        ['deaths', 'Number of deaths'],
                      ] as const
                    ).map(([name, label]) => (
                      <div
                        key={name}
                        className="rounded-xl border border-slate-100 bg-slate-50/50 p-4"
                      >
                        <label htmlFor={name} className={labelClass}>
                          {label}
                        </label>
                        <input
                          id={name}
                          type="number"
                          min={0}
                          inputMode="numeric"
                          name={name}
                          value={formData[name]}
                          onChange={handleChange}
                          className={`${inputClass} mt-1 bg-white`}
                        />
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-6">
                  <SectionHeader
                    n={3}
                    title="Exposure and Contact Information"
                  />

                  <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <div className="rounded-2xl border border-cyan-100/80 bg-gradient-to-b from-cyan-50/60 to-white p-5 sm:p-6">
                      <h4 className="font-semibold text-slate-900">
                        Maritime Exposure (Cruise/Boat)
                      </h4>
                      <div className="mt-5 space-y-4">
                        <div>
                          <label
                            htmlFor="boatContacts"
                            className={labelClass}
                          >
                            Contacts (boat/cruise)
                          </label>
                          <input
                            id="boatContacts"
                            type="number"
                            min={0}
                            inputMode="numeric"
                            name="boatContacts"
                            value={formData.boatContacts}
                            onChange={handleChange}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="boatExposure"
                            className={labelClass}
                          >
                            Exposure setting{' '}
                            <span className="font-normal normal-case text-slate-400">
                              (optional)
                            </span>
                          </label>
                          <textarea
                            id="boatExposure"
                            rows={3}
                            name="boatExposure"
                            value={formData.boatExposure}
                            onChange={handleChange}
                            className={`${inputClass} resize-y`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-sky-100/80 bg-gradient-to-b from-sky-50/60 to-white p-5 sm:p-6">
                      <h4 className="font-semibold text-slate-900">
                        Air Travel Exposure
                      </h4>
                      <div className="mt-5 space-y-4">
                        <div>
                          <label
                            htmlFor="airplaneContacts"
                            className={labelClass}
                          >
                            Contacts (airplane)
                          </label>
                          <input
                            id="airplaneContacts"
                            type="number"
                            min={0}
                            inputMode="numeric"
                            name="airplaneContacts"
                            value={formData.airplaneContacts}
                            onChange={handleChange}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="airplaneExposure"
                            className={labelClass}
                          >
                            Flight & exposure details{' '}
                            <span className="font-normal normal-case text-slate-400">
                              (optional)
                            </span>
                          </label>
                          <textarea
                            id="airplaneExposure"
                            rows={3}
                            name="airplaneExposure"
                            value={formData.airplaneExposure}
                            onChange={handleChange}
                            className={`${inputClass} resize-y`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <SectionHeader n={4} title="Regulatory" />

                  <div className="rounded-2xl border border-violet-100/80 bg-gradient-to-b from-violet-50/50 to-white p-5 sm:p-6">
                    <fieldset className="space-y-6">
                      <legend className="sr-only">Regulatory information</legend>

                      <div>
                        <span className={labelClass}>
                          Status of ethics approval
                        </span>
                        <div className="mt-3 flex flex-wrap gap-4">
                          {(
                            [
                              ['yes', 'Yes'],
                              ['no', 'No'],
                            ] as const
                          ).map(([value, label]) => {
                            const id = `ethicsApproval-${value}`
                            const checked = formData.ethicsApproval === value

                            return (
                              <label
                                key={value}
                                htmlFor={id}
                                className={`inline-flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                                  checked
                                    ? 'border-teal-500 bg-teal-50 text-teal-900 ring-2 ring-teal-500/20'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                }`}
                              >
                                <input
                                  id={id}
                                  type="checkbox"
                                  name="ethicsApproval"
                                  value={value}
                                  checked={checked}
                                  onChange={handleChange}
                                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                />
                                {label}
                              </label>
                            )
                          })}
                        </div>
                      </div>

                      {formData.ethicsApproval === 'yes' && (
                        <div className="max-w-md">
                          <label
                            htmlFor="ethicsApprovalDate"
                            className={labelClass}
                          >
                            Ethics approval date
                          </label>
                          <DatePicker
                            id="ethicsApprovalDate"
                            name="ethicsApprovalDate"
                            required
                            value={formData.ethicsApprovalDate}
                            onChange={handleChange}
                            placeholder="Select approval date…"
                            className="mt-1"
                          />
                        </div>
                      )}

                      <div className="max-w-md">
                        <label
                          htmlFor="enrolledParticipants"
                          className={labelClass}
                        >
                          Number of enrolled participants
                        </label>
                        <input
                          id="enrolledParticipants"
                          type="number"
                          min={0}
                          inputMode="numeric"
                          name="enrolledParticipants"
                          value={formData.enrolledParticipants}
                          onChange={handleChange}
                          className={`${inputClass} mt-1`}
                        />
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
