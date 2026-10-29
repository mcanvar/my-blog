'use client'

import { Extension, type Editor, type Range } from '@tiptap/core'
import { ReactRenderer } from '@tiptap/react'
import Suggestion, { type SuggestionKeyDownProps, type SuggestionProps } from '@tiptap/suggestion'
import { forwardRef, useImperativeHandle, useState } from 'react'

export interface SlashItem {
  title: string
  hint: string
  run: (editor: Editor, range: Range) => void
}

interface MenuHandle {
  onKeyDown: (event: KeyboardEvent) => boolean
}

const SlashMenu = forwardRef<MenuHandle, SuggestionProps<SlashItem>>(function SlashMenu(
  { items, command },
  ref
) {
  const [selected, setSelected] = useState(0)
  const [lastItems, setLastItems] = useState(items)
  if (items !== lastItems) {
    setLastItems(items)
    setSelected(0)
  }

  useImperativeHandle(ref, () => ({
    onKeyDown(event) {
      if (!items.length) return false
      if (event.key === 'ArrowDown') {
        setSelected((s) => (s + 1) % items.length)
        return true
      }
      if (event.key === 'ArrowUp') {
        setSelected((s) => (s - 1 + items.length) % items.length)
        return true
      }
      if (event.key === 'Enter') {
        const item = items[selected]
        if (item) command(item)
        return true
      }
      return false
    },
  }))

  if (!items.length) return null
  return (
    <div role="listbox" className="w-56 rounded-xl border border-line bg-white p-1 shadow-xl">
      {items.map((item, index) => (
        <button
          key={item.title}
          type="button"
          role="option"
          aria-selected={index === selected}
          onMouseEnter={() => setSelected(index)}
          onMouseDown={(event) => {
            event.preventDefault()
            command(item)
          }}
          className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm aria-selected:bg-paper"
        >
          {item.title}
          <span className="text-xs text-sage">{item.hint}</span>
        </button>
      ))}
    </div>
  )
})

function place(element: HTMLElement, rect: (() => DOMRect | null) | null | undefined) {
  const box = rect?.()
  if (!box) return
  element.style.position = 'fixed'
  element.style.zIndex = '60'
  element.style.left = `${Math.min(box.left, window.innerWidth - 240)}px`
  element.style.top = `${box.bottom + 6}px`
}

/** "/" opens a block menu (headings, lists, image, table…). */
export function createSlashCommand(getItems: () => SlashItem[]) {
  return Extension.create({
    name: 'slashCommand',
    addProseMirrorPlugins() {
      return [
        Suggestion<SlashItem>({
          editor: this.editor,
          char: '/',
          startOfLine: false,
          items: ({ query }) =>
            getItems()
              .filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
              .slice(0, 9),
          command: ({ editor, range, props }) => props.run(editor, range),
          render: () => {
            let renderer: ReactRenderer<MenuHandle, SuggestionProps<SlashItem>> | null = null
            return {
              onStart: (props) => {
                renderer = new ReactRenderer(SlashMenu, { props, editor: props.editor })
                document.body.appendChild(renderer.element)
                place(renderer.element as HTMLElement, props.clientRect)
              },
              onUpdate: (props) => {
                renderer?.updateProps(props)
                if (renderer) place(renderer.element as HTMLElement, props.clientRect)
              },
              onKeyDown: (props: SuggestionKeyDownProps) => {
                if (props.event.key === 'Escape') {
                  renderer?.element.remove()
                  return true
                }
                return renderer?.ref?.onKeyDown(props.event) ?? false
              },
              onExit: () => {
                renderer?.element.remove()
                renderer?.destroy()
                renderer = null
              },
            }
          },
        }),
      ]
    },
  })
}
