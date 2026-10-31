import Image from 'next/image'
import { resolveMediaUrl } from '@/lib/content/media'
import { formatShortDate } from '@/lib/format'
import type { TrailItem } from '@/lib/trail'

interface PostCardProps {
  item: TrailItem
  tone: number
  tall: boolean
  minutesLabel: string
  mediaBaseUrl?: string
  index: number
  setSize: number
  priority?: boolean
}

export function PostCard({
  item,
  tone,
  tall,
  minutesLabel,
  mediaBaseUrl,
  index,
  setSize,
  priority,
}: PostCardProps) {
  const cover = item.cover ? resolveMediaUrl(item.cover.key, mediaBaseUrl) : null

  return (
    <article
      className={`trail-card tone-${tone} group`}
      lang={item.locale}
      data-index={index}
      aria-posinset={index + 1}
      aria-setsize={setSize}
      aria-labelledby={`card-${item.id}`}
    >
      <div
        className={`relative -mx-1 -mt-1 mb-1 block h-28 shrink-0 overflow-hidden rounded-xl md:hidden ${
          tall ? 'lg:block lg:h-36' : ''
        }`}
        aria-hidden="true"
      >
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            sizes="(min-width: 64rem) 19rem, 82vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            priority={priority}
          />
        ) : (
          <div className="contour-cover absolute inset-0" />
        )}
      </div>
      <p className="relative z-10 flex items-center gap-2 text-xs opacity-60">
        <time dateTime={item.publishedAt}>{formatShortDate(item.publishedAt, item.locale)}</time>
        <span aria-hidden="true">·</span>
        <span>{minutesLabel}</span>
      </p>
      <h3
        id={`card-${item.id}`}
        className="condensed text-xl leading-[1.05] font-bold text-balance xl:text-2xl"
      >
        <a
          href={item.href}
          className="outline-none after:absolute after:inset-0 after:z-20 after:rounded-2xl focus-visible:after:outline-2 focus-visible:after:outline-current"
        >
          {item.title}
        </a>
      </h3>
      <p className="line-clamp-4 min-h-0 font-body text-sm leading-relaxed opacity-75">
        {item.description}
      </p>
      {item.tags.length > 0 && (
        <p className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="chip">
              #{tag}
            </span>
          ))}
        </p>
      )}
    </article>
  )
}

export function SkeletonColumn() {
  return (
    <div className="grid h-full w-[min(60vw,14rem)] shrink-0 grid-rows-2 gap-4" aria-hidden="true">
      <div className="skeleton" />
      <div className="skeleton max-md:hidden" />
    </div>
  )
}
