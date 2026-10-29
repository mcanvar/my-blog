import type { Metadata } from 'next'
import { LogoMark } from '@/components/icons'
import { LoginPanel } from '@/components/admin/LoginPanel'
import { getDataSource, isFixtureAdminAllowed } from '@/lib/data/source'

export const metadata: Metadata = { title: 'Sign in' }

export default async function LoginPage({ searchParams }: PageProps<'/admin/login'>) {
  const { next } = await searchParams
  const target = typeof next === 'string' && next.startsWith('/admin') ? next : '/admin'
  const fixtures = getDataSource() === 'fixtures'

  return (
    <main className="grid min-h-dvh place-items-center bg-nature-darker p-6">
      <div className="contour pointer-events-none fixed inset-0" aria-hidden="true" />
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex items-center gap-3 text-nature-lighter">
          <LogoMark size={36} />
          <div>
            <p className="condensed text-xl font-bold text-white">mcanvar.dev</p>
            <p className="text-sm">Admin</p>
          </div>
        </div>
        {fixtures ? (
          <div className="rounded-2xl bg-surface p-6">
            <p className="font-semibold">Fixtures mode</p>
            <p className="mt-1 text-sm text-fern">
              {isFixtureAdminAllowed()
                ? 'No backend is configured, so sign-in is skipped in local development.'
                : 'Admin is unavailable in a fixtures production build.'}
            </p>
            {isFixtureAdminAllowed() && (
              <a href={target} className="btn mt-4">
                Open admin
              </a>
            )}
          </div>
        ) : (
          <LoginPanel target={target} />
        )}
      </div>
    </main>
  )
}
