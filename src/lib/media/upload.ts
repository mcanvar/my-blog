import { slugify } from '../content/slug'

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
]
const MAX_WIDTH = 2000
const QUALITY = 0.82

export interface UploadedImage {
  /** Site-relative path stored in content, e.g. /media/2026/cover-a1b2c3-1600x900.webp */
  path: string
  width: number
  height: number
}

async function toWebp(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_WIDTH / bitmap.width)
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas is not available')
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', QUALITY)
  )
  if (!blob) throw new Error('Could not encode the image')
  return { blob, width, height }
}

/** Resizes in the browser, converts to WebP and uploads to S3 (ADMINS only). */
export async function uploadImage(file: File, baseName?: string): Promise<UploadedImage> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type))
    throw new Error('Use a JPEG, PNG, WebP, AVIF or GIF image.')
  const { blob, width, height } = await toWebp(file)
  const stem = slugify(baseName || file.name.replace(/\.[^.]+$/, ''), 40) || 'image'
  const key = `media/${new Date().getFullYear()}/${stem}-${crypto.randomUUID().slice(0, 6)}-${width}x${height}.webp`
  const { uploadData } = await import('aws-amplify/storage')
  await uploadData({ path: key, data: blob, options: { contentType: 'image/webp' } }).result
  return { path: `/${key}`, width, height }
}
