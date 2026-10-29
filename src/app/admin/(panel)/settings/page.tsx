import { SettingsForm } from '@/components/admin/SettingsForm'
import { PageHeader } from '@/components/admin/ui'
import { adminRepository } from '@/lib/data/admin'
import { AI_CRAWLERS } from '@/lib/geo/crawlers'

export const metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const settings = await (await adminRepository()).getSettings()
  return (
    <>
      <PageHeader title="Settings" />
      <div className="p-6">
        <SettingsForm initial={settings} crawlers={[...AI_CRAWLERS]} />
      </div>
    </>
  )
}
