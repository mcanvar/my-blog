'use client'

import { useCallback, useEffect, useState } from 'react'
import { deleteMediaAction, listMediaAction } from '@/app/admin/actions/media'
import { uploadImage } from '@/lib/media/upload'
import type { MediaItem } from '@/lib/types'
import { EmptyState } from './ui'

export function MediaLibrary({ enabled }: { enabled: boolean }) {
  const [items, setItems] = useState<MediaItem[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(async () => setItems(await listMediaAction()), [])

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    listMediaAction()
      .then((result) => {
        if (!cancelled) setItems(result)
      })
      .catch((error) => {
        if (!cancelled) setMessage(String(error))
      })
    return () => {
      cancelled = true
    }
  }, [enabled])

  if (!enabled) {
    return (
      <EmptyState>
        Media uploads need the Amplify backend (S3 + CloudFront). Run `npx ampx sandbox` or deploy
        the branch.
      </EmptyState>
    )
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return
    setBusy(true)
    setMessage(null)
    try {
      for (const file of Array.from(files)) await uploadImage(file)
      await load()
      setMessage(`${files.length} uploaded`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  async function remove(item: MediaItem) {
    if (!window.confirm(`Delete ${item.path}? Posts that use it will show a broken image.`)) return
    const result = await deleteMediaAction(item.path)
    if (!result.ok) setMessage(result.error ?? 'Delete failed')
    await load()
  }

  async function copy(item: MediaItem) {
    await navigator.clipboard.writeText(`![](${item.path})`)
    setMessage('Markdown copied — add alt text between the brackets.')
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-sage bg-white p-8 text-sm text-fern hover:border-nature-dark">
        <span className="font-semibold text-ink">
          {busy ? 'Uploading…' : 'Drop or choose images'}
        </span>
        <span>
          Resized to 2000px with 640/1200px copies, converted to WebP, cached for a year on the CDN.
        </span>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          className="sr-only"
          onChange={(e) => onFiles(e.target.files)}
          disabled={busy}
        />
      </label>
      {message && <p className="text-sm text-fern">{message}</p>}
      {items === null ? (
        <p className="text-sm text-fern">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState>No media yet.</EmptyState>
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {items.map((item) => (
            <li
              key={item.path}
              className="overflow-hidden rounded-xl border border-[#e4e3dd] bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt=""
                loading="lazy"
                className="aspect-[4/3] w-full bg-paper object-cover"
              />
              <div className="flex flex-col gap-1 p-2 text-xs">
                <span className="truncate text-fern" title={item.path}>
                  {item.path.split('/').pop()}
                </span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => copy(item)}
                    className="font-semibold underline"
                  >
                    Copy Markdown
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    className="ml-auto text-[#a65151]"
                  >
                    Delete
                  </button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
