// import React from 'react'
import InsertBlockOnEnter from 'slate-insert-block-on-enter'
// import DropOrPasteImages from 'slate-drop-or-paste-images'
// import EditList from 'slate-edit-list'

function MarkHotkey(options) {
  const { type, key } = options

  // Return our "plugin" object, containing the `onKeyDown` handler.
  return {
    onKeyDown(event, editor, next) {
      // If it doesn't match our `key`, let other plugins handle it.
      if (!event.ctrlKey || event.key !== key) return next()

      // Prevent the default characters from being inserted.
      event.preventDefault()

      // Toggle the mark `type`.
      editor.toggleMark(type)
    },
  }
}

function BlockHotkey(options) {
  const { type, key } = options

  // Return our "plugin" object, containing the `onKeyDown` handler.
  return {
    onKeyDown(event, editor, next) {
      // If it doesn't match our `key`, let other plugins handle it.
      if (!event.ctrlKey || event.key !== key) return next()

      // Prevent the default characters from being inserted.
      event.preventDefault()
      
      // Toggle the block `type`.
      editor.setBlocks(type)
    },
  }
}

// function onClickMark(options) {
//   return { OnMouseDown(editor, event, type) {
//       event.preventDefault()
//       editor.toggleMark(type)
//     }
//   } 
// }

// Initialize a plugin for each mark...
export const plugins = [
  MarkHotkey({ key: 'b', type: 'bold' }),
  MarkHotkey({ key: '`', type: 'code' }),
  MarkHotkey({ key: 'i', type: 'italic' }),
  MarkHotkey({ key: '~', type: 'strikethrough' }),
  MarkHotkey({ key: 'u', type: 'underline' }),
  BlockHotkey({ key: 'h', type: 'header3' }),
  BlockHotkey({ key: 'c', type: 'bulleted-list' }),
  BlockHotkey({ key: 'j', type: 'numbered-list' }),
  BlockHotkey({ key: 'q', type: 'video-embed'}),
  InsertBlockOnEnter('paragraph'),
]

export default plugins
