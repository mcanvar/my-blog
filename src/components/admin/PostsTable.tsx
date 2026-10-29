'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { createTranslationAction } from '@/app/admin/actions/posts'
import type { PostRow } from '@/lib/admin/post-rows'
import { formatDateTime } from '@/lib/format'
import { fold } from '@/lib/search'
import { EmptyState, ScoreBar, StatusBadge, Tile } from './ui'

const STATUS_FILTERS = ['ALL', 'PUBLISHED', 'DRAFT', 'SCHEDULED', 'ARCHIVED', 'REVIEW'] as const

export function PostsTable({ rows }: { rows: PostRow[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [locale, setLocale] = useState<'all' | 'tr' | 'en'>('all')
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>('ALL')
  const [pending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const q = fold(query.trim())
    return rows.filter((row) => {
      if (locale !== 'all' && row.locale !== locale) return false
      if (status === 'REVIEW' && !row.needsReview) return false
      if (status !== 'ALL' && status !== 'REVIEW' && row.status !== status) return false
      if (!q) return true
      return fold(`${row.title} ${row.slug} ${row.tags.join(' ')}`).includes(q)
    })
  }, [rows, query, locale, status])

  function createTranslation(id: string) {
    startTransition(async () => {
      const result = await createTranslationAction(id)
      if (result.ok) router.push(`/admin/posts/${result.id}`)
      else alert(result.error)
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile label="Published" value={rows.filter((r) => r.status === 'PUBLISHED').length} />
        <Tile label="Drafts" value={rows.filter((r) => r.status === 'DRAFT').length} />
        <Tile label="Scheduled" value={rows.filter((r) => r.status === 'SCHEDULED').length} />
        <Tile
          label="Migrated · needs review"
          value={rows.filter((r) => r.needsReview).length}
          tone="warn"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, slug, tag"
          className="field max-w-xs bg-white"
          aria-label="Search posts"
        />
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as typeof locale)}
          className="field w-auto bg-white"
          aria-label="Language"
        >
          <option value="all">All languages</option>
          <option value="tr">Türkçe</option>
          <option value="en">English</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="field w-auto bg-white"
          aria-label="Status"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s === 'ALL'
                ? 'All statuses'
                : s === 'REVIEW'
                  ? 'Needs review'
                  : s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        <span className="ml-auto text-xs text-fern">{filtered.length} posts</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState>No posts match these filters.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#e4e3dd] bg-white">
          <table className="w-full min-w-[44rem] text-sm">
            <thead>
              <tr className="bg-[#efeee9] text-left text-[0.68rem] tracking-wider text-fern uppercase">
                <th className="px-4 py-2.5 font-semibold">Title</th>
                <th className="px-4 py-2.5 font-semibold">Lang</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
                <th className="px-4 py-2.5 font-semibold">SEO / GEO</th>
                <th className="px-4 py-2.5 font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeede8]">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-[#faf9f6]">
                  <td className="max-w-[24rem] px-4 py-3">
                    <Link
                      href={`/admin/posts/${row.id}`}
                      className="block truncate font-semibold hover:underline"
                    >
                      {row.title}
                    </Link>
                    <span className="block truncate text-xs text-sage">
                      {row.locale === 'en' ? '/en' : ''}/{row.slug}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex gap-1">
                      {row.translations.map((t) =>
                        t.id ? (
                          <Link
                            key={t.locale}
                            href={`/admin/posts/${t.id}`}
                            className="rounded bg-nature-dark px-1.5 text-[0.65rem] font-bold text-white"
                            title={`Open ${t.locale.toUpperCase()} version`}
                          >
                            {t.locale.toUpperCase()}
                          </Link>
                        ) : (
                          <button
                            key={t.locale}
                            type="button"
                            disabled={pending}
                            onClick={() => createTranslation(row.id)}
                            className="rounded border border-dashed border-sage px-1.5 text-[0.65rem] font-bold text-sage hover:border-nature-dark hover:text-nature-dark"
                            title={`Create ${t.locale.toUpperCase()} translation`}
                          >
                            {t.locale.toUpperCase()}+
                          </button>
                        )
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex flex-wrap gap-1">
                      <StatusBadge status={row.status} />
                      {row.needsReview && <StatusBadge status="REVIEW" />}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ScoreBar score={row.score} />
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap text-fern">
                    {formatDateTime(row.updatedAt, 'en')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
