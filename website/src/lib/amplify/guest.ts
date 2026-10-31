import 'server-only'
import { createAmplifyContext } from 'aws-amplify'
import {
  createAWSCredentialsAndIdentityIdProvider,
  createUserPoolsTokenProvider,
} from 'aws-amplify/adapter-core'
import { parseAmplifyConfig, sharedInMemoryStorage } from 'aws-amplify/utils'
import { amplifyOutputs } from './outputs'

let context: ReturnType<typeof createAmplifyContext> | null = null

/**
 * One guest (identity pool, unauthenticated) context per server process.
 *
 * `runWithAmplifyServerContext({ nextServerContext: null })` builds a new credentials provider on
 * every call, so each query fetched fresh guest credentials from Cognito and a build rendering many
 * pages in parallel hit "Rate exceeded". Reusing one provider caches the credentials until they expire.
 */
export function guestContext() {
  if (!context) {
    const config = parseAmplifyConfig(amplifyOutputs as Parameters<typeof parseAmplifyConfig>[0])
    if (!config.Auth) throw new Error('amplify_outputs.json has no auth configuration')
    context = createAmplifyContext(config, {
      Auth: {
        credentialsProvider: createAWSCredentialsAndIdentityIdProvider(
          config.Auth,
          sharedInMemoryStorage
        ),
        tokenProvider: createUserPoolsTokenProvider(config.Auth, sharedInMemoryStorage),
      },
    })
  }
  return context
}

function isThrottle(error: unknown): boolean {
  const e = error as { name?: string; message?: string } | null
  return (
    !!e &&
    (e.name === 'TooManyRequestsException' ||
      e.name === 'ThrottlingException' ||
      /rate exceeded|throttl|too many requests/i.test(e.message ?? ''))
  )
}

/** Retries throttled calls with exponential backoff and jitter (4 attempts). */
export async function withThrottleRetry<T>(operation: () => Promise<T>, attempts = 4): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await operation()
    } catch (error) {
      if (attempt >= attempts || !isThrottle(error)) throw error
      const delay = 250 * 2 ** (attempt - 1) + Math.random() * 150
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
}
