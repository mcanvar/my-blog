import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const draft = await draftMode()
  draft.disable()
  const target = request.nextUrl.searchParams.get('redirect') ?? '/'
  // Only same-site paths: never an open redirect.
  redirect(target.startsWith('/') && !target.startsWith('//') ? target : '/')
}
