'use client'

import { useEffect, useRef } from 'react'

/** Thin reading-progress line pinned to the top of the viewport. */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const target = document.getElementById(targetId)
    const bar = barRef.current
    if (!target || !bar) return
    let frame = 0
    const update = () => {
      frame = 0
      const rect = target.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1
      bar.style.transform = `scaleX(${progress})`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [targetId])

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[3px] bg-stone/60 md:left-rail"
      aria-hidden="true"
    >
      <div ref={barRef} className="h-full origin-left scale-x-0 bg-moss" />
    </div>
  )
}
