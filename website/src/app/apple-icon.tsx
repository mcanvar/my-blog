import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#35403A' }}>
      <svg width="180" height="180" viewBox="0 0 32 32">
        <path
          d="M5 21c4-7 7 2 11-4s7 1 11-5"
          fill="none"
          stroke="#BFBFB8"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeDasharray="0.5 4.2"
        />
        <circle cx="16" cy="17" r="2.6" fill="#ECEBE5" />
      </svg>
    </div>,
    size
  )
}
