'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import { Link, usePathname } from '@/i18n/navigation'
import type { AppPathname } from '@/i18n/routing'
import { ArchiveIcon, HomeIcon, SearchIcon, TagIcon, UserIcon } from '../icons'
import { LanguageSwitch } from './LanguageSwitch'
import { ThemeToggle } from './ThemeToggle'

export function openSearch() {
  window.dispatchEvent(new CustomEvent('blog:open-search'))
}

interface NavItem {
  href: '/' | '/archive' | '/about'
  hash?: string
  label: 'home' | 'archive' | 'tags' | 'about'
  icon: ReactNode
  match: (path: AppPathname | string) => boolean
}

const items: NavItem[] = [
  {
    href: '/',
    label: 'home',
    icon: <HomeIcon />,
    match: (p) => p === '/' || p === '/page/[page]',
  },
  { href: '/archive', label: 'archive', icon: <ArchiveIcon />, match: (p) => p === '/archive' },
  {
    href: '/archive',
    hash: 'tags',
    label: 'tags',
    icon: <TagIcon />,
    match: (p) => p === '/tag/[tag]',
  },
  { href: '/about', label: 'about', icon: <UserIcon />, match: (p) => p === '/about' },
]

const railButton =
  'grid size-11 place-items-center rounded-xl text-sage transition hover:bg-black/15 hover:text-nature-lighter aria-[current=page]:bg-nature-darker aria-[current=page]:text-white'

export function Rail({ avatarUrl }: { avatarUrl: string }) {
  const t = useTranslations('Nav')
  const pathname = usePathname()

  return (
    <nav
      aria-label={t('main')}
      className="fixed inset-y-0 left-0 z-30 hidden w-rail flex-col items-center gap-2 bg-nature-dark py-4 md:flex"
    >
      <Link
        href="/"
        className="mb-3 block rounded-full ring-2 ring-nature-medium"
        aria-label={t('home')}
      >
        <Image
          src={avatarUrl}
          alt={t('avatarAlt')}
          width={40}
          height={40}
          className="size-10 rounded-full"
          priority
        />
      </Link>
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.hash ? { pathname: item.href, hash: item.hash } : item.href}
          className={railButton}
          aria-label={t(item.label)}
          title={t(item.label)}
          aria-current={item.match(pathname) ? 'page' : undefined}
        >
          {item.icon}
        </Link>
      ))}
      <button
        type="button"
        onClick={openSearch}
        className={railButton}
        aria-label={t('search')}
        title={`${t('search')} (⌘K)`}
      >
        <SearchIcon />
      </button>
      <div className="flex-1" />
      <ThemeToggle className={railButton} />
      <LanguageSwitch className="mt-2 self-start rounded-r-xl bg-nature-darker px-3 py-1.5 text-sm font-bold text-sage transition hover:bg-nature-light hover:text-nature-dark" />
    </nav>
  )
}

const barButton =
  'grid size-11 place-items-center rounded-xl text-sage aria-[current=page]:text-white'

export function BottomNav() {
  const t = useTranslations('Nav')
  const pathname = usePathname()

  return (
    <nav
      aria-label={t('main')}
      className="fixed inset-x-0 bottom-0 z-30 flex h-bottom-nav items-center justify-around bg-nature-dark pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <Link
        href="/"
        className={barButton}
        aria-label={t('home')}
        aria-current={pathname === '/' ? 'page' : undefined}
      >
        <HomeIcon />
      </Link>
      <Link
        href="/archive"
        className={barButton}
        aria-label={t('archive')}
        aria-current={pathname === '/archive' ? 'page' : undefined}
      >
        <ArchiveIcon />
      </Link>
      <button type="button" onClick={openSearch} className={barButton} aria-label={t('search')}>
        <SearchIcon />
      </button>
      <Link
        href="/about"
        className={barButton}
        aria-label={t('about')}
        aria-current={pathname === '/about' ? 'page' : undefined}
      >
        <UserIcon />
      </Link>
      <ThemeToggle className={barButton} />
      <LanguageSwitch className="grid size-11 place-items-center text-sm font-bold text-sage" />
    </nav>
  )
}
