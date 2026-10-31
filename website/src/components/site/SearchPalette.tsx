'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { fold, searchPosts, type SearchIndex } from '@/lib/search'
import { SearchIcon, TagIcon } from '../icons'
import { useAlternates } from './alternates'

type Result =
  | { kind: 'post'; key: string; title: string; meta: string; href: string }
  | { kind: 'tag'; key: string; title: string; meta: string; href: string }
  | { kind: 'action'; key: string; title: string; meta: string; href: string }

export function SearchPalette() {
  const t = useTranslations('Search')
  const tTrail = useTranslations('Trail')
  const locale = useLocale()
  const router = useRouter()
  const alternates = useAlternates()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [index, setIndex] = useState<SearchIndex | null>(null)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listId = useId()

  const open = useCallback(() => {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return
    dialog.showModal()
    setQuery('')
    setActive(0)
    requestAnimationFrame(() => inputRef.current?.focus())
    if (!index) {
      fetch(`/api/search?locale=${locale}`)
        .then((r) => (r.ok ? (r.json() as Promise<SearchIndex>) : null))
        .then((data) => data && setIndex(data))
        .catch(() => undefined)
    }
  }, [index, locale])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        open()
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('blog:open-search', open)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('blog:open-search', open)
    }
  }, [open])

  const results = useMemo<Result[]>(() => {
    if (!index) return []
    const posts: Result[] = searchPosts(index.posts, query).map((p) => ({
      kind: 'post',
      key: p.path,
      title: p.title,
      meta: `${p.year} · ${p.tags.map((tag) => `#${tag}`).join(' ')} · ${tTrail('minutes', { minutes: p.minutes })}`,
      href: p.path,
    }))
    const q = fold(query.trim())
    const tags: Result[] = index.tags
      .filter((tag) => !q || fold(tag.tag).includes(q))
      .slice(0, 4)
      .map((tag) => ({
        kind: 'tag',
        key: tag.path,
        title: `#${tag.tag}`,
        meta: String(tag.count),
        href: tag.path,
      }))
    const other = locale === 'tr' ? 'en' : 'tr'
    const actions: Result[] = [
      {
        kind: 'action',
        key: 'lang',
        title: t('switchLanguage'),
        meta: '↵',
        href: alternates?.[other] ?? (other === 'en' ? '/en' : '/'),
      },
    ]
    return [...posts, ...tags, ...actions]
  }, [index, query, locale, alternates, t, tTrail])

  function go(result: Result | undefined) {
    if (!result) return
    dialogRef.current?.close()
    if (result.kind === 'action') window.location.assign(result.href)
    else router.push(result.href)
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      go(results[active])
    }
  }

  const groups: { label: string; kind: Result['kind'] }[] = [
    { label: t('posts'), kind: 'post' },
    { label: t('tags'), kind: 'tag' },
    { label: t('shortcuts'), kind: 'action' },
  ]

  return (
    <dialog
      ref={dialogRef}
      aria-label={t('open')}
      className="m-auto mt-[12vh] w-[min(36rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-nature-darker/50 backdrop:backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current?.close()
      }}
    >
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <SearchIcon className="text-fern" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
          }}
          onKeyDown={onKeyDown}
          placeholder={t('placeholder')}
          aria-controls={listId}
          aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
          role="combobox"
          aria-expanded="true"
          className="w-full bg-transparent text-base outline-none placeholder:text-sage"
        />
        <kbd className="kbd">esc</kbd>
      </div>
      <div id={listId} role="listbox" className="max-h-[60vh] overflow-y-auto py-2">
        {index && results.filter((r) => r.kind === 'post').length === 0 && query && (
          <p className="px-4 py-3 text-sm text-fern">{t('empty')}</p>
        )}
        {groups.map((group) => {
          const groupResults = results.filter((r) => r.kind === group.kind)
          if (!groupResults.length) return null
          return (
            <div key={group.kind}>
              <p className="px-4 pt-2 pb-1 text-[0.65rem] font-semibold tracking-[0.12em] text-fern uppercase">
                {group.label}
              </p>
              {groupResults.map((result) => {
                const i = results.indexOf(result)
                return (
                  <button
                    key={result.key}
                    id={`${listId}-${i}`}
                    type="button"
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(result)}
                    className="flex w-full items-start gap-3 px-4 py-2 text-left aria-selected:bg-stone/60"
                  >
                    {result.kind === 'tag' && <TagIcon size={16} className="mt-1 text-fern" />}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{result.title}</span>
                      <span className="block truncate text-xs text-fern">{result.meta}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </dialog>
  )
}
