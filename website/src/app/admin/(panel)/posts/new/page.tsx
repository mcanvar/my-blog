import { PostEditor } from '@/components/admin/editor/PostEditor'
import { hasBackend, mediaBaseUrl } from '@/lib/amplify/outputs'
import { getDataSource } from '@/lib/data/source'
import type { Locale } from '@/lib/types'

export const metadata = { title: 'New post' }

export default async function NewPostPage({ searchParams }: PageProps<'/admin/posts/new'>) {
  const { locale } = await searchParams
  const initialLocale: Locale = locale === 'en' ? 'en' : 'tr'

  return (
    <PostEditor
      initial={null}
      defaults={{ locale: initialLocale, translationKey: crypto.randomUUID() }}
      siblings={[]}
      mediaBaseUrl={mediaBaseUrl}
      uploadsEnabled={getDataSource() === 'amplify' && hasBackend}
    />
  )
}
