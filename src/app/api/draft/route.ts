import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { getAdminSession } from '@/lib/auth/admin'
import { adminRepository } from '@/lib/data/admin'
import { postPath } from '@/lib/seo/urls'

/** Admin-only: preview an unpublished post on the real page layout. */
export async function GET(request: NextRequest) {
  if (!(await getAdminSession())) return new Response('Unauthorized', { status: 401 })
  const id = request.nextUrl.searchParams.get('id')
  if (!id) return new Response('Missing id', { status: 400 })
  const post = await (await adminRepository()).getPost(id)
  if (!post) return new Response('Not found', { status: 404 })

  const draft = await draftMode()
  draft.enable()
  redirect(postPath(post.locale, post.slug))
}
