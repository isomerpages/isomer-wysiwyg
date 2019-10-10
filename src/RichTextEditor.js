import React, { Component } from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate';

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
    render() {
       return (
        <Editor
            value={this.state.value}
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
            renderMark={this.renderMark}
        />
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
        } else {
            return next()
        }

        event.preventDefault()
        editor.toggleMark(mark)
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
     * On change, save the new `value`
     */
    onChange = ({ value }) => {
        console.log(value.toJS())
        this.setState({ value })
    }
}