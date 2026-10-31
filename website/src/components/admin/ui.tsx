import type { ReactNode } from 'react'
import type { CommentStatus, PostStatus } from '@/lib/types'

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-line bg-surface px-6 py-4">
      <h1 className="mr-auto text-xl font-bold">{title}</h1>
      {children}
    </header>
  )
}

const statusStyles: Record<string, string> = {
  PUBLISHED: 'bg-[#dfe8dc] text-[#2f5130]',
  SCHEDULED: 'bg-[#dde6ee] text-[#2d4a63]',
  DRAFT: 'bg-[#e8e7e2] text-nature-medium',
  ARCHIVED: 'bg-[#ecdcdc] text-[#6b2d2d]',
  REVIEW: 'bg-[#f3ead2] text-[#7a5a12]',
  PENDING: 'bg-[#f3ead2] text-[#7a5a12]',
  APPROVED: 'bg-[#dfe8dc] text-[#2f5130]',
  REJECTED: 'bg-[#e8e7e2] text-nature-medium',
  SPAM: 'bg-[#ecdcdc] text-[#6b2d2d]',
}

export function StatusBadge({ status }: { status: PostStatus | CommentStatus | 'REVIEW' }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${statusStyles[status] ?? ''}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  )
}

export function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? '#5d8a5a' : score >= 55 ? '#b08a2e' : '#a65151'
  return (
    <span className="inline-flex items-center gap-2 text-xs tabular-nums">
      <span className="h-1.5 w-14 overflow-hidden rounded-full bg-[#e3e2dc]">
        <span className="block h-full" style={{ width: `${score}%`, background: color }} />
      </span>
      {score}
    </span>
  )
}

export function Tile({
  label,
  value,
  tone,
}: {
  label: string
  value: number | string
  tone?: 'warn'
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${tone === 'warn' ? 'border-[#e6d6a8] bg-[#f3ead2]' : 'border-[#e4e3dd] bg-white'}`}
    >
      <p className="text-2xl leading-none font-bold">{value}</p>
      <p className="mt-1 text-xs text-fern">{label}</p>
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-line bg-white p-8 text-center text-sm text-fern">
      {children}
    </p>
  )
}
