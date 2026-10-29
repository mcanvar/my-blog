import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getDataSource, isFixtureAdminAllowed } from '../data/source'

export const ADMIN_GROUP = 'ADMINS'

export interface AdminSession {
  sub: string
  email: string
}

/** Reads the Cognito session from cookies and checks ADMINS membership. */
export async function getAdminSession(): Promise<AdminSession | null> {
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
}

/** Every admin page and Server Action calls this; AppSync enforces the same rule. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  return session
}
