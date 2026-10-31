import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AmplifyClient } from '@/components/admin/AmplifyClient'
import { fontVariables } from '../fonts'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Admin' },
  robots: { index: false, follow: false, nocache: true },
}

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVariables} data-theme="light">
      <body className="min-h-dvh bg-[#f5f4f0] text-ink">
        <AmplifyClient />
        {children}
      </body>
    </html>
  )
}
