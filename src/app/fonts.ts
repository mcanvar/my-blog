import { Bricolage_Grotesque, JetBrains_Mono, Literata } from 'next/font/google'

/** Display & UI. The width axis gives condensed titles in the spirit of the old Barlow Semi Condensed. */
export const displayFont = Bricolage_Grotesque({
  subsets: ['latin', 'latin-ext'],
  axes: ['opsz', 'wdth'],
  variable: '--ff-display',
  display: 'swap',
})

/** Long-form reading. */
export const bodyFont = Literata({
  subsets: ['latin', 'latin-ext'],
  axes: ['opsz'],
  style: ['normal', 'italic'],
  variable: '--ff-body',
  display: 'swap',
})

export const monoFont = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--ff-mono',
  display: 'swap',
  preload: false,
})

export const fontVariables = `${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`
