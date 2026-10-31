import { notFound } from 'next/navigation'
import { PostEditor } from '@/components/admin/editor/PostEditor'
import { hasBackend, mediaBaseUrl } from '@/lib/amplify/outputs'
import { adminRepository } from '@/lib/data/admin'
import { getDataSource } from '@/lib/data/source'

export const metadata = { title: 'Edit post' }

export default async function EditPostPage({ params }: PageProps<'/admin/posts/[id]'>) {
  const { id } = await params
  const repo = await adminRepository()
  const [post, all] = await Promise.all([repo.getPost(id), repo.listPosts()])
  if (!post) notFound()
  const siblings = all
    .filter((p) => p.translationKey === post.translationKey && p.id !== post.id)
    .map((p) => ({ id: p.id, locale: p.locale, title: p.title }))

  return (
    <PostEditor
      key={post.id}
      initial={post}
      defaults={{ locale: post.locale, translationKey: post.translationKey }}
      siblings={siblings}
      mediaBaseUrl={mediaBaseUrl}
      uploadsEnabled={getDataSource() === 'amplify' && hasBackend}
    />
  )
}
