import { MediaLibrary } from '@/components/admin/MediaLibrary'
import { PageHeader } from '@/components/admin/ui'
import { hasBackend, mediaBaseUrl } from '@/lib/amplify/outputs'
import { getDataSource } from '@/lib/data/source'

export const metadata = { title: 'Media' }

export default function MediaPage() {
  const enabled = getDataSource() === 'amplify' && hasBackend
  return (
    <>
      <PageHeader title="Media" />
      <div className="p-6">
        <MediaLibrary enabled={enabled} mediaBaseUrl={mediaBaseUrl} />
      </div>
    </>
  )
}
