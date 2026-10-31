'use client'

import { SearchIcon } from '../icons'
import { openSearch } from '../site/Navigation'

export function SearchButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={openSearch}
      className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-fern transition hover:border-sage max-md:hidden"
    >
      <SearchIcon size={16} />
      <span>{label}</span>
      <kbd className="kbd">⌘K</kbd>
    </button>
  )
}
