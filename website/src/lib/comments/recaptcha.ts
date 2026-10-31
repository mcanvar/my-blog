export const RECAPTCHA_ACTION = 'comment_submit'

interface Grecaptcha {
  enterprise: {
    ready(callback: () => void): void
    execute(siteKey: string, options: { action: string }): Promise<string>
  }
}

declare global {
  interface Window {
    grecaptcha?: Grecaptcha
  }
}

let loading: Promise<void> | null = null

/** Loaded only when the comment form comes into view (performance and privacy). */
export function loadRecaptcha(siteKey: string): Promise<void> {
  if (loading) return loading
  loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${encodeURIComponent(siteKey)}`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => {
      loading = null
      reject(new Error('reCAPTCHA failed to load'))
    }
    document.head.appendChild(script)
  })
  return loading
}

export async function getRecaptchaToken(siteKey: string): Promise<string> {
  await loadRecaptcha(siteKey)
  const grecaptcha = window.grecaptcha
  if (!grecaptcha) throw new Error('reCAPTCHA unavailable')
  return new Promise<string>((resolve, reject) => {
    grecaptcha.enterprise.ready(() => {
      grecaptcha.enterprise.execute(siteKey, { action: RECAPTCHA_ACTION }).then(resolve, reject)
    })
  })
}
