import { serializeJsonLd } from '@/lib/seo/jsonld'

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Escaped: `<` becomes \u003c so content can never close the script tag.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  )
}
