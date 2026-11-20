#!/usr/bin/env node
/**
 * Authorization regression check against a deployed backend (run by `npm run verify:cloud`):
 * visitors' guest credentials (identity pool, unauthenticated) may only reach the public queries.
 *
 *   node scripts/check-guest-access.mjs [path/to/amplify_outputs.json]
 *
 * Every probe is harmless even if authorization were broken: reads, and writes aimed at an id
 * that does not exist.
 */
import { readFileSync } from 'node:fs'
import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'

const file = process.argv[2] ?? 'amplify_outputs.json'
Amplify.configure(JSON.parse(readFileSync(file, 'utf8')))
const client = generateClient({ authMode: 'identityPool' })

const MISSING = 'guest-access-check-does-not-exist'

const mustDeny = {
  'Query.listPosts': 'query { listPosts { items { id } } }',
  'Query.getPost': `query { getPost(id: "${MISSING}") { id } }`,
  'Query.listComments': 'query { listComments { items { id } } }',
  'Query.listPostRevisions': 'query { listPostRevisions { items { id } } }',
  'Query.listSiteSettings': 'query { listSiteSettings { items { id } } }',
  'Mutation.updatePost': `mutation { updatePost(input: { id: "${MISSING}", title: "x" }) { id } }`,
  'Mutation.deleteComment': `mutation { deleteComment(input: { id: "${MISSING}" }) { id } }`,
  'Mutation.updateSiteSettings': `mutation { updateSiteSettings(input: { id: "${MISSING}", commentsEnabled: true }) { id } }`,
}

const mustAllow = {
  'Query.listPublishedPosts':
    'query { listPublishedPosts(locale: "tr", limit: 1) { items { id } } }',
  'Query.getSiteSettings (public fields)':
    'query { getSiteSettings(id: "site") { id authorName } }',
}

async function run(query) {
  try {
    const result = await client.graphql({ query })
    return { data: result.data, errors: result.errors ?? [] }
  } catch (error) {
    return { data: error?.data, errors: error?.errors ?? [{ message: String(error) }] }
  }
}

const isDenied = (errors) =>
  errors.some((e) =>
    /unauthori[sz]ed|not authori[sz]ed/i.test(`${e.errorType ?? ''} ${e.message ?? ''}`)
  )

let failures = 0
const report = (ok, label, detail = '') => {
  if (!ok) failures++
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`)
}

for (const [label, query] of Object.entries(mustDeny)) {
  const { errors } = await run(query)
  report(isDenied(errors), `guest denied ${label}`, isDenied(errors) ? '' : 'NOT DENIED')
}

// Field-level rule: only observable when the settings item exists.
const threshold = await run('query { getSiteSettings(id: "site") { id recaptchaThreshold } }')
if (threshold.data?.getSiteSettings === null && !threshold.errors.length) {
  console.log('- SiteSettings.recaptchaThreshold: skipped (no settings saved yet)')
} else {
  report(isDenied(threshold.errors), 'guest denied SiteSettings.recaptchaThreshold')
}

for (const [label, query] of Object.entries(mustAllow)) {
  const { errors } = await run(query)
  report(errors.length === 0, `guest allowed ${label}`, errors[0]?.message ?? '')
}

if (failures) {
  console.error(`\n${failures} authorization check(s) failed.`)
  process.exit(1)
}
console.log('\nGuest access is limited to the public API.')
