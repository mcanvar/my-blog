'use client'

import { useState } from 'react'
import { LinkIcon, MarkdownIcon, ShareIcon } from '../icons'

interface PostToolsProps {
  url: string
  title: string
  markdownHref: string
  labels: { copyLink: string; copied: string; viewMarkdown: string; share: string }
}

const toolClass =
  'flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-left text-sm text-moss transition hover:border-sage'

export function PostTools({ url, title, markdownHref, labels }: PostToolsProps) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt(labels.copyLink, url)
    }
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        return
      }
    }
    await copy()
  }

  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={copy} className={toolClass}>
        <LinkIcon size={16} />
        <span aria-live="polite">{copied ? labels.copied : labels.copyLink}</span>
      </button>
      <a href={markdownHref} className={toolClass} type="text/markdown">
        <MarkdownIcon size={16} />
        {labels.viewMarkdown}
      </a>
      <button type="button" onClick={share} className={toolClass}>
        <ShareIcon size={16} />
        {labels.share}
      </button>
    </div>
  )
}
