import { RESPONSIVE_MARKER, variantPath, variantWidths } from '../content/media'
import { slugify } from '../content/slug'

export const MAX_IMAGE_WIDTH = 2000
export const MAX_IMAGE_HEIGHT = 20_000
/** Per file, enforced by the presigned POST policy. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

export interface UploadPlan {
  /** Site-relative path stored in content, e.g. /media/2026/cover-a1b2c3-rs-1600x900.webp */
  path: string
  /** The full image first, then its smaller copies. */
  files: { path: string; width: number }[]
}

/** Server-side naming for an upload; the browser only suggests a name and reports the size. */
export function planUpload(
  input: { name: string; width: number; height: number },
  now: Date,
  id: string
): UploadPlan | null {
  const { width, height } = input
  const sizeOk =
    Number.isInteger(width) &&
    Number.isInteger(height) &&
    width >= 1 &&
    height >= 1 &&
    width <= MAX_IMAGE_WIDTH &&
    height <= MAX_IMAGE_HEIGHT
  if (!sizeOk) return null
  const stem = slugify(input.name, 40) || 'image'
  const path = `/media/${now.getUTCFullYear()}/${stem}-${id}${RESPONSIVE_MARKER}${width}x${height}.webp`
  return {
    path,
    files: [
      { path, width },
      ...variantWidths(width).map((w) => ({ path: variantPath(path, w), width: w })),
    ],
  }
}

const MEDIA_OBJECT = /^\/media\/(?:[A-Za-z0-9._-]+\/)*[A-Za-z0-9._-]+$/

/** A path under /media/ without traversal segments. */
export function isMediaObjectPath(path: string): boolean {
  return MEDIA_OBJECT.test(path) && !path.split('/').some((part) => part === '.' || part === '..')
}

/** The file plus the responsive copies uploaded next to it. */
export function mediaFilesFor(path: string): string[] {
  const size = /-(\d{2,5})x\d{2,5}\.webp$/i.exec(path)
  const paths = [path]
  if (path.includes(RESPONSIVE_MARKER) && size) {
    for (const w of variantWidths(Number(size[1]))) paths.push(variantPath(path, w))
  }
  return paths
}
