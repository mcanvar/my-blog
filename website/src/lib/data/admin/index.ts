import 'server-only'
import { getDataSource } from '../source'
import type { AdminRepository } from './repository'

export async function adminRepository(): Promise<AdminRepository> {
  if (getDataSource() === 'fixtures') {
    return (await import('./fixture-repository')).fixtureRepository
  }
  return (await import('./amplify-repository')).amplifyRepository
}

export type { AdminRepository, PostWrite } from './repository'
