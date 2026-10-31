'use client'

import { useTranslations } from 'next-intl'
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildChapters, isTallSlot, PAGE_SIZE, type TrailItem, type YearMarker } from '@/lib/trail'
import { ArrowLeftIcon, ArrowRightIcon } from '../icons'
import { PostCard, SkeletonColumn } from './PostCard'

interface TrailTrackProps {
  locale: 'tr' | 'en'
  initialItems: TrailItem[]
  startPage: number
  totalPages: number
  total: number
  years: YearMarker[]
  homeHref: string
  pageHrefPrefix: string
  mediaBaseUrl?: string
  /** Tag trails show everything at once and skip URL syncing. */
  paginate?: boolean
}

export function TrailTrack({
  locale,
  initialItems,
  startPage,
  totalPages,
  total,
  years,
  homeHref,
  pageHrefPrefix,
  mediaBaseUrl,
  paginate = true,
}: TrailTrackProps) {
  const t = useTranslations('Trail')
  const trackRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [items, setItems] = useState(initialItems)
  const [nextPage, setNextPage] = useState(startPage + 1)
  const [loading, setLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState((startPage - 1) * PAGE_SIZE)
  const loadingRef = useRef(false)
  const lastPageRef = useRef(startPage)

  const offset = (startPage - 1) * PAGE_SIZE
  const hasMore = paginate && nextPage <= totalPages
  const chapters = useMemo(() => buildChapters(items, offset), [items, offset])
  const yearCounts = useMemo(() => new Map(years.map((y) => [y.year, y.count])), [years])

  const pageHref = useCallback(
    (page: number) => (page <= 1 ? homeHref : `${pageHrefPrefix}${page}`),
    [homeHref, pageHrefPrefix]
  )

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return false
    loadingRef.current = true
    setLoading(true)
    try {
      const response = await fetch(`/api/trail?locale=${locale}&page=${nextPage}`)
      if (!response.ok) return false
      const data = (await response.json()) as { items: TrailItem[] }
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id))
        return [...prev, ...data.items.filter((p) => !seen.has(p.id))]
      })
      setNextPage((p) => p + 1)
      return true
    } catch {
      return false
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [hasMore, locale, nextPage])

  // Infinite loading when the right edge comes close.
  useEffect(() => {
    const track = trackRef.current
    const sentinel = sentinelRef.current
    if (!track || !sentinel || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) void loadMore()
      },
      { root: track, rootMargin: '0px 900px 0px 0px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  // Track position → current stop, hiker, and the crawlable page URL.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let frame = 0
    const update = () => {
      frame = 0
      const cards = track.querySelectorAll<HTMLElement>('[data-index]')
      const edge = track.scrollLeft + 8
      let index = Number(cards[0]?.dataset.index ?? offset)
      for (const card of cards) {
        if (card.offsetLeft + card.offsetWidth > edge) {
          index = Number(card.dataset.index)
          break
        }
      }
      setCurrentIndex(index)
      if (paginate) {
        const page = Math.floor(index / PAGE_SIZE) + 1
        if (page !== lastPageRef.current) {
          lastPageRef.current = page
          window.history.replaceState(window.history.state, '', pageHref(page))
        }
      }
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      track.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [offset, pageHref, paginate])

  // Vertical wheel scrolls the track sideways, but only while it can still move.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      const max = track.scrollWidth - track.clientWidth
      const canMove =
        (event.deltaY > 0 && track.scrollLeft < max - 1) ||
        (event.deltaY < 0 && track.scrollLeft > 0)
      if (!canMove) return
      event.preventDefault()
      track.scrollLeft += event.deltaY
    }
    track.addEventListener('wheel', onWheel, { passive: false })
    return () => track.removeEventListener('wheel', onWheel)
  }, [])

  const scrollByStep = (direction: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' })
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const track = trackRef.current
    if (!track || event.target !== track) return
    if (event.key === 'ArrowRight' || event.key === 'PageDown') {
      event.preventDefault()
      scrollByStep(1)
    } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
      event.preventDefault()
      scrollByStep(-1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      track.scrollTo({ left: 0, behavior: 'smooth' })
    } else if (event.key === 'End') {
      event.preventDefault()
      track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' })
    }
  }

  const jumpToYear = async (marker: YearMarker) => {
    const track = trackRef.current
    if (!track) return
    const find = () => track.querySelector<HTMLElement>(`[data-index="${marker.firstIndex}"]`)
    let target = find()
    let guard = 0
    while (!target && guard < totalPages) {
      guard += 1
      const loaded = await loadMore()
      if (!loaded) break
      await new Promise((resolve) => requestAnimationFrame(resolve))
      target = find()
    }
    const stone = track.querySelector<HTMLElement>(`[data-year-stone="${marker.year}"]`)
    const element = stone ?? target
    if (element) track.scrollTo({ left: element.offsetLeft - 16, behavior: 'smooth' })
  }

  const progress = total > 1 ? Math.min(1, Math.max(0, currentIndex / (total - 1))) : 0

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div
        ref={trackRef}
        role="feed"
        aria-label={t('label')}
        aria-busy={loading}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="trail-track flex h-[68dvh] min-h-[22rem] gap-3 overflow-x-auto px-4 pt-1 pb-4 md:h-auto md:min-h-0 md:flex-1 md:gap-4 md:px-6"
      >
        {startPage > 1 && paginate && (
          <a
            href={pageHref(startPage - 1)}
            className="btn-outline shrink-0 self-center whitespace-nowrap"
          >
            <ArrowLeftIcon size={16} /> {t('previous')}
          </a>
        )}
        {chapters.map((chapter) => (
          <Fragment key={chapter.key}>
            {chapter.startsYear && (
              <div className="year-stone" data-year-stone={chapter.year}>
                <b>{chapter.year}</b>
                <small>
                  {t('yearPosts', { count: yearCounts.get(chapter.year) ?? chapter.items.length })}
                </small>
              </div>
            )}
            <div className="chapter" data-count={chapter.items.length}>
              {chapter.items.map(({ item, index }, position) => (
                <PostCard
                  key={item.id}
                  item={item}
                  index={index}
                  setSize={total}
                  tone={(position % 5) + 1}
                  tall={isTallSlot(chapter.items.length, position)}
                  minutesLabel={t('minutes', { minutes: item.readingMinutes })}
                  mediaBaseUrl={mediaBaseUrl}
                  priority={index < 2}
                />
              ))}
            </div>
          </Fragment>
        ))}
        <div ref={sentinelRef} className="flex shrink-0 items-center gap-3 pr-4">
          {hasMore ? (
            <>
              {loading && <SkeletonColumn />}
              <a href={pageHref(nextPage)} className="btn-outline whitespace-nowrap">
                {t('olderPosts')} <ArrowRightIcon size={16} />
              </a>
            </>
          ) : (
            <p className="max-w-[10rem] text-sm text-fern">{t('end')}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 pb-2 md:px-6">
        <button
          type="button"
          onClick={() => scrollByStep(-1)}
          className="btn-outline size-9 rounded-full p-0 max-md:hidden"
          aria-label={t('previous')}
        >
          <ArrowLeftIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => scrollByStep(1)}
          className="btn-outline size-9 rounded-full p-0 max-md:hidden"
          aria-label={t('next')}
        >
          <ArrowRightIcon size={16} />
        </button>
        <div className="relative mx-2 h-10 flex-1" role="group" aria-label={t('scrubber')}>
          <svg
            viewBox="0 0 600 40"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full"
            aria-hidden="true"
          >
            <path
              d="M0 22 C50 8 90 34 150 20 S250 6 300 22 S400 36 450 18 S560 10 600 22"
              fill="none"
              stroke="var(--sage)"
              strokeWidth="2"
              strokeDasharray="4 5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {total > 1 &&
            years.map((marker) => (
              <button
                key={marker.year}
                type="button"
                onClick={() => void jumpToYear(marker)}
                className="absolute bottom-0 -translate-x-1/2 rounded px-1 text-[0.65rem] text-fern hover:text-ink max-md:hidden"
                style={{ left: `${(marker.firstIndex / (total - 1)) * 100}%` }}
                aria-label={t('jumpToYear', { year: marker.year })}
              >
                {marker.year}
              </button>
            ))}
          <span
            className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-moss shadow-[0_0_0_5px_color-mix(in_oklab,var(--moss)_22%,transparent)] transition-[left] duration-200"
            style={{ left: `${progress * 100}%` }}
            aria-hidden="true"
          />
        </div>
        <p className="shrink-0 text-xs text-fern tabular-nums" aria-live="polite">
          {t('stop', { current: Math.min(currentIndex + 1, total), total })}
        </p>
      </div>
    </div>
  )
}
