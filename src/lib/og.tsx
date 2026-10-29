import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

export const ogSize = { width: 1200, height: 630 }

let fontCache: Promise<
  { name: string; data: Buffer; weight: 500 | 700; style: 'normal' }[]
> | null = null

function loadFonts() {
  fontCache ??= Promise.all([
    readFile(join(process.cwd(), 'src/assets/fonts/BricolageGrotesque-Bold.ttf')),
    readFile(join(process.cwd(), 'src/assets/fonts/Literata-Medium.ttf')),
  ]).then(([display, body]) => [
    { name: 'Display', data: display, weight: 700 as const, style: 'normal' as const },
    { name: 'Body', data: body, weight: 500 as const, style: 'normal' as const },
  ])
  return fontCache
}

function Contours() {
  return (
    <svg
      width="620"
      height="620"
      viewBox="0 0 620 620"
      style={{ position: 'absolute', right: -140, top: -160 }}
    >
      {Array.from({ length: 12 }, (_, i) => (
        <ellipse
          key={i}
          cx="310"
          cy="310"
          rx={40 + i * 24}
          ry={30 + i * 21}
          fill="none"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth="2"
        />
      ))}
    </svg>
  )
}

interface OgCardInput {
  eyebrow: string
  title: string
  footer: string
  coverUrl?: string | null
}

export async function renderOgCard({ eyebrow, title, footer, coverUrl }: OgCardInput) {
  const fonts = await loadFonts()
  const titleSize = title.length > 70 ? 54 : title.length > 40 ? 64 : 76

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #252626 0%, #35403A 60%, #4C594F 100%)',
        color: '#F2F1EC',
        fontFamily: 'Body',
      }}
    >
      <Contours />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          flex: 1,
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 26, color: '#BFBFB8' }}
        >
          <div style={{ width: 18, height: 18, borderRadius: 9, background: '#ECEBE5' }} />
          {eyebrow}
        </div>
        <div
          style={{
            display: 'flex',
            fontFamily: 'Display',
            fontSize: titleSize,
            lineHeight: 1.04,
            letterSpacing: -1,
            maxWidth: coverUrl ? 640 : 1000,
          }}
        >
          {title}
        </div>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 26, color: '#A4A69C' }}
        >
          <svg width="120" height="24" viewBox="0 0 120 24">
            <path
              d="M2 16 C22 2 36 22 58 12 S96 4 118 14"
              fill="none"
              stroke="#A4A69C"
              strokeWidth="3"
              strokeDasharray="2 9"
              strokeLinecap="round"
            />
          </svg>
          {footer}
        </div>
      </div>
      {coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverUrl}
          alt=""
          width={420}
          height={630}
          style={{ objectFit: 'cover', width: 420, height: 630 }}
        />
      )}
    </div>,
    { ...ogSize, fonts }
  )
}
