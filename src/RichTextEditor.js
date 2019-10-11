import React, { Component } from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate';
import { HoverMenu } from './HoveringMenu'

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
        value: initialValue
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
         */
        if (textSelection.rangeCount > 0 && fragment.text) {
            let rect = textSelection.getRangeAt(0).getBoundingClientRect()
            menu.style.top = `${rect.top + window.pageYOffset - menu.offsetHeight}px`;
            menu.style.left = `${rect.left +
                window.pageXOffset -
                menu.offsetWidth / 2 +
                rect.width / 2}px`;
            menu.style.visibility = "visible"
        }

        /**
         * If editor is out of focus or
         * selection is collapsed, hide the view
         */
        if (selection.isBlurred || selection.isCollapsed) {
            menu.style.visibility = "hidden"
        }
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
        } else if (event.key === "Enter") {
            /**
             * Overrides default enter operation to
             * not only splitBlock, but to also set
             * it to the default type `paragraph`
             */
            editor
                .splitBlock()
                .setBlocks('paragraph')
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
            case 'paragraph':
                return <p {...attributes} className="pb-2">{children}</p>
            default:
                return next()
        }
    }

    /**
     * On change, save the new `value`
     */
    onChange = ({ value }) => {
        this.setState({ value })
    }
}