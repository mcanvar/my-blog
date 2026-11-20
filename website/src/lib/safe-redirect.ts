const BASE = 'https://redirect.invalid'

/**
 * A same-origin path for a user-supplied redirect target, or the fallback. Resolves the target the
 * way a browser would, so `/\evil.com`, `//evil.com` and tab tricks cannot leave the site.
 */
export function safeRedirectPath(target: string | null | undefined, fallback = '/'): string {
  if (!target || !target.startsWith('/')) return fallback
  try {
    const url = new URL(target, BASE)
    if (url.origin !== BASE) return fallback
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}
