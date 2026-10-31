'use client'

import { mergeAttributes, type Editor } from '@tiptap/core'
import Image from '@tiptap/extension-image'
import { TableKit } from '@tiptap/extension-table'
import { Placeholder } from '@tiptap/extensions'
import { Markdown } from '@tiptap/markdown'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { resolveMediaUrl } from '@/lib/content/media'
import { createSlashCommand, type SlashItem } from './SlashCommand'
import './editor.css'

export type ImageUploader = (file: File) => Promise<{ src: string; alt: string }>

interface RichEditorProps {
  initialMarkdown: string
  onChange: (markdown: string) => void
  onUploadImage: ImageUploader | null
  mediaBaseUrl?: string
  placeholder: string
}

/** Shows /media/ images through the CDN while keeping site-relative paths in the Markdown. */
function mediaImage(mediaBaseUrl?: string) {
  return Image.extend({
    renderHTML({ HTMLAttributes }) {
      return [
        'img',
        mergeAttributes(HTMLAttributes, {
          src: resolveMediaUrl(String(HTMLAttributes.src ?? ''), mediaBaseUrl),
        }),
      ]
    },
  }).configure({ inline: false, allowBase64: false })
}

function ToolbarButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="grid h-8 min-w-8 place-items-center rounded-md border border-[#e4e3dd] bg-white px-2 text-xs font-bold text-nature-dark transition hover:border-sage aria-pressed:bg-nature-dark aria-pressed:text-white"
    >
      {children}
    </button>
  )
}

export function RichEditor({
  initialMarkdown,
  onChange,
  onUploadImage,
  mediaBaseUrl,
  placeholder,
}: RichEditorProps) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const uploaderRef = useRef(onUploadImage)
  const editorRef = useRef<Editor | null>(null)
  useEffect(() => {
    uploaderRef.current = onUploadImage
  }, [onUploadImage])

  async function insertImageFromFile(editor: Editor, file: File) {
    const upload = uploaderRef.current
    if (!upload) return
    setUploading(true)
    try {
      const { src, alt } = await upload(file)
      editor.chain().focus().setImage({ src, alt }).run()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function requestImage(editor: Editor) {
    if (uploaderRef.current) {
      fileInput.current?.click()
      return
    }
    const src = window.prompt('Image URL (https://…)')
    if (!src || !/^https:\/\//.test(src)) return
    const alt = window.prompt('Alt text (describe the image)') ?? ''
    editor.chain().focus().setImage({ src, alt }).run()
  }

  const slashItems = (): SlashItem[] => [
    {
      title: 'Heading 2',
      hint: 'H2',
      run: (e, r) => e.chain().focus().deleteRange(r).setNode('heading', { level: 2 }).run(),
    },
    {
      title: 'Heading 3',
      hint: 'H3',
      run: (e, r) => e.chain().focus().deleteRange(r).setNode('heading', { level: 3 }).run(),
    },
    {
      title: 'Bullet list',
      hint: '•',
      run: (e, r) => e.chain().focus().deleteRange(r).toggleBulletList().run(),
    },
    {
      title: 'Numbered list',
      hint: '1.',
      run: (e, r) => e.chain().focus().deleteRange(r).toggleOrderedList().run(),
    },
    {
      title: 'Quote',
      hint: '❝',
      run: (e, r) => e.chain().focus().deleteRange(r).toggleBlockquote().run(),
    },
    {
      title: 'Code block',
      hint: '{ }',
      run: (e, r) => e.chain().focus().deleteRange(r).toggleCodeBlock().run(),
    },
    {
      title: 'Table',
      hint: '▦',
      run: (e, r) =>
        e
          .chain()
          .focus()
          .deleteRange(r)
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run(),
    },
    {
      title: 'Divider',
      hint: '—',
      run: (e, r) => e.chain().focus().deleteRange(r).setHorizontalRule().run(),
    },
    {
      title: 'Image',
      hint: 'upload',
      run: (e, r) => {
        e.chain().focus().deleteRange(r).run()
        requestImage(e)
      },
    },
  ]

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        underline: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
      mediaImage(mediaBaseUrl),
      TableKit.configure({ table: { resizable: false } }),
      Placeholder.configure({ placeholder }),
      Markdown,
      createSlashCommand(slashItems),
    ],
    content: initialMarkdown,
    contentType: 'markdown',
    editorProps: {
      attributes: {
        class: 'article-body rich-editor min-h-[50vh] outline-none',
        spellcheck: 'true',
      },
      handleDrop: (view, event) => {
        const file = event.dataTransfer?.files?.[0]
        if (!file || !file.type.startsWith('image/') || !uploaderRef.current || !editorRef.current)
          return false
        event.preventDefault()
        void insertImageFromFile(editorRef.current, file)
        return true
      },
      handlePaste: (view, event) => {
        const file = event.clipboardData?.files?.[0]
        if (!file || !file.type.startsWith('image/') || !uploaderRef.current || !editorRef.current)
          return false
        event.preventDefault()
        void insertImageFromFile(editorRef.current, file)
        return true
      },
    },
    onUpdate: ({ editor: current }) => onChange(current.getMarkdown()),
  })
  useEffect(() => {
    editorRef.current = editor
  }, [editor])

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive('bold'),
            italic: e.isActive('italic'),
            strike: e.isActive('strike'),
            code: e.isActive('code'),
            h2: e.isActive('heading', { level: 2 }),
            h3: e.isActive('heading', { level: 3 }),
            bullet: e.isActive('bulletList'),
            ordered: e.isActive('orderedList'),
            quote: e.isActive('blockquote'),
            codeBlock: e.isActive('codeBlock'),
            link: e.isActive('link'),
          }
        : null,
  })

  if (!editor) return <div className="min-h-[50vh] animate-pulse rounded-xl bg-white" />

  function setLink() {
    if (!editor) return
    const previous = editor.getAttributes('link').href as string | undefined
    const href = window.prompt('Link URL (https://… or /slug)', previous ?? '')
    if (href === null) return
    if (href === '') editor.chain().focus().extendMarkRange('link').unsetLink().run()
    else editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
  }

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-1 mb-3 flex flex-wrap gap-1 bg-[#f5f4f0]/95 px-1 py-2 backdrop-blur">
        <ToolbarButton
          label="Bold"
          active={state?.bold}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={state?.italic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <i>I</i>
        </ToolbarButton>
        <ToolbarButton
          label="Strikethrough"
          active={state?.strike}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <s>S</s>
        </ToolbarButton>
        <ToolbarButton
          label="Inline code"
          active={state?.code}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          {'</>'}
        </ToolbarButton>
        <ToolbarButton
          label="Heading 2"
          active={state?.h2}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          active={state?.h3}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          active={state?.bullet}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={state?.ordered}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </ToolbarButton>
        <ToolbarButton
          label="Quote"
          active={state?.quote}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          ❝
        </ToolbarButton>
        <ToolbarButton
          label="Code block"
          active={state?.codeBlock}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          {'{ }'}
        </ToolbarButton>
        <ToolbarButton label="Link" active={state?.link} onClick={setLink}>
          🔗
        </ToolbarButton>
        <ToolbarButton
          label={onUploadImage ? 'Upload image' : 'Image from URL'}
          onClick={() => requestImage(editor)}
        >
          {uploading ? '…' : '🖼'}
        </ToolbarButton>
        <ToolbarButton
          label="Table"
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
        >
          ▦
        </ToolbarButton>
        <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>
          ↶
        </ToolbarButton>
        <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>
          ↷
        </ToolbarButton>
        <span className="ml-auto self-center text-[0.7rem] text-sage">Type / for blocks</span>
      </div>
      <EditorContent editor={editor} />
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) void insertImageFromFile(editor, file)
        }}
      />
    </div>
  )
}
