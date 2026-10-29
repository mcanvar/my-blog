import { site } from './site'
import type { Locale } from './types'

const formatters = new Map<string, Intl.DateTimeFormat>()

function formatter(locale: Locale, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}:${JSON.stringify(options)}`
  let value = formatters.get(key)
  if (!value) {
    value = new Intl.DateTimeFormat(site.htmlLang[locale], { timeZone: site.timeZone, ...options })
    formatters.set(key, value)
  }
  return value
}

/** Absolute dates (not "3 days ago") so cached HTML never goes stale or mismatches on hydration. */
export function formatDate(iso: string, locale: Locale): string {
  return formatter(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso))
}

export function formatShortDate(iso: string, locale: Locale): string {
  return formatter(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(iso)
  )
}

export function formatMonth(iso: string, locale: Locale): string {
  return formatter(locale, { month: 'short' }).format(new Date(iso))
}

export function formatDateTime(iso: string, locale: Locale): string {
  return formatter(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function yearOf(iso: string): number {
  return Number(formatter('en', { year: 'numeric' }).format(new Date(iso)))
}
