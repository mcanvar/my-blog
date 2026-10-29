import Link from 'next/link'
import { CommentQueue } from '@/components/admin/CommentQueue'
import { PageHeader } from '@/components/admin/ui'
import { adminRepository } from '@/lib/data/admin'
import { COMMENT_STATUSES, type CommentStatus } from '@/lib/types'

export const metadata = { title: 'Comments' }

export default async function CommentsPage({ searchParams }: PageProps<'/admin/comments'>) {
  const { status: raw } = await searchParams
  const status: CommentStatus = COMMENT_STATUSES.includes(raw as CommentStatus)
    ? (raw as CommentStatus)
    : 'PENDING'
  const repo = await adminRepository()
  const [comments, counts] = await Promise.all([
    repo.listComments(status),
    Promise.all(COMMENT_STATUSES.map(async (s) => [s, await repo.countComments(s)] as const)),
  ])

  return (
    <>
      <PageHeader title="Comments" />
      <div className="flex flex-col gap-4 p-6">
        <nav className="flex flex-wrap gap-1" aria-label="Comment status">
          {counts.map(([s, count]) => (
            <Link
              key={s}
              href={`/admin/comments?status=${s}`}
              aria-current={s === status ? 'page' : undefined}
              className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm aria-[current=page]:border-nature-dark aria-[current=page]:bg-nature-dark aria-[current=page]:text-white"
            >
              {s.charAt(0) + s.slice(1).toLowerCase()} <span className="opacity-60">{count}</span>
            </Link>
          ))}
        </nav>
        <CommentQueue key={status} comments={comments} status={status} />
      </div>
    </>
  )
}
