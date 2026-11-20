import 'server-only'
import { requireAdmin } from '../../auth/admin'
import { getDataSource } from '../source'
import type { AdminRepository } from './repository'

/** The only way into admin data; it refuses (redirects to sign-in) without an admin session. */
export async function adminRepository(): Promise<AdminRepository> {
  await requireAdmin()
  if (getDataSource() === 'fixtures') {
    return (await import('./fixture-repository')).fixtureRepository
  }
  return (await import('./amplify-repository')).amplifyRepository
}

export type { AdminRepository, PostWrite } from './repository'
