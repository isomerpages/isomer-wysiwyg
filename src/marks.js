import React from 'react'
import SoftBreak from 'slate-soft-break'


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

function insertNewBreak() {
  return {
    onKeyDown(event, editor, next) {
      if (event.key !== 'Enter') return next()
      
      // Prevent default characters from being inserted
      event.preventDefault()

      // Insert a block
      editor.insertBlock(' ')
    }
  }
}

// Initialize a plugin for each mark...
export const plugins = [
  MarkHotkey({ key: 'b', type: 'bold' }),
  MarkHotkey({ key: '`', type: 'code' }),
  MarkHotkey({ key: 'i', type: 'italic' }),
  MarkHotkey({ key: '~', type: 'strikethrough' }),
  MarkHotkey({ key: 'u', type: 'underline' }),
  MarkHotkey({ key: 'h', type: 'header3' }), // make header3 work for the whole block
  insertNewBreak(),
  SoftBreak(),
]

export default plugins
