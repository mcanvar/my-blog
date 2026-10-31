import { NotFoundContent } from '@/components/site/NotFoundContent'
import { fontVariables } from './fonts'
import '@/styles/globals.css'

// Requests outside any locale (rare: the proxy assigns one to almost every path).
export default function GlobalNotFound() {
  return (
    <html lang="tr" className={fontVariables}>
      <body className="bg-paper text-ink">
        <NotFoundContent
          title="Patikadan çıktın · You wandered off the trail"
          body="Aradığın sayfa bulunamadı. · The page you are looking for does not exist."
          homeHref="/"
          homeLabel="Ana sayfa"
          archiveHref="/en"
          archiveLabel="English"
        />
      </body>
    </html>
  )
}
