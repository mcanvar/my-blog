import Link from 'next/link'
import { PageHeader, StatusBadge, Tile } from '@/components/admin/ui'
import { PlusIcon } from '@/components/icons'
import { toPostRows } from '@/lib/admin/post-rows'
import { amplifyOutputs } from '@/lib/amplify/outputs'
import { adminRepository } from '@/lib/data/admin'
import { getDataSource } from '@/lib/data/source'
import { formatDateTime } from '@/lib/format'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const repo = await adminRepository()
  const [posts, pending] = await Promise.all([repo.listPosts(), repo.listComments('PENDING')])
  const rows = toPostRows(posts)
  const count = (status: string) => rows.filter((r) => r.status === status).length
  const source = getDataSource()

  return (
    <>
      <PageHeader title="Dashboard">
        <Link href="/admin/posts/new" className="btn">
          <PlusIcon size={16} /> New post
        </Link>
      </PageHeader>
      <div className="flex flex-col gap-8 p-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Tile label="Published" value={count('PUBLISHED')} />
          <Tile label="Drafts" value={count('DRAFT')} />
          <Tile label="Scheduled" value={count('SCHEDULED')} />
          <Tile label="Needs review" value={rows.filter((r) => r.needsReview).length} tone="warn" />
          <Tile
            label="Pending comments"
            value={pending.length}
            tone={pending.length ? 'warn' : undefined}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-[#e4e3dd] bg-white">
            <h2 className="border-b border-[#eeede8] px-4 py-3 text-sm font-semibold">
              Recently updated
            </h2>
            <ul className="divide-y divide-[#eeede8]">
              {rows.slice(0, 6).map((row) => (
                <li key={row.id}>
                  <Link
                    href={`/admin/posts/${row.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#faf9f6]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{row.title}</span>
                      <span className="block text-xs text-fern">
                        {row.locale.toUpperCase()} · {formatDateTime(row.updatedAt, 'en')}
                      </span>
                    </span>
                    <StatusBadge status={row.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-[#e4e3dd] bg-white">
            <h2 className="flex items-center border-b border-[#eeede8] px-4 py-3 text-sm font-semibold">
              Waiting for approval
              <Link
                href="/admin/comments"
                className="ml-auto text-xs font-normal text-fern underline"
              >
                Open queue
              </Link>
            </h2>
            {pending.length === 0 ? (
              <p className="px-4 py-6 text-sm text-fern">Nothing to review. 🌿</p>
            ) : (
              <ul className="divide-y divide-[#eeede8]">
                {pending.slice(0, 5).map((comment) => (
                  <li key={comment.id} className="px-4 py-3">
                    <p className="text-sm">
                      <span className="font-semibold">{comment.authorName}</span>{' '}
                      <span className="text-fern">on {comment.postTitle}</span>
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-fern">{comment.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <p className="text-xs text-fern">
          Data source: <strong>{source}</strong>
          {source === 'amplify' && amplifyOutputs.data?.aws_region
            ? ` · ${amplifyOutputs.data.aws_region}`
            : ''}
        </p>
      </div>
    </>
  )
}
