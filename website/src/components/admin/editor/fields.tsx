'use client'

import type { ReactNode } from 'react'
import { PlusIcon, TrashIcon } from '@/components/icons'

export function Field({
  label,
  hint,
  error,
  children,
  counter,
}: {
  label: string
  hint?: string
  error?: string
  counter?: { value: number; min?: number; max: number }
  children: ReactNode
}) {
  const over =
    counter &&
    (counter.value > counter.max || (counter.min !== undefined && counter.value < counter.min))
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold text-nature-medium">
      <span className="flex items-center justify-between">
        {label}
        {counter && (
          <span className={`font-normal tabular-nums ${over ? 'text-[#a65151]' : 'text-sage'}`}>
            {counter.value} / {counter.max}
          </span>
        )}
      </span>
      {children}
      {error ? (
        <span className="font-normal text-[#a65151]">{error}</span>
      ) : hint ? (
        <span className="font-normal text-sage">{hint}</span>
      ) : null}
    </label>
  )
}

export const inputClass =
  'w-full rounded-lg border border-[#e4e3dd] bg-white px-2.5 py-1.5 text-sm font-normal text-ink placeholder:text-sage focus:border-fern focus:outline-none'

export function Meter({ value, min, max }: { value: number; min: number; max: number }) {
  const pct = Math.min(100, (value / max) * 100)
  const ok = value >= min && value <= max
  return (
    <span className="block h-1 overflow-hidden rounded-full bg-[#e3e2dc]">
      <span
        className="block h-full transition-[width]"
        style={{ width: `${pct}%`, background: ok ? '#5d8a5a' : '#b08a2e' }}
      />
    </span>
  )
}

export function StringListField({
  label,
  hint,
  values,
  onChange,
  placeholder,
  max,
}: {
  label: string
  hint?: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder: string
  max: number
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-semibold text-nature-medium">{label}</p>
      {values.map((value, index) => (
        <div key={index} className="flex gap-1.5">
          <textarea
            value={value}
            rows={2}
            onChange={(e) => onChange(values.map((v, i) => (i === index ? e.target.value : v)))}
            placeholder={placeholder}
            className={`${inputClass} resize-y`}
            aria-label={`${label} ${index + 1}`}
          />
          <button
            type="button"
            onClick={() => onChange(values.filter((_, i) => i !== index))}
            className="self-start rounded-md p-1.5 text-sage hover:text-[#a65151]"
            aria-label="Remove"
          >
            <TrashIcon size={15} />
          </button>
        </div>
      ))}
      {values.length < max && (
        <button
          type="button"
          onClick={() => onChange([...values, ''])}
          className="flex items-center gap-1 self-start text-xs font-semibold text-nature-dark hover:underline"
        >
          <PlusIcon size={14} /> Add
        </button>
      )}
      {hint && <p className="text-[0.7rem] text-sage">{hint}</p>}
    </div>
  )
}

export function PairListField<T extends Record<string, string>>({
  label,
  values,
  onChange,
  fields,
  empty,
  max,
}: {
  label: string
  values: T[]
  onChange: (values: T[]) => void
  fields: { key: keyof T & string; placeholder: string; multiline?: boolean }[]
  empty: T
  max: number
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-nature-medium">{label}</p>
      {values.map((value, index) => (
        <div
          key={index}
          className="flex flex-col gap-1.5 rounded-lg border border-[#ecebe5] bg-[#faf9f6] p-2"
        >
          {fields.map((field) =>
            field.multiline ? (
              <textarea
                key={field.key}
                value={value[field.key]}
                rows={2}
                placeholder={field.placeholder}
                onChange={(e) =>
                  onChange(
                    values.map((v, i) => (i === index ? { ...v, [field.key]: e.target.value } : v))
                  )
                }
                className={`${inputClass} resize-y`}
              />
            ) : (
              <input
                key={field.key}
                value={value[field.key]}
                placeholder={field.placeholder}
                onChange={(e) =>
                  onChange(
                    values.map((v, i) => (i === index ? { ...v, [field.key]: e.target.value } : v))
                  )
                }
                className={inputClass}
              />
            )
          )}
          <button
            type="button"
            onClick={() => onChange(values.filter((_, i) => i !== index))}
            className="self-end text-[0.7rem] text-sage hover:text-[#a65151]"
          >
            Remove
          </button>
        </div>
      ))}
      {values.length < max && (
        <button
          type="button"
          onClick={() => onChange([...values, { ...empty }])}
          className="flex items-center gap-1 self-start text-xs font-semibold text-nature-dark hover:underline"
        >
          <PlusIcon size={14} /> Add
        </button>
      )}
    </div>
  )
}

export function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  hint?: string
}) {
  return (
    <label className="flex items-start gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 accent-[#35403a]"
      />
      <span>
        {label}
        {hint && <span className="block text-xs text-sage">{hint}</span>}
      </span>
    </label>
  )
}
