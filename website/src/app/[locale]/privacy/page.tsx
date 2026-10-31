import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { RegisterAlternates } from '@/components/site/alternates'
import { COMMENT_PURGE_DAYS } from '@/lib/comments/rules'
import { formatDate } from '@/lib/format'
import { buildMetadata } from '@/lib/seo/metadata'
import { staticPath } from '@/lib/seo/urls'
import type { Locale } from '@/lib/types'

export const dynamic = 'force-static'

const LAST_UPDATED = '2026-10-29T00:00:00.000Z'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/privacy'>): Promise<Metadata> {
  const locale = (await params).locale as Locale
  const t = await getTranslations({ locale, namespace: 'Meta' })
  return buildMetadata({
    locale,
    title: t('privacyTitle'),
    description: t('privacyDescription'),
    path: staticPath(locale, '/privacy'),
    languages: { tr: staticPath('tr', '/privacy'), en: staticPath('en', '/privacy') },
  })
}

const content: Record<Locale, { heading: string; body: string[] }[]> = {
  tr: [
    {
      heading: 'Kısaca',
      body: [
        'Bu site reklam veya izleme çerezi kullanmaz. Okumak için hiçbir kişisel veri toplanmaz.',
        'Veri yalnızca yorum yazdığında işlenir ve yalnızca yorumu yayımlamak ve istenmeyen içerikten korumak için kullanılır.',
      ],
    },
    {
      heading: 'Yorum yazdığında',
      body: [
        'Yazdığın ad ve yorum metni saklanır. E-posta adresi istenmez.',
        'IP adresin saklanmaz; kötüye kullanımı sınırlamak için geri döndürülemez biçimde özetlenmiş (HMAC) hâli tutulur.',
        'Yorumlar yayımlanmadan önce elle onaylanır. Onaylanan yorumlar yazının altında herkese açık görünür.',
        `Reddedilen veya istenmeyen olarak işaretlenen yorumlar ${COMMENT_PURGE_DAYS} gün içinde otomatik olarak silinir.`,
      ],
    },
    {
      heading: 'reCAPTCHA',
      body: [
        'Yorum formu, botları ayırt etmek için Google reCAPTCHA kullanır. reCAPTCHA yalnızca yorum formu ekranda göründüğünde yüklenir ve Google tarafından donanım ve yazılım bilgileri toplanabilir. Google Gizlilik Politikası ve Hizmet Şartları geçerlidir.',
      ],
    },
    {
      heading: 'Altyapı',
      body: [
        'Site Amazon Web Services (AWS) üzerinde, ABD Doğu (Kuzey Virginia, us-east-1) bölgesinde barındırılır. Sayfalar CloudFront ile size en yakın noktadan sunulur.',
        'Tercih ettiğin tema (açık/koyu) yalnızca tarayıcında saklanır.',
      ],
    },
    {
      heading: 'Hakların',
      body: [
        'KVKK ve GDPR kapsamında yorumunun silinmesini veya düzeltilmesini isteyebilirsin. Hakkımda sayfasındaki bağlantılardan bana ulaşman yeterli.',
      ],
    },
  ],
  en: [
    {
      heading: 'In short',
      body: [
        'This site uses no advertising or tracking cookies. Reading collects no personal data.',
        'Data is processed only when you comment, and only to publish your comment and keep spam out.',
      ],
    },
    {
      heading: 'When you comment',
      body: [
        'The name and comment you write are stored. No email address is asked for.',
        'Your IP address is not stored; a one-way hashed (HMAC) form is kept to limit abuse.',
        'Comments are approved by hand before they are published. Approved comments are public under the post.',
        `Rejected or spam comments are deleted automatically within ${COMMENT_PURGE_DAYS} days.`,
      ],
    },
    {
      heading: 'reCAPTCHA',
      body: [
        'The comment form uses Google reCAPTCHA to tell people from bots. It loads only when the comment form is on screen, and Google may collect hardware and software information. The Google Privacy Policy and Terms of Service apply.',
      ],
    },
    {
      heading: 'Infrastructure',
      body: [
        'The site is hosted on Amazon Web Services (AWS) in the US East (N. Virginia, us-east-1) region and served through CloudFront from a location near you.',
        'Your theme preference (light/dark) is stored only in your browser.',
      ],
    },
    {
      heading: 'Your rights',
      body: [
        'Under GDPR and KVKK you can ask for your comment to be corrected or deleted. Reach me through the links on the About page.',
      ],
    },
  ],
}

export default async function PrivacyPage({ params }: PageProps<'/[locale]/privacy'>) {
  const locale = (await params).locale as Locale
  setRequestLocale(locale)
  const t = await getTranslations('Privacy')

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-16">
      <RegisterAlternates
        links={{ tr: staticPath('tr', '/privacy'), en: staticPath('en', '/privacy') }}
      />
      <h1 className="condensed text-4xl font-bold md:text-5xl">{t('title')}</h1>
      <p className="mt-2 text-sm text-fern">
        {t('updated', { date: formatDate(LAST_UPDATED, locale) })}
      </p>
      <div className="article-body mt-8">
        {content[locale].flatMap((section) => [
          <h2 key={section.heading}>{section.heading}</h2>,
          ...section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>),
        ])}
      </div>
    </div>
  )
}
