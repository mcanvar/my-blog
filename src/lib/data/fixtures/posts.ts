import type { AdminPost, Locale, PostStatus } from '../../types'
import { contentStats } from '../../content/stats'

/** Sample content for local development and tests (BLOG_DATA_SOURCE=fixtures). */
interface Seed {
  id: string
  translationKey: string
  locale: Locale
  slug: string
  title: string
  description: string
  publishedAt: string | null
  status?: PostStatus
  tags: string[]
  tldr?: string[]
  keyTakeaways?: string[]
  faq?: { q: string; a: string }[]
  sources?: { title: string; url: string }[]
  content: string
  needsReview?: boolean
}

const migrationTr = `Eski blogum 2022'den beri Paris (eu-west-3) bölgesinde duruyordu. Amplify uygulaması silindi ama DynamoDB tabloları yerinde kaldı. Bu yazıda veriyi Virginia'ya (us-east-1) nasıl taşıdığımı anlatıyorum.

## Neden bölge değiştirdim?

Okurlarım için en yakın bölge Paris'ti; ama sayfalar zaten CloudFront üzerinden önbellekten geliyor. Yönetim kolaylığı ve yeni servislerin önce us-east-1'e gelmesi kararı netleştirdi.

## Veriyi nasıl taşıdım?

Kaynak tabloyu taradım, her kaydı yeni şemaya dönüştürdüm ve hedef tabloya toplu yazdım:

\`\`\`ts
for await (const page of scan(source)) {
  await batchWrite(target, page.map(toV2))
}
\`\`\`

### Nelere dikkat ettim?

- \`createdAt\` ve \`updatedAt\` değerlerini korudum; tarihler arama motorları için önemli bir sinyal.
- HTML içeriği Markdown'a çevirdim, orijinali \`legacyHtml\` alanında sakladım.
- Her kaydı **inceleme bekliyor** olarak işaretledim.

## Sonuç

Taşıma bir öğleden sonra sürdü. Asıl iş, eski içeriği yeni yapıya uydurmaktı.`

const migrationEn = `My old blog had been sitting in Paris (eu-west-3) since 2022. The Amplify app was deleted but the DynamoDB tables survived. This is how I moved the data to Virginia (us-east-1).

## Why change regions?

Paris was closest to my readers, but pages are served from CloudFront's cache anyway. Simpler operations and new services landing in us-east-1 first made the decision easy.

## How did I move the data?

I scanned the source table, converted each item to the new schema and batch-wrote it to the target:

\`\`\`ts
for await (const page of scan(source)) {
  await batchWrite(target, page.map(toV2))
}
\`\`\`

### What did I watch out for?

- I kept \`createdAt\` and \`updatedAt\`; dates are a signal search engines use.
- I converted HTML to Markdown and kept the original in \`legacyHtml\`.
- Every item was flagged **needs review**.

## Result

The move took an afternoon. The real work was fitting old content into the new structure.`

const horizontalTr = `Bir blog aslında bir zaman çizelgesidir. Zaman soldan sağa akar; okuma ise yukarıdan aşağı. Ana sayfayı bu ikisini ayıracak şekilde tasarladım.

## Patika fikri

Her yazı patikada bir **durak**, her yıl bir **kilometre taşı**. Ana sayfada yatay ilerliyorsunuz; bir yazıya girdiğinizde dikey okumaya geçiyorsunuz.

## Erişilebilirlik

- Klavye ile ←/→, Home ve End tuşları çalışıyor.
- Tekerlek yalnızca şerit kaydırılabildiği sürece yatay kaydırıyor.
- Ekran okuyucular için ARIA \`feed\` deseni kullanılıyor.

## Arama motorları

Sonsuz kaydırma, taranabilir sayfalar olmadan kör noktadır. Bu yüzden her sayfa ayrıca \`/sayfa/2\` gibi gerçek bir adreste duruyor.`

const geoEn = `Search engines and AI assistants read your page differently, but they reward the same things: a clear answer first, a trustworthy author and structured facts.

## What is GEO?

Generative Engine Optimization is making content easy for AI systems to quote correctly. It sits on top of classic SEO; it does not replace it.

## What I changed on this blog

1. Every post starts with a short **TL;DR**.
2. Headings are written as questions people actually ask.
3. Posts list their sources and the date they were last updated.
4. Each post is also available as plain Markdown at \`/slug.md\`, and the site publishes \`llms.txt\`.

## Structured data

Posts carry \`BlogPosting\`, \`BreadcrumbList\` and, when there is an FAQ, \`FAQPage\` JSON-LD. The author is one stable \`Person\` entity across the site.`

const nextTr = `Next.js 16 ile birlikte birkaç alışkanlığımı değiştirmem gerekti.

## proxy.ts

\`middleware.ts\` artık \`proxy.ts\`. Varsayılan çalışma ortamı Node.js, bu da Amplify Hosting için iyi haber.

## Asenkron parametreler

\`params\` ve \`searchParams\` artık Promise. Her sayfada \`await params\` yazmak ilk gün garip geliyor, sonra alışıyorsunuz.

## React Compiler

\`useMemo\` ve \`useCallback\` çağrılarının çoğunu sildim; derleyici bunları kendisi hallediyor.`

const tailwindTr = `Tailwind v4 ile \`tailwind.config.js\` dosyası tarihe karıştı. Tema artık doğrudan CSS'te, \`@theme\` bloğunun içinde.

## Renk paleti

Eski blogun doğa paletini koruyarak değişken olarak tanımladım:

\`\`\`css
@theme {
  --color-nature-dark: #35403a;
  --color-nature-light: #a4a69c;
}
\`\`\`

## Karanlık tema

Karanlık tema için \`@custom-variant\` ile kendi varyantımı tanımladım.`

function lorem(locale: Locale, topic: string): string {
  return locale === 'tr'
    ? `${topic} üzerine kısa notlar.\n\n## Neden yazdım?\n\nBu konuyu uzun süredir not defterimde tutuyordum. Sonunda toparlayıp paylaşmaya karar verdim.\n\n## Neler öğrendim?\n\n- Küçük adımlar büyük farklar yaratıyor.\n- Basit çözümler genelde daha uzun yaşıyor.\n- Yazmak, düşünmenin en iyi yolu.\n\n## Son söz\n\nGeri bildiriminizi yorumlarda bekliyorum.`
    : `Short notes on ${topic}.\n\n## Why write this?\n\nI kept this topic in my notebook for a long time and finally decided to share it.\n\n## What did I learn?\n\n- Small steps make big differences.\n- Simple solutions tend to live longer.\n- Writing is the best way to think.\n\n## Final words\n\nI'd love your feedback in the comments.`
}

const seeds: Seed[] = [
  {
    id: 'p-migration-tr',
    translationKey: 'migration-2026',
    locale: 'tr',
    slug: 'paristen-virginiaya-dynamodb-tasima-gunlugu',
    title: "Paris'ten Virginia'ya: DynamoDB taşıma günlüğü",
    description:
      'Silinmiş bir Amplify uygulamasından kalan DynamoDB tablolarını eu-west-3 bölgesinden us-east-1 bölgesine adım adım taşıma.',
    publishedAt: '2026-10-26T09:00:00.000Z',
    tags: ['aws', 'dynamodb'],
    tldr: [
      'Amplify uygulaması silinse de DynamoDB tabloları yerinde kalabilir.',
      'Veriyi kopyalarken zaman damgalarını korudum.',
      'Tarihleri korumak, arama motoru sinyallerini korumak demek.',
    ],
    faq: [
      {
        q: 'Eski Cognito kullanıcıları taşınır mı?',
        a: 'Hayır. Yeni sürümde yalnızca yönetici hesabı var ve elle oluşturuluyor.',
      },
      {
        q: 'Görseller ne olacak?',
        a: 'Harici görseller raporlanıyor ve isteğe bağlı olarak S3’e kopyalanıyor.',
      },
    ],
    sources: [
      {
        title: 'Amazon DynamoDB — Export to S3',
        url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataExport.HowItWorks.html',
      },
      {
        title: 'AWS Amplify Gen 2 — Data',
        url: 'https://docs.amplify.aws/react/build-a-backend/data/',
      },
    ],
    content: migrationTr,
  },
  {
    id: 'p-migration-en',
    translationKey: 'migration-2026',
    locale: 'en',
    slug: 'paris-to-virginia-dynamodb-migration-log',
    title: 'Paris to Virginia: a DynamoDB migration log',
    description:
      'Moving the DynamoDB tables left behind by a deleted Amplify app from eu-west-3 to us-east-1, step by step.',
    publishedAt: '2026-10-26T09:00:00.000Z',
    tags: ['aws', 'dynamodb'],
    tldr: [
      'DynamoDB tables can outlive a deleted Amplify app.',
      'I kept the original timestamps while copying.',
      'Keeping dates means keeping search engine signals.',
    ],
    sources: [
      {
        title: 'Amazon DynamoDB — Export to S3',
        url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataExport.HowItWorks.html',
      },
    ],
    content: migrationEn,
  },
  {
    id: 'p-next16-tr',
    translationKey: 'next16',
    locale: 'tr',
    slug: 'nextjs-16ya-gecerken-ogrendiklerim',
    title: "Next.js 16'ya geçerken öğrendiklerim",
    description:
      'proxy.ts, asenkron parametreler ve React Compiler ile dört yıllık bir blogu yeniden yazmak.',
    publishedAt: '2026-10-19T08:00:00.000Z',
    tags: ['nextjs', 'react'],
    tldr: [
      'middleware.ts artık proxy.ts.',
      'params artık Promise.',
      'React Compiler memo işini üstleniyor.',
    ],
    content: nextTr,
  },
  {
    id: 'p-horizontal-tr',
    translationKey: 'horizontal-home',
    locale: 'tr',
    slug: 'neden-yatay-bir-ana-sayfa',
    title: 'Neden yatay bir ana sayfa?',
    description:
      'Bir blog bir zaman çizelgesidir. Zaman soldan sağa akar, okuma yukarıdan aşağı. İkisini ayıran bir tasarım.',
    publishedAt: '2026-10-12T08:00:00.000Z',
    tags: ['tasarım', 'erişilebilirlik'],
    content: horizontalTr,
  },
  {
    id: 'p-tailwind-tr',
    translationKey: 'tailwind4',
    locale: 'tr',
    slug: 'tailwind-v4-ile-css-first-tema',
    title: 'Tailwind v4 ile CSS-first tema',
    description: 'tailwind.config.js olmadan, @theme ile renk paleti ve karanlık tema tanımlamak.',
    publishedAt: '2026-09-21T08:00:00.000Z',
    tags: ['css', 'tailwind'],
    content: tailwindTr,
  },
  {
    id: 'p-geo-en',
    translationKey: 'geo-writing',
    locale: 'en',
    slug: 'writing-for-search-and-ai-engines',
    title: 'Writing for search and AI engines',
    description:
      'JSON-LD, llms.txt and an answer-first structure: what GEO means for a personal blog.',
    publishedAt: '2026-09-14T08:00:00.000Z',
    tags: ['seo', 'geo'],
    tldr: [
      'Answer first.',
      'One stable author entity.',
      'Structured data and plain Markdown copies.',
    ],
    keyTakeaways: ['Start every post with a TL;DR.', 'Cite sources.', 'Publish llms.txt.'],
    faq: [
      {
        q: 'Does GEO replace SEO?',
        a: 'No. It builds on the same foundations: fast pages, clear structure and trust.',
      },
    ],
    content: geoEn,
  },
  {
    id: 'p-geo-tr',
    translationKey: 'geo-writing',
    locale: 'tr',
    slug: 'arama-motorlari-ve-yapay-zeka-icin-yazmak',
    title: 'Arama motorları ve yapay zekâ için yazmak',
    description:
      'JSON-LD, llms.txt ve “önce cevap” yazım düzeni: kişisel bir blog için GEO ne demek?',
    publishedAt: '2026-09-14T08:00:00.000Z',
    tags: ['seo', 'geo'],
    content: lorem('tr', 'GEO'),
  },
  {
    id: 'p-gen2-tr',
    translationKey: 'gen2',
    locale: 'tr',
    slug: 'amplify-gen-2-ilk-izlenimler',
    title: 'Amplify Gen 2: ilk izlenimler',
    description: "Backend'i TypeScript ile tanımlamak ve CLI'dan kurtulmak.",
    publishedAt: '2025-11-10T08:00:00.000Z',
    tags: ['aws', 'amplify'],
    content: lorem('tr', 'Amplify Gen 2'),
  },
  {
    id: 'p-camp-tr',
    translationKey: 'camp',
    locale: 'tr',
    slug: 'kamp-sandalyesinde-kod',
    title: 'Kamp sandalyesinde kod',
    description: 'Bir hafta boyunca doğada, dizüstü bilgisayar ve zayıf bir internetle çalışmak.',
    publishedAt: '2025-10-04T08:00:00.000Z',
    tags: ['hayat'],
    content: lorem('tr', 'doğada çalışmak'),
  },
  {
    id: 'p-small-tr',
    translationKey: 'small-projects',
    locale: 'tr',
    slug: 'kucuk-projeler-buyuk-dersler',
    title: 'Küçük projeler, büyük dersler',
    description: 'Dört yıl dokunulmamış bir repo neler anlatır?',
    publishedAt: '2025-08-16T08:00:00.000Z',
    tags: ['yazılım'],
    content: lorem('tr', 'küçük projeler'),
  },
  {
    id: 'p-react19-tr',
    translationKey: 'react19-forms',
    locale: 'tr',
    slug: 'react-19-form-aksiyonlari',
    title: 'React 19 form aksiyonları',
    description: 'useActionState ve Server Actions ile daha az kodla formlar.',
    publishedAt: '2025-06-02T08:00:00.000Z',
    tags: ['react'],
    content: lorem('tr', 'React 19 formları'),
  },
  {
    id: 'p-slugs-tr',
    translationKey: 'turkish-slugs',
    locale: 'tr',
    slug: 'turkce-sluglar-ve-url-dostu-yazilar',
    title: "Türkçe slug'lar ve URL dostu yazılar",
    description: 'ç, ğ, ı, ö, ş, ü harflerini URL’de nasıl ele almalı?',
    publishedAt: '2025-03-11T08:00:00.000Z',
    tags: ['seo'],
    content: lorem('tr', "Türkçe slug'lar"),
  },
  {
    id: 'p-hello-tr',
    translationKey: 'hello-world',
    locale: 'tr',
    slug: 'merhaba-dunya',
    title: 'İlk yazı: Merhaba dünya',
    description: 'Amplify ve Next.js ile kurduğum kişisel blogun ilk yazısı.',
    publishedAt: '2022-05-31T18:52:15.000Z',
    tags: ['hayat'],
    content: lorem('tr', 'yeni bir blog'),
    needsReview: true,
  },
  {
    id: 'p-hello-en',
    translationKey: 'hello-world',
    locale: 'en',
    slug: 'hello-world',
    title: 'First post: Hello world',
    description: 'The first post on my personal blog built with Amplify and Next.js.',
    publishedAt: '2022-05-31T18:52:15.000Z',
    tags: ['life'],
    content: lorem('en', 'a new blog'),
    needsReview: true,
  },
  {
    id: 'p-draft-en',
    translationKey: 'horizontal-home',
    locale: 'en',
    slug: 'why-a-horizontal-homepage',
    title: 'Why a horizontal homepage?',
    description: 'A blog is a timeline. Time flows left to right, reading flows top to bottom.',
    publishedAt: null,
    status: 'DRAFT',
    tags: ['design'],
    content: lorem('en', 'horizontal layouts'),
  },
]

export function buildFixturePosts(): AdminPost[] {
  return seeds.map((seed) => {
    const stats = contentStats(seed.content)
    const timestamp = seed.publishedAt ?? '2026-10-27T10:00:00.000Z'
    return {
      id: seed.id,
      translationKey: seed.translationKey,
      locale: seed.locale,
      slug: seed.slug,
      title: seed.title,
      seoTitle: null,
      description: seed.description,
      tldr: seed.tldr ?? [],
      keyTakeaways: seed.keyTakeaways ?? [],
      content: seed.content,
      legacyHtml: null,
      status: seed.status ?? 'PUBLISHED',
      needsReview: seed.needsReview ?? false,
      publishedAt: seed.publishedAt,
      tags: seed.tags,
      cover: null,
      faq: seed.faq ?? [],
      sources: seed.sources ?? [],
      readingMinutes: stats.readingMinutes,
      wordCount: stats.wordCount,
      noindex: false,
      canonicalUrl: null,
      commentsEnabled: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    }
  })
}
