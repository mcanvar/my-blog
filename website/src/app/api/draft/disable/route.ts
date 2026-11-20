import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { safeRedirectPath } from '@/lib/safe-redirect'

export async function GET(request: NextRequest) {
  const draft = await draftMode()
  draft.disable()
  redirect(safeRedirectPath(request.nextUrl.searchParams.get('redirect')))
}
