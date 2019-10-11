import React, { Component } from 'react'
import ReactDOM from 'react-dom'


const HoverMenu = React.forwardRef(({ editor }, ref) => {
    const root = document.getElementById('root')
    return ReactDOM.createPortal(
        <Menu ref={ref}>
            <MarkButton editor={editor} type='bold'>bold</MarkButton>
            <MarkButton editor={editor} type='italic'>italic</MarkButton>
            <MarkButton editor={editor} type='underlined'>underlined</MarkButton>
            <HeadingButton editor={editor} type='heading-one'>H1</HeadingButton>
        </Menu>
    , root)
})

const Menu = React.forwardRef((props, ref) => {
    return (
        <div ref={ref} style={{ position: "absolute", zIndex: 100000 }}>
            {props.children}
        </div>
    )
})

const MarkButton = (props) => {
    let { editor, type } = props
    let activeMarks = editor.value.activeMarks
    let isActive = activeMarks.some(node => node.type === type)
    let className = isActive ? "button-active" : "button-dead"

    return (
        <button
            className={className}
            onMouseDown={(event) => {
                editor.toggleMark(type)
                event.preventDefault()
            }}
        >
            {props.children}
        </button>
    )
}

const HeadingButton = (props) => {
    let { editor, type } = props
    let isActive = editor.value.blocks.some(node => node.type === type)
    let className = isActive ? "button-active" : "button-dead"

    return (
        <button
            className={className}
            onMouseDown={(event) => {
                if (!isActive) {
                    editor.setBlocks(type)
                } else {
                    editor.setBlocks('paragraph')
                }
                event.preventDefault()
            }}
        >
            {props.children}
        </button>
    )
}

export { HoverMenu };