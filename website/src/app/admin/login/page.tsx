import type { Metadata } from 'next'
import Link from 'next/link'
import { LogoMark } from '@/components/icons'
import { isServerAuthConfigured } from '@/lib/amplify/runner'
import { getDataSource, isFixtureAdminAllowed } from '@/lib/data/source'

export const metadata: Metadata = { title: 'Sign in' }

export default async function LoginPage({ searchParams }: PageProps<'/admin/login'>) {
  const { error_description: errorDescription } = await searchParams
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
        <div className="rounded-2xl bg-surface p-6">
          {fixtures ? (
            <>
              <p className="font-semibold">Fixtures mode</p>
              <p className="mt-1 text-sm text-fern">
                {isFixtureAdminAllowed()
                  ? 'No backend is configured, so sign-in is skipped in local development.'
                  : 'Admin is unavailable in a fixtures production build.'}
              </p>
              {isFixtureAdminAllowed() && (
                <Link href="/admin" className="btn mt-4">
                  Open admin
                </Link>
              )}
            </>
          ) : isServerAuthConfigured() ? (
            <>
              <p className="font-semibold">Sign in</p>
              <p className="mt-1 text-sm text-fern">
                You continue on the Cognito sign-in page (password and authenticator code), then
                come back here.
              </p>
              {typeof errorDescription === 'string' && (
                <p role="alert" className="mt-3 text-sm text-[#a65151]">
                  {errorDescription}
                </p>
              )}
              {/* Plain links on purpose: next/link would prefetch these redirecting auth routes. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/api/auth/sign-in" className="btn mt-4">
                Sign in
              </a>
              <p className="mt-4 text-xs text-fern">
                Signed in with an account that is not an admin?{' '}
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a href="/api/auth/sign-out" className="underline">
                  Sign out
                </a>
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold">Sign-in is not configured</p>
              <p className="mt-1 text-sm text-fern">
                Set AMPLIFY_APP_ORIGIN for this branch in Amplify Hosting and redeploy.
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
