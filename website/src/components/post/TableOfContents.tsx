'use client'

import { useEffect, useState } from 'react'
import type { TocItem } from '@/lib/types'

/** Trail-styled table of contents; the active heading is tracked while reading. */
export function TableOfContents({ items, title }: { items: TocItem[]; title: string }) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null)

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null)
    if (!headings.length) return
    let frame = 0
    const update = () => {
      frame = 0
      const line = window.innerHeight * 0.3
      let current = headings[0]!.id
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= line) current = heading.id
        else break
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [items])

  if (!items.length) return null

  return (
    <nav aria-label={title} className="text-sm">
      <p className="mb-3 text-[0.7rem] font-semibold tracking-[0.14em] text-fern uppercase">
        {title}
      </p>
      <ol className="border-l-2 border-dashed border-sage pl-4">
        {items.map((item) => (
          <li
            key={item.id}
            className={`relative py-1 ${item.depth === 3 ? 'pl-3 text-[0.8rem]' : ''}`}
          >
            <span
              className={`absolute top-[0.7rem] -left-[1.3rem] size-2.5 rounded-full border-2 ${
                active === item.id ? 'border-moss bg-moss' : 'border-sage bg-paper'
              }`}
              aria-hidden="true"
            />
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? 'location' : undefined}
              className={active === item.id ? 'font-semibold text-ink' : 'text-fern hover:text-ink'}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
