import React, { Component } from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate';
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
        menuPosition : []
    }

    constructor(props) {
        super(props)
        this.editorRef = React.createRef({})
        this.menuRef = React.createRef({})
    }

    componentDidUpdate(prevProps, prevState) {
        let textSelection = window.getSelection()
        const menu = this.menuRef.current
        let { value } = this.state
        let { fragment, selection } = value
        let linkInput = document.getElementById('linkInput')
        
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

            // /**
            //  * Stores the state of the most recent position of the menu
            //  * so that when an input box is created it can remain there
            //  */
            // if (!isEqual([x, y], prevState.menuPosition) || this.state.menuPosition.length === 0) {
            //     this.setState({ menuPosition: [x, y] })
            // }
        }

        /**
         * If editor is out of focus or
         * selection is collapsed, hide the view
         */
        if ((selection.isBlurred || selection.isCollapsed) && !linkInput) {
            menu.style.visibility = "hidden"
        } else {
            menu.style.visibility = "visible"
        }

        // if (this.state.showLinkAlter) {
        //     linkInput.focus()
        //     menu.style.left = `${this.state.menuPosition[0]}px`
        //     menu.style.top = `${this.state.menuPosition[1]}px`
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
                <HoverMenu ref={this.menuRef} editor={editor} showLinkAlter={this.state.showLinkAlter} changeLinkAlter={() => this.setState({ showLinkAlter: !this.state.showLinkAlter})}/>
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
                    .unwrapBlock('bulleted-list')
                    .setBlocks('paragraph')
            } else {
                editor.deleteBackward(1)
            }
            

        // } else if (event.key === "Enter") {
        //     // if (ed)
        //     let blockType = 'paragraph'
        //     // /**
        //     //  * Overrides default enter operation to
        //     //  * not only splitBlock, but to also set
        //     //  * it to the default type `paragraph`
        //     //  */
        //     // if (editor.value.blocks.some(node => node.type === 'block-quote')) {
        //     //     blockType = 'block-quote'
        //     // }

        //     if (editor.value.blocks.some(node => node.type === 'list-item')) {
        //         blockType = "list-item"
        //     }

        //     editor
        //         .splitBlock()
        //         .setBlocks(blockType)

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
            case 'bulleted-list':
                return <ol {...attributes}>{children}</ol>
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