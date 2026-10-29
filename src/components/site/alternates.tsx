'use client'

import { useEffect, useSyncExternalStore } from 'react'
import type { Locale } from '@/lib/types'

export type AlternateLinks = Partial<Record<Locale, string>>

let current: AlternateLinks | null = null
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Pages register where the language switch should go (e.g. the translated post). */
export function RegisterAlternates({ links }: { links: AlternateLinks }) {
  const serialized = JSON.stringify(links)
  useEffect(() => {
    current = JSON.parse(serialized) as AlternateLinks
    emit()
    return () => {
      current = null
      emit()
    }
  }, [serialized])
  return null
}

export function useAlternates(): AlternateLinks | null {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null
  )
}
