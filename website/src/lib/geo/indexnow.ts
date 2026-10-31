import 'server-only'
import { isIndexable, PRODUCTION_HOST, siteUrl } from '../site'

/** Notify Bing, Yandex and other IndexNow engines that URLs changed. Best effort. */
export async function pingIndexNow(urls: string[]): Promise<void> {
  const key = process.env.INDEXNOW_KEY
  if (!key || !isIndexable || urls.length === 0) return
  try {
    await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: PRODUCTION_HOST,
        key,
        keyLocation: `${siteUrl}/${key}.txt`,
        urlList: urls,
      }),
      signal: AbortSignal.timeout(3000),
    })
  } catch (error) {
    console.warn('IndexNow ping failed', error)
  }
}
