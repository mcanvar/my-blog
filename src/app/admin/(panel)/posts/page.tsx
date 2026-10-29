import Link from 'next/link'
import { PostsTable } from '@/components/admin/PostsTable'
import { PageHeader } from '@/components/admin/ui'
import { PlusIcon } from '@/components/icons'
import { toPostRows } from '@/lib/admin/post-rows'
import { adminRepository } from '@/lib/data/admin'

export const metadata = { title: 'Posts' }

export default async function PostsPage() {
  const posts = await (await adminRepository()).listPosts()
  return (
    <>
      <PageHeader title="Posts">
        <Link href="/admin/posts/new" className="btn">
          <PlusIcon size={16} /> New post
        </Link>
      </PageHeader>
      <div className="p-6">
        <PostsTable rows={toPostRows(posts)} />
      </div>
    </>
  )
}
