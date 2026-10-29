import type { ReactNode } from 'react'

// The public site ([locale]) and the admin each render their own <html>.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children
}
