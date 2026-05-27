import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  COUNTRY_OPTIONS,
  type CountryGroup,
  type CountryOption,
  getCountryLabel,
} from '../data/countries'

const GROUP_ORDER: CountryGroup[] = [
  'EU Member States',
  'Additional participating countries',
  'Other',
]

type Props = {
  value: string
  onChange: (value: string) => void
  required?: boolean
  disabled?: boolean
}

export default function CountryCombobox({
  value,
  onChange,
  required,
  disabled,
}: Props) {
  const id = useId()
  const listboxId = `${id}-listbox`
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlightIndex, setHighlightIndex] = useState(0)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return COUNTRY_OPTIONS
    return COUNTRY_OPTIONS.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.group.toLowerCase().includes(q),
    )
  }, [query])

  const grouped = useMemo(() => {
    const map = new Map<CountryGroup, CountryOption[]>()
    for (const g of GROUP_ORDER) map.set(g, [])
    for (const opt of filtered) {
      map.get(opt.group)?.push(opt)
    }
    return GROUP_ORDER.map((g) => ({
      group: g,
      options: map.get(g) ?? [],
    })).filter((x) => x.options.length > 0)
  }, [filtered])

  const flatFiltered = useMemo(
    () => grouped.flatMap((g) => g.options),
    [grouped],
  )

  const indexByValue = useMemo(
    () => new Map(flatFiltered.map((o, i) => [o.value, i])),
    [flatFiltered],
  )

  useEffect(() => {
    setHighlightIndex(0)
  }, [query, open])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
        inputRef.current?.blur()
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (!open || !listRef.current) return
    const el = listRef.current.querySelector(
      `[data-index="${highlightIndex}"]`,
    )
    el?.scrollIntoView({ block: 'nearest' })
  }, [highlightIndex, open])

  const displayValue = open ? query : getCountryLabel(value)

  const selectOption = (opt: CountryOption) => {
    onChange(opt.value)
    setQuery('')
    setOpen(false)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) setOpen(true)
      else
        setHighlightIndex((i) =>
          Math.min(i + 1, Math.max(0, flatFiltered.length - 1)),
        )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && open && flatFiltered[highlightIndex]) {
      e.preventDefault()
      selectOption(flatFiltered[highlightIndex])
    } else if (e.key === 'Tab') {
      setOpen(false)
      setQuery('')
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name="country" value={value} required={required} />

      <div
        className={`flex items-center overflow-hidden rounded-xl border bg-white shadow-sm transition ${
          open
            ? 'border-teal-500 ring-4 ring-teal-500/15'
            : 'border-slate-200 hover:border-slate-300'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          autoComplete="off"
          disabled={disabled}
          placeholder="Search or select a country…"
          value={displayValue}
          onChange={(e) => {
            setQuery(e.target.value)
            if (!open) setOpen(true)
            if (!e.target.value.trim()) onChange('')
          }}
          onFocus={() => {
            setOpen(true)
            setQuery(value ? getCountryLabel(value) : '')
            if (value) {
              const idx = indexByValue.get(value)
              if (idx !== undefined) setHighlightIndex(idx)
            }
          }}
          onBlur={() => {
            window.setTimeout(() => {
              setOpen(false)
              setQuery('')
            }, 180)
          }}
          onKeyDown={handleInputKeyDown}
          className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none sm:text-sm"
        />
        <div className="flex items-center gap-0.5 pr-2">
          {value && !disabled && (
            <button
              type="button"
              tabIndex={-1}
              aria-label="Clear selection"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange('')
                setQuery('')
                inputRef.current?.focus()
              }}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
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
            aria-label={open ? 'Close list' : 'Open list'}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              if (open) {
                setOpen(false)
                setQuery('')
              } else {
                setOpen(true)
                inputRef.current?.focus()
              }
            }}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
          >
            <svg
              className={`h-5 w-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
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
          </button>
        </div>
      </div>

      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-2 max-h-[min(18rem,50vh)] w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-2xl shadow-slate-300/40 sm:max-h-80"
        >
          {flatFiltered.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-slate-500">
              No country matches your search
            </li>
          ) : (
            grouped.map(({ group, options }) => (
              <li key={group} role="presentation">
                <div className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50/95 px-3 py-2 text-[0.65rem] font-bold uppercase tracking-widest text-slate-500 backdrop-blur-sm">
                  {group}
                </div>
                <ul role="group" aria-label={group}>
                  {options.map((opt) => {
                    const idx = indexByValue.get(opt.value) ?? 0
                    const selected = value === opt.value
                    const highlighted = idx === highlightIndex

                    return (
                      <li key={opt.value} role="presentation">
                        <button
                          type="button"
                          role="option"
                          aria-selected={selected}
                          data-index={idx}
                          onMouseDown={(e) => e.preventDefault()}
                          onMouseEnter={() => setHighlightIndex(idx)}
                          onClick={() => selectOption(opt)}
                          className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition sm:py-2.5 ${
                            highlighted
                              ? 'bg-teal-50 text-teal-900'
                              : 'text-slate-700'
                          } ${selected ? 'font-semibold' : ''}`}
                        >
                          <span className="flex-1 leading-snug">{opt.label}</span>
                          {selected && (
                            <svg
                              className="h-4 w-4 shrink-0 text-teal-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2.5}
                              aria-hidden
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.5 12.75l6 6 9-13.5"
                              />
                            </svg>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
