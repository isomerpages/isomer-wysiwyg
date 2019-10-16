import React, { Component } from 'react';
import { Editor } from 'slate-react';
import { Value, Point, Range } from 'slate';
import { HoverMenu } from './HoveringMenu'
import { isEqual } from 'lodash'

const initialValue = Value.fromJSON({
    document: {
      nodes: [
        {
          object: 'block',
          type: 'paragraph',
          nodes: [
            {
              object: 'text',
              text: 'A line of text in a paragraph.',
            },
          ],
        },
      ],
    },
  })

export default class RichTextEditor extends Component {
    state = {
        value: initialValue,
        showLinkAlter: false,
    }

    constructor(props) {
        super(props)
        this.editorRef = React.createRef({})
        this.menuRef = React.createRef({})
    }

    componentDidUpdate() {
        let textSelection = window.getSelection()
        const menu = this.menuRef.current
        let { value } = this.state
        let { fragment, selection } = value
        
        /**
         * When editor is in focus, show menu atop 
         * the cursor's position in the window
         * when a chunk of text selected
         */

        if (textSelection.rangeCount > 0 && fragment.text) {
            let rect = textSelection.getRangeAt(0).getBoundingClientRect()
            let x = rect.left + window.pageXOffset - menu.offsetWidth / 2 + rect.width / 2
            let y = rect.top + window.pageYOffset - menu.offsetHeight

            menu.style.left = `${x}px`;
            menu.style.top = `${y}px`;
        }


        // /**
        //  * If editor is out of focus or
        //  * selection is collapsed, hide the view
        //  */
        // if (selection.isBlurred || selection.isCollapsed || (document.getElementById('linkInput') && !isLinkInputFocused)) {
        //     menu.style.visibility = "hidden"
        // } else {
        //     menu.style.visibility = "visible"
        // }
    }
    
    render() {
       return (
            <Editor
                ref={this.editorRef}
                value={this.state.value}
                onChange={this.onChange}
                onKeyDown={this.onKeyDown}
                renderMark={this.renderMark}
                renderBlock={this.renderBlock}
                renderEditor={this.renderEditor}
                renderInline={this.renderInline}
                autoFocus
            />
        )
    }

    /**
     * Custom render function so that
     * editor reference can be passed to <HoverMenu />
     */
    renderEditor = (props, editor, next) => {
        const children = next()
        return (
            <React.Fragment>
                {children}
                <HoverMenu ref={this.menuRef} editor={editor}/>
            </React.Fragment>
        )
    }

    /**
     * Check on key down for formatting commands
     * and add marks
     */
    onKeyDown = (event, editor, next) => {
        let mark

        if (event.metaKey && event.key === "b") {
            mark = "bold"
        } else if (event.metaKey && event.key === "i") {
            mark = "italic"
        } else if (event.metaKey && event.key === "u") {
            mark = "underlined"
        } else if (event.key === "Backspace") {
            const isList = editor.value.blocks.some(node => node.type === 'list-item')
            const currentBlocks = editor.value.blocks

            if (isList && currentBlocks.first().text.length === 0) {
                editor
                    .unwrapBlock('ordered-list')
                    .unwrapBlock('bulleted-list')
                    .setBlocks('paragraph')
            } else {
                editor.deleteBackward(1)
            }
        } else if (event.key === "Enter") {
            let isEmptyBlock  = editor.value.blocks.some(node => node.text === "")
            let isList = editor.value.blocks.some(node => node.type === "list-item")

            if (isEmptyBlock && isList) {
                editor
                    .unwrapBlock('ordered-list')
                    .unwrapBlock('bulleted-list')
                    .setBlocks('paragraph')
            } else {
                editor.splitBlock()
            }
        } else if (event.key === " ") {
            let canTurnIntoList = editor.value.blocks.some(node => node.text === "1.")

            editor.insertText(" ")

            if (canTurnIntoList) {
                editor
                    .setBlocks('list-item')
                    .wrapBlock('ordered-list')
                editor.deleteBackward(3)
            }
        } else if (event.key === "Tab") {
            let { document, previousBlock } = editor.value

            let parent = document.getParent(editor.value.blocks.first().key)
            let hasListAsParent = parent.type === 'ordered-list'
            let canBeIndented = previousBlock !== null && previousBlock.type === 'list-item' && hasListAsParent

            if (canBeIndented) {
                console.log(previousBlock.key)
                editor
                    .unwrapBlockByKey(previousBlock.key, 'list-item')
                    // .setBlockByKey(previousBlock.key, 'pargraph')
                // editor
                    // .wrapBlock(previousBlock.key)
            }
            

            editor.focus()
        } else {
            return next()
        }

        event.preventDefault()
        if (mark) editor.toggleMark(mark)
    }

    /**
     * mark rendering configuration
     */
    renderMark = (props, editor, next) => {
        const { children, mark, attributes } = props

        switch (mark.type) {
            case 'bold':
                return <strong {...attributes}>{ children }</strong>
            case 'italic':
                return <em {...attributes}>{ children }</em>
            case 'underlined':
                return <u {...attributes}>{ children }</u>
            default:
                return next()
        }
    }

    /**
     * block rendering configuration
     */
    renderBlock = (props, editor, next) => {
        const { children, node, attributes } = props
        switch (node.type) {
            case 'heading-one':
                return <h1 {...attributes} className="pb-4">{children}</h1>
            case 'heading-two':
                return <h2 {...attributes} className="pb-3">{children}</h2>
            case 'block-quote':
                return <blockquote {...attributes}>{children}</blockquote>
            case 'paragraph':
                return <p {...attributes} className="pb-2">{children}</p>
            case 'list-item':
                return <li {...attributes}>{children}</li>
            case 'ordered-list':
                return <ol {...attributes}>{children}</ol>
            case 'bulleted-list':
                return <ul style={{ listStyleType : 'square' }} {...attributes}>{children}</ul>
            default:
                return next()
        }
    }

    /**
     * inline rendering configuration
     */
    renderInline = (props, editor, next) => {
        const { attributes, children, node } = props

        switch (node.type) {
            case 'link': {
                const { data } = node
                const href = data.get('href')
                return (
                    <a {...attributes} href={href}>
                        {children}
                    </a>
                )
            }
            default: {
                return next()
            }
        }
    }

    /**
     * On change, save the new `value`
     */
    onChange = ({ value }) => {
        this.setState({ value })
    }
}