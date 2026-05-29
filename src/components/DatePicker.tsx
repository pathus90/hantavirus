import { useEffect, useId, useMemo, useRef, useState } from 'react'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null
  }
  return date
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDisplay(value: string): string {
  const date = parseIsoDate(value)
  if (!date) return ''
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function buildCalendarDays(view: Date): { date: Date; inMonth: boolean }[] {
  const year = view.getFullYear()
  const month = view.getMonth()
  const first = new Date(year, month, 1)
  const startOffset = (first.getDay() + 6) % 7
  const start = new Date(year, month, 1 - startOffset)
  const days: { date: Date; inMonth: boolean }[] = []

  for (let i = 0; i < 42; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    days.push({ date, inMonth: date.getMonth() === month })
  }

  return days
}

function isDisabledDate(
  date: Date,
  min?: string,
  max?: string,
): boolean {
  const iso = toIsoDate(date)
  if (min && iso < min) return true
  if (max && iso > max) return true
  return false
}

type Props = {
  id?: string
  name?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  min?: string
  max?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
  /** Compact styling for admin filters */
  size?: 'default' | 'compact'
}

export default function DatePicker({
  id: idProp,
  name,
  value,
  onChange,
  min,
  max,
  required,
  disabled,
  placeholder = 'Select a date…',
  className = '',
  size = 'default',
}: Props) {
  const autoId = useId()
  const id = idProp ?? autoId
  const popupId = `${id}-calendar`
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(() => {
    const parsed = parseIsoDate(value)
    return startOfMonth(parsed ?? new Date())
  })

  const today = useMemo(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
  }, [])

  const selected = useMemo(() => parseIsoDate(value), [value])
  const days = useMemo(() => buildCalendarDays(viewMonth), [viewMonth])
  const display = value ? formatDisplay(value) : ''

  const emitChange = (next: string) => {
    onChange({
      target: { name: name ?? '', value: next },
    } as React.ChangeEvent<HTMLInputElement>)
  }

  const selectDate = (date: Date) => {
    if (isDisabledDate(date, min, max)) return
    emitChange(toIsoDate(date))
    setOpen(false)
    triggerRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return
    const parsed = parseIsoDate(value)
    if (parsed) setViewMonth(startOfMonth(parsed))
  }, [open, value])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const compact = size === 'compact'
  const triggerPad = compact ? 'px-3 py-2.5 text-sm' : 'px-4 py-3 text-base sm:text-sm sm:py-2.5'

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {name ? (
        <input
          type="hidden"
          name={name}
          value={value}
          required={required}
          tabIndex={-1}
          aria-hidden
        />
      ) : null}

      <div
        className={`flex w-full items-center overflow-hidden rounded-xl border bg-white shadow-sm transition ${
          open
            ? 'border-teal-500 ring-4 ring-teal-500/15'
            : 'border-slate-200 hover:border-slate-300'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        <button
          ref={triggerRef}
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={popupId}
          onClick={() => setOpen((o) => !o)}
          className={`min-w-0 flex-1 truncate text-left ${triggerPad} ${
            display ? 'font-medium text-slate-800' : 'text-slate-400'
          } ${disabled ? 'cursor-not-allowed' : ''}`}
        >
          {display || placeholder}
        </button>
        <div className="flex shrink-0 items-center gap-0.5 pr-2">
          {value && !disabled && !required && (
            <button
              type="button"
              tabIndex={-1}
              aria-label="Clear date"
              disabled={disabled}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => emitChange('')}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            aria-label={open ? 'Close calendar' : 'Open calendar'}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setOpen((o) => !o)}
            className={`rounded-lg p-1.5 transition ${
              open
                ? 'bg-teal-50 text-teal-700'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
            }`}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div
          id={popupId}
          role="dialog"
          aria-label="Choose date"
          className={`absolute z-50 mt-2 w-full min-w-[17.5rem] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-300/40 ${
            compact ? 'sm:min-w-[18rem]' : 'sm:min-w-[19rem]'
          }`}
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() =>
                setViewMonth(
                  (m) => new Date(m.getFullYear(), m.getMonth() - 1, 1),
                )
              }
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path strokeLinecap="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <p className="font-display text-sm font-semibold text-slate-900">
              {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </p>

            <button
              type="button"
              aria-label="Next month"
              onClick={() =>
                setViewMonth(
                  (m) => new Date(m.getFullYear(), m.getMonth() + 1, 1),
                )
              }
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path strokeLinecap="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((d) => (
              <span
                key={d}
                className="pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400"
              >
                {d}
              </span>
            ))}
            {days.map(({ date, inMonth }) => {
              const iso = toIsoDate(date)
              const isSelected = selected ? sameDay(date, selected) : false
              const isToday = sameDay(date, today)
              const off = !inMonth
              const blocked = isDisabledDate(date, min, max)

              return (
                <button
                  key={iso}
                  type="button"
                  disabled={blocked}
                  onClick={() => selectDate(date)}
                  className={`relative flex h-9 w-full items-center justify-center rounded-lg text-sm font-medium transition ${
                    blocked
                      ? 'cursor-not-allowed text-slate-300'
                      : off
                        ? 'text-slate-300 hover:bg-slate-50'
                        : 'text-slate-700 hover:bg-teal-50 hover:text-teal-900'
                  } ${
                    isSelected
                      ? 'bg-gradient-to-br from-teal-600 to-teal-700 text-white shadow-md shadow-teal-600/25 hover:from-teal-600 hover:to-teal-700 hover:text-white'
                      : ''
                  } ${isToday && !isSelected ? 'ring-1 ring-teal-400/60 ring-inset' : ''}`}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => {
                if (!isDisabledDate(today, min, max)) selectDate(today)
              }}
              disabled={isDisabledDate(today, min, max)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-teal-700 transition hover:bg-teal-50 disabled:opacity-40"
            >
              Today
            </button>
            {!required && value ? (
              <button
                type="button"
                onClick={() => {
                  emitChange('')
                  setOpen(false)
                }}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                Clear
              </button>
            ) : (
              <span />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
