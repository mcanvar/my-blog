'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { ChatIcon, DocIcon, ExternalIcon, GearIcon, GridIcon, ImageIcon, LogoMark } from '../icons'
import { hasAmplifyBackend } from './AmplifyClient'

const nav = [
  { href: '/admin', label: 'Dashboard', icon: GridIcon, exact: true },
  { href: '/admin/posts', label: 'Posts', icon: DocIcon },
  { href: '/admin/comments', label: 'Comments', icon: ChatIcon, badge: true },
  { href: '/admin/media', label: 'Media', icon: ImageIcon },
  { href: '/admin/settings', label: 'Settings', icon: GearIcon },
]

export function AdminShell({
  email,
  pendingComments,
  children,
}: {
  email: string
  pendingComments: number
  children: ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  async function onSignOut() {
    if (hasAmplifyBackend) {
      const { signOut } = await import('aws-amplify/auth')
      await signOut()
    }
    router.replace('/admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[13.5rem_1fr]">
      <aside className="flex flex-col gap-1 bg-nature-darker p-4 text-nature-light md:sticky md:top-0 md:h-dvh">
        <Link href="/admin" className="mb-5 flex items-center gap-2.5">
          <LogoMark size={30} />
          <span>
            <span className="block text-sm font-bold text-white">mcanvar</span>
            <span className="block text-[0.65rem]">admin · us-east-1</span>
          </span>
        </Link>
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto md:flex-col">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition hover:bg-white/5 aria-[current=page]:bg-nature-dark aria-[current=page]:text-white"
              >
                <Icon size={18} />
                {item.label}
                {item.badge && pendingComments > 0 && (
                  <span className="ml-auto rounded-full bg-amber-300 px-1.5 text-[0.65rem] font-bold text-nature-darker">
                    {pendingComments}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto hidden flex-col gap-2 border-t border-white/10 pt-4 text-xs md:flex">
          <a
            href="/"
            target="_blank"
            rel="noopener"
            className="flex items-center gap-1.5 hover:text-white"
          >
            View site <ExternalIcon size={12} />
          </a>
          <span className="truncate" title={email}>
            {email}
          </span>
          <span>ADMINS · MFA</span>
          <button
            type="button"
            onClick={onSignOut}
            className="self-start underline hover:text-white"
          >
            Sign out
          </button>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
