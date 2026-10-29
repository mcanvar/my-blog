/**
 * Amplify Hosting serves prerendered route handlers as static files and never revalidates them,
 * so SEO/GEO text routes render on request and are cached by CloudFront instead.
 */
export const SEO_CACHE_CONTROL = 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400'

export function textResponse(body: string, contentType: string): Response {
  return new Response(body, {
    headers: { 'Content-Type': contentType, 'Cache-Control': SEO_CACHE_CONTROL },
  })
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
