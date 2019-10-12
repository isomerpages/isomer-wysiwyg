// import React from 'react'
import InsertBlockOnEnter from 'slate-insert-block-on-enter'


function MarkHotkey(options) {
  const { type, key } = options

  // Return our "plugin" object, containing the `onKeyDown` handler.
  return {
    onKeyDown(event, editor, next) {
      // testing for bulleted lists
      const doc = editor.props.value.document
      //console.log(doc.getBlocks(editor.value.blocks.first()))

      // console.log(doc.getPreviousSibling(editor.value.blocks.first().key))
      // console.log(doc.getNextSibling(doc.getPreviousSibling(editor.value.blocks.first().key).key))

      // if (doc.getPreviousBlock(editor.value.blocks.first().key)) {
      //   console.log(doc.getNextBlock(doc.getPreviousBlock(editor.value.blocks.first().key).key))
      //   // if (doc.getNextBlock(doc.getPreviousBlock(editor.value.blocks.first().key).key) === '') {
      //   //   console.log('insert new block!')
      //   // }
      // }

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

// function SoftBreak(options = {}) {
//   return {
//     onKeyDown(event, editor, next) {
//       if (event.key !== 'Enter') return next()
//       if (options.shift && event.shiftKey === false) return next()
//       return editor.insertText('\n')
//     },
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
  // insertNewBreak(),
  // SoftBreak(),
  InsertBlockOnEnter('paragraph'),
]

export default plugins
