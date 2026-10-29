'use client'

import { useTranslations } from 'next-intl'
import { MoonIcon, SunIcon } from '../icons'

/** The initial theme is set before paint by the inline script in the layout. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}})()`

export function ThemeToggle({ className = '' }: { className?: string }) {
  const t = useTranslations('Nav')

  function toggle() {
    const root = document.documentElement
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark'
    root.dataset.theme = next
    try {
      localStorage.setItem('theme', next)
    } catch {
      // storage can be blocked; the toggle still works for this page view
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={className}
      aria-label={t('theme')}
      title={t('theme')}
    >
      <MoonIcon className="dark:hidden" />
      <SunIcon className="hidden dark:block" />
    </button>
  )
}
