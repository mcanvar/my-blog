import 'server-only'
import { createServerRunner } from '@aws-amplify/adapter-nextjs'
import {
  generateServerClientUsingCookies,
  generateServerClientUsingReqRes,
} from '@aws-amplify/adapter-nextjs/api'
import { cookies } from 'next/headers'
import type { Schema } from '@/amplify/data/resource'
import { amplifyOutputs } from './outputs'

export const { runWithAmplifyServerContext } = createServerRunner({ config: amplifyOutputs })

/**
 * Guest client for public pages. Used with `nextServerContext: null`, so it never
 * reads cookies and pages stay statically generated.
 */
export const publicClient = generateServerClientUsingReqRes<Schema>({
  config: amplifyOutputs,
  authMode: 'identityPool',
})

/** Signed-in admin client for Server Components and Server Actions (dynamic). */
export function adminClient() {
  return generateServerClientUsingCookies<Schema>({
    config: amplifyOutputs,
    cookies,
    authMode: 'userPool',
  })
}
