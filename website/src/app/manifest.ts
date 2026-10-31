import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mevlüt Canvar',
    short_name: 'Mevlüt',
    description: site.tagline.tr,
    start_url: '/',
    display: 'browser',
    background_color: site.themeColor.light,
    theme_color: '#35403A',
    lang: 'tr',
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/apple-icon', type: 'image/png', sizes: '180x180' },
    ],
  }
}
