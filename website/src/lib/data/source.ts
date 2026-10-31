import { hasBackend } from '../amplify/outputs'

export type DataSource = 'amplify' | 'fixtures'

/**
 * `fixtures` serves in-memory sample data so the site and admin can run with no AWS
 * account. It is only allowed when explicitly requested or in local development.
 */
export function getDataSource(): DataSource {
  if (process.env.BLOG_DATA_SOURCE === 'fixtures') return 'fixtures'
  if (hasBackend) return 'amplify'
  if (process.env.NODE_ENV !== 'production') return 'fixtures'
  throw new Error(
    'No Amplify backend found in amplify_outputs.json. Run `npx ampx sandbox`, or set BLOG_DATA_SOURCE=fixtures for a local build.'
  )
}

/** The admin auth bypass for fixtures exists only in `next dev`, never in a production build. */
export function isFixtureAdminAllowed(): boolean {
  return getDataSource() === 'fixtures' && process.env.NODE_ENV === 'development'
}
