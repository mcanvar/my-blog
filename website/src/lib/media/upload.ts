import { createUploadAction, type PresignedUpload } from '@/app/admin/actions/media'
import { MAX_IMAGE_WIDTH, MAX_UPLOAD_BYTES } from './paths'

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
]
const QUALITY = 0.82

export interface UploadedImage {
  /** Site-relative path stored in content, e.g. /media/2026/cover-a1b2c3-rs-1600x900.webp */
  path: string
  width: number
  height: number
}

async function encodeWebp(bitmap: ImageBitmap, width: number): Promise<Blob> {
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
  return blob
}

async function postToS3(upload: PresignedUpload, blob: Blob): Promise<void> {
  const form = new FormData()
  for (const [name, value] of Object.entries(upload.fields)) form.append(name, value)
  form.append('file', blob)
  const response = await fetch(upload.url, { method: 'POST', body: form })
  if (!response.ok) throw new Error(`Upload failed (${response.status})`)
}

/**
 * Resizes in the browser (max 2000px), converts to WebP, and uploads the full image plus smaller
 * copies (640/1200px) for `srcset`. The server names the files and presigns each upload; the
 * browser never holds AWS credentials. ADMINS only.
 */
export async function uploadImage(file: File, baseName?: string): Promise<UploadedImage> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type))
    throw new Error('Use a JPEG, PNG, WebP, AVIF or GIF image.')
  const bitmap = await createImageBitmap(file)
  try {
    const width = Math.min(MAX_IMAGE_WIDTH, bitmap.width)
    const height = Math.round((bitmap.height * width) / bitmap.width)
    const plan = await createUploadAction({
      name: baseName || file.name.replace(/\.[^.]+$/, ''),
      width,
      height,
    })
    if (!plan.ok) throw new Error(plan.error)

    for (const upload of plan.uploads) {
      const blob = await encodeWebp(bitmap, upload.width)
      if (blob.size > MAX_UPLOAD_BYTES) throw new Error('The image is larger than 10 MB as WebP.')
      await postToS3(upload, blob)
    }
    return { path: plan.path, width, height }
  } finally {
    bitmap.close()
  }
}
