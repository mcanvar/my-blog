import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { getDataSource, isFixtureAdminAllowed } from '../data/source'

export const ADMIN_GROUP = 'ADMINS'

export interface AdminSession {
  sub: string
  email: string
}

/**
 * Reads the Cognito session from the HttpOnly cookies (signatures verified by the adapter) and
 * checks ADMINS membership. Once per request: pages, layouts and the data layer all ask.
 */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  if (isFixtureAdminAllowed()) return { sub: 'fixture-admin', email: 'dev@localhost' }
  if (getDataSource() !== 'amplify') return null

  const [{ runWithAmplifyServerContext }, { fetchAuthSession }] = await Promise.all([
    import('../amplify/server'),
    import('aws-amplify/auth/server'),
  ])

  return runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec)
        const payload = session.tokens?.idToken?.payload
        const groups = payload?.['cognito:groups']
        if (!payload || !Array.isArray(groups) || !groups.includes(ADMIN_GROUP)) return null
        return { sub: String(payload.sub), email: String(payload.email ?? '') }
      } catch {
        return null
      }
    },
  })
})

/**
 * Admin pages and Server Actions call this, and so does `adminRepository()`, so data access is
 * gated even where a caller forgets. AppSync enforces the same rule with the user's own token.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  return session
}
