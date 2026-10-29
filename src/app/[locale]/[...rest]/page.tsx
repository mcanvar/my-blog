import { notFound } from 'next/navigation'

// Unknown multi-segment paths render the localized not-found page.
export default function CatchAll() {
  notFound()
}
