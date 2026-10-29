interface NotFoundContentProps {
  title: string
  body: string
  homeHref: string
  homeLabel: string
  archiveHref: string
  archiveLabel: string
}

/** "You wandered off the trail": a broken dashed path with the hiker in the gap. */
export function NotFoundContent({
  title,
  body,
  homeHref,
  homeLabel,
  archiveHref,
  archiveLabel,
}: NotFoundContentProps) {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-5 px-6 py-16 text-center">
      <svg viewBox="0 0 240 60" width="240" height="60" aria-hidden="true">
        <path
          d="M0 38 C40 12 72 52 104 32"
          fill="none"
          stroke="var(--fern)"
          strokeWidth="3"
          strokeDasharray="6 6"
          strokeLinecap="round"
        />
        <path
          d="M140 28 C170 10 200 52 240 30"
          fill="none"
          stroke="var(--sage)"
          strokeWidth="3"
          strokeDasharray="6 6"
          strokeLinecap="round"
        />
        <circle cx="122" cy="31" r="8" fill="var(--moss)" />
      </svg>
      <p className="condensed text-7xl leading-none font-bold text-moss">404</p>
      <h1 className="condensed text-3xl font-bold">{title}</h1>
      <p className="max-w-md text-fern">{body}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <a href={homeHref} className="btn">
          {homeLabel}
        </a>
        <a href={archiveHref} className="btn-outline">
          {archiveLabel}
        </a>
      </div>
    </div>
  )
}
