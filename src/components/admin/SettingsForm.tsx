'use client'

import { useState, useTransition } from 'react'
import { saveSettingsAction } from '@/app/admin/actions/settings'
import type { SiteSettings } from '@/lib/types'
import { Field, inputClass, Toggle } from './editor/fields'

const lines = (value: string) =>
  value
    .split('\n')
    .map((v) => v.trim())
    .filter(Boolean)

export function SettingsForm({ initial, crawlers }: { initial: SiteSettings; crawlers: string[] }) {
  const [settings, setSettings] = useState(initial)
  const [sameAs, setSameAs] = useState(initial.sameAs.join('\n'))
  const [knowsAbout, setKnowsAbout] = useState(initial.knowsAbout.join('\n'))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setSettings((s) => ({ ...s, [key]: value }))

  function submit() {
    startTransition(async () => {
      const result = await saveSettingsAction({
        ...settings,
        sameAs: lines(sameAs),
        knowsAbout: lines(knowsAbout),
      })
      if (result.ok) {
        setErrors({})
        setMessage({ ok: true, text: 'Saved. The site picks this up within a few minutes.' })
      } else {
        setErrors(result.fieldErrors ?? {})
        setMessage({ ok: false, text: result.error })
      }
    })
  }

  const section = 'rounded-xl border border-[#e4e3dd] bg-white p-5 flex flex-col gap-4'

  return (
    <form
      className="grid max-w-5xl gap-6 lg:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <section className={section}>
        <h2 className="font-semibold">Author</h2>
        <p className="-mt-3 text-xs text-fern">
          Feeds the Person entity in JSON-LD, the About page and bylines.
        </p>
        <Field label="Name" error={errors.authorName}>
          <input
            value={settings.authorName}
            onChange={(e) => set('authorName', e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Job title" error={errors.authorJobTitle}>
          <input
            value={settings.authorJobTitle}
            onChange={(e) => set('authorJobTitle', e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Avatar URL" error={errors.avatarUrl}>
          <input
            value={settings.avatarUrl}
            onChange={(e) => set('avatarUrl', e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Bio (Türkçe)" error={errors.bioTr}>
          <textarea
            value={settings.bioTr}
            onChange={(e) => set('bioTr', e.target.value)}
            rows={3}
            className={inputClass}
          />
        </Field>
        <Field label="Bio (English)" error={errors.bioEn}>
          <textarea
            value={settings.bioEn}
            onChange={(e) => set('bioEn', e.target.value)}
            rows={3}
            className={inputClass}
          />
        </Field>
        <Field
          label="Profiles (sameAs), one https URL per line"
          error={Object.entries(errors).find(([k]) => k.startsWith('sameAs'))?.[1]}
        >
          <textarea
            value={sameAs}
            onChange={(e) => setSameAs(e.target.value)}
            rows={4}
            className={inputClass}
            placeholder="https://github.com/…"
          />
        </Field>
        <Field label="Topics (knowsAbout), one per line">
          <textarea
            value={knowsAbout}
            onChange={(e) => setKnowsAbout(e.target.value)}
            rows={4}
            className={inputClass}
          />
        </Field>
      </section>

      <div className="flex flex-col gap-6">
        <section className={section}>
          <h2 className="font-semibold">Comments</h2>
          <Toggle
            label="Comments enabled site-wide"
            checked={settings.commentsEnabled}
            onChange={(v) => set('commentsEnabled', v)}
          />
          <Field
            label="Close comments after (days)"
            hint="Empty = never."
            error={errors.commentsAutoCloseDays}
          >
            <input
              type="number"
              min={1}
              value={settings.commentsAutoCloseDays ?? ''}
              onChange={(e) =>
                set('commentsAutoCloseDays', e.target.value ? Number(e.target.value) : null)
              }
              className={inputClass}
            />
          </Field>
          <Field
            label={`reCAPTCHA threshold · ${settings.recaptchaThreshold.toFixed(1)}`}
            hint="Below this score a comment goes straight to Spam."
          >
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={settings.recaptchaThreshold}
              onChange={(e) => set('recaptchaThreshold', Number(e.target.value))}
              className="accent-[#35403a]"
            />
          </Field>
        </section>

        <section className={section}>
          <h2 className="font-semibold">AI crawlers</h2>
          <p className="-mt-3 text-xs text-fern">
            All are allowed by default (GEO). Tick a crawler to block it in robots.txt.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {crawlers.map((crawler) => (
              <Toggle
                key={crawler}
                label={crawler}
                checked={settings.blockedCrawlers.includes(crawler)}
                onChange={(blocked) =>
                  set(
                    'blockedCrawlers',
                    blocked
                      ? [...settings.blockedCrawlers, crawler]
                      : settings.blockedCrawlers.filter((c) => c !== crawler)
                  )
                }
              />
            ))}
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn" disabled={pending}>
            {pending ? 'Saving…' : 'Save settings'}
          </button>
          {message && (
            <p className={`text-sm ${message.ok ? 'text-[#2f5130]' : 'text-[#a65151]'}`}>
              {message.text}
            </p>
          )}
        </div>
      </div>
    </form>
  )
}
