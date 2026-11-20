import type { ReactNode } from 'react'
import { AdminShell } from '@/components/admin/AdminShell'
import { isServerAuthConfigured } from '@/lib/amplify/runner'
import { requireAdmin } from '@/lib/auth/admin'
import { adminRepository } from '@/lib/data/admin'

export const dynamic = 'force-dynamic'

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin()
  const pending = await (await adminRepository()).countComments('PENDING')

  return (
    <AdminShell
      email={session.email}
      pendingComments={pending}
      signOutHref={isServerAuthConfigured() ? '/api/auth/sign-out' : '/admin/login'}
    >
      {children}
    </AdminShell>
  )
}
