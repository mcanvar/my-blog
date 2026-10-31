'use client'

import { Amplify } from 'aws-amplify'
import outputs from '@/amplify_outputs.json'

const configured = outputs as { auth?: unknown; data?: unknown }

// Tokens live in cookies (ssr: true) so Server Components and Server Actions see the session.
if (configured.auth) {
  Amplify.configure(outputs, { ssr: true })
}

export const hasAmplifyBackend = Boolean(configured.auth && configured.data)

export function AmplifyClient() {
  return null
}
