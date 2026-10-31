import {
  MEDIA_CACHE_CONTROL,
  RESPONSIVE_MARKER,
  variantPath,
  variantWidths,
} from '../content/media'
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
  /** Site-relative path stored in content, e.g. /media/2026/cover-a1b2c3-rs-1600x900.webp */
  path: string
  width: number
  height: number
}

async function encodeWebp(
  bitmap: ImageBitmap,
  width: number
): Promise<{ blob: Blob; height: number }> {
  const height = Math.round((bitmap.height * width) / bitmap.width)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas is not available')
  context.imageSmoothingQuality = 'high'
  context.drawImage(bitmap, 0, 0, width, height)
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', QUALITY)
  )
  if (!blob) throw new Error('Could not encode the image')
  return { blob, height }
}

/**
 * Resizes in the browser (max 2000px), converts to WebP, and uploads the full image plus smaller
 * copies (640/1200px) for `srcset`, all with a one-year immutable cache header. ADMINS only.
 */
export async function uploadImage(file: File, baseName?: string): Promise<UploadedImage> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type))
    throw new Error('Use a JPEG, PNG, WebP, AVIF or GIF image.')
  const bitmap = await createImageBitmap(file)
  try {
    const width = Math.min(MAX_WIDTH, bitmap.width)
    const full = await encodeWebp(bitmap, width)
    const stem = slugify(baseName || file.name.replace(/\.[^.]+$/, ''), 40) || 'image'
    const id = crypto.randomUUID().slice(0, 6)
    const path = `/media/${new Date().getFullYear()}/${stem}-${id}${RESPONSIVE_MARKER}${width}x${full.height}.webp`

    const files = [{ path, blob: full.blob }]
    for (const w of variantWidths(width)) {
      files.push({ path: variantPath(path, w), blob: (await encodeWebp(bitmap, w)).blob })
    }

    const { uploadData } = await import('aws-amplify/storage')
    await Promise.all(
      files.map(
        (f) =>
          uploadData({
            path: f.path.slice(1),
            data: f.blob,
            options: { contentType: 'image/webp', cacheControl: MEDIA_CACHE_CONTROL },
          }).result
      )
    )
    return { path, width, height: full.height }
  } finally {
    bitmap.close()
  }
}

/** Removes an uploaded image and its responsive copies. */
export async function removeImage(path: string): Promise<void> {
  const { remove } = await import('aws-amplify/storage')
  const size = /-(\d{2,5})x\d{2,5}\.webp$/i.exec(path)
  const paths = [path]
  if (path.includes(RESPONSIVE_MARKER) && size) {
    for (const w of variantWidths(Number(size[1]))) paths.push(variantPath(path, w))
  }
  await Promise.all(paths.map((p) => remove({ path: p.slice(1) })))
}
