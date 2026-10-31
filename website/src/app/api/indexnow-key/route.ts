/** Served at /<INDEXNOW_KEY>.txt (proxy rewrite) so search engines can verify IndexNow pings. */
export function GET() {
  const key = process.env.INDEXNOW_KEY
  if (!key) return new Response('Not found', { status: 404 })
  return new Response(key, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
