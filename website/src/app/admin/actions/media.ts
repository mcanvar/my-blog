'use server'

import { randomUUID } from 'node:crypto'
import { DeleteObjectsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { z } from 'zod'
import { mediaBaseUrl } from '@/lib/amplify/outputs'
import { requireAdmin } from '@/lib/auth/admin'
import { isVariantPath, MEDIA_CACHE_CONTROL, resolveMediaUrl } from '@/lib/content/media'
import { isMediaObjectPath, MAX_UPLOAD_BYTES, mediaFilesFor, planUpload } from '@/lib/media/paths'
import { adminMediaBucket } from '@/lib/media/s3'
import type { MediaItem } from '@/lib/types'

export interface PresignedUpload {
  path: string
  width: number
  url: string
  fields: Record<string, string>
}

export type CreateUploadResult =
  { ok: true; path: string; uploads: PresignedUpload[] } | { ok: false; error: string }

const uploadSchema = z.object({
  name: z.string().max(200),
  width: z.number().int(),
  height: z.number().int(),
})

/**
 * Presigned POSTs for one image and its responsive copies. Each allows exactly one key under
 * media/, WebP only, at most 10 MB, with the immutable cache header, for five minutes.
 */
export async function createUploadAction(input: {
  name: string
  width: number
  height: number
}): Promise<CreateUploadResult> {
  await requireAdmin()
  const parsed = uploadSchema.safeParse(input)
  const plan = parsed.success ? planUpload(parsed.data, new Date(), randomUUID().slice(0, 6)) : null
  if (!plan) return { ok: false, error: 'Images can be at most 2000 px wide.' }

  const { client, bucket } = await adminMediaBucket()
  const uploads = await Promise.all(
    plan.files.map(async (file) => {
      const post = await createPresignedPost(client, {
        Bucket: bucket,
        Key: file.path.slice(1),
        Conditions: [
          ['content-length-range', 1, MAX_UPLOAD_BYTES],
          ['eq', '$Content-Type', 'image/webp'],
          ['eq', '$Cache-Control', MEDIA_CACHE_CONTROL],
        ],
        Fields: { 'Content-Type': 'image/webp', 'Cache-Control': MEDIA_CACHE_CONTROL },
        Expires: 300,
      })
      return { path: file.path, width: file.width, url: post.url, fields: post.fields }
    })
  )
  return { ok: true, path: plan.path, uploads }
}

export async function listMediaAction(): Promise<MediaItem[]> {
  await requireAdmin()
  const { client, bucket } = await adminMediaBucket()
  const items: MediaItem[] = []
  let token: string | undefined
  do {
    const page = await client.send(
      new ListObjectsV2Command({ Bucket: bucket, Prefix: 'media/', ContinuationToken: token })
    )
    for (const object of page.Contents ?? []) {
      const path = `/${object.Key ?? ''}`
      // Responsive copies (….w640.webp) belong to their original and are not listed separately.
      if (path.endsWith('/') || isVariantPath(path)) continue
      items.push({
        path,
        url: resolveMediaUrl(path, mediaBaseUrl),
        size: object.Size ?? null,
        lastModified: object.LastModified?.toISOString() ?? null,
      })
    }
    token = page.IsTruncated ? page.NextContinuationToken : undefined
  } while (token)
  return items.sort((a, b) => (b.lastModified ?? '').localeCompare(a.lastModified ?? ''))
}

/** Deletes an image and its responsive copies. The bucket is versioned: recoverable for 30 days. */
export async function deleteMediaAction(path: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin()
  if (typeof path !== 'string' || !isMediaObjectPath(path)) {
    return { ok: false, error: 'Not a media file.' }
  }
  const { client, bucket } = await adminMediaBucket()
  await client.send(
    new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: { Objects: mediaFilesFor(path).map((p) => ({ Key: p.slice(1) })), Quiet: true },
    })
  )
  return { ok: true }
}
