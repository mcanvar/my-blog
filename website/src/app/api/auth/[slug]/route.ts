import type { NextRequest } from 'next/server'
import { createAuthRouteHandlers, isServerAuthConfigured } from '@/lib/amplify/runner'

/**
 * /api/auth/sign-in, sign-in-callback, sign-out and sign-out-callback (Amplify server-side auth).
 * Sign-up does not exist: admins are created by hand.
 */
let handler: ReturnType<typeof createAuthRouteHandlers> | null = null

export async function GET(request: NextRequest, context: RouteContext<'/api/auth/[slug]'>) {
  const { slug } = await context.params
  if (!isServerAuthConfigured() || slug === 'sign-up') {
    return new Response('Not found', { status: 404 })
  }
  // Created on first use: the adapter checks the OAuth outputs and AMPLIFY_APP_ORIGIN here, which
  // a fixtures build does not have.
  handler ??= createAuthRouteHandlers({
    redirectOnSignInComplete: '/admin',
    redirectOnSignOutComplete: '/admin/login',
  })
  const response = await handler(request, context)
  return response ?? new Response(null, { status: 500 })
}
