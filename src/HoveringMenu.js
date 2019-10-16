import React, { useState } from 'react'
import ReactDOM from 'react-dom'


const HoverMenu = React.forwardRef(({ editor }, ref) => {
    const root = document.getElementById('root')

    let [showLinkInput, setShowLinkInput] = useState(false)


    const onLinkAlterKeyDown = (event) => {
        if (event.key === "Enter") {
            let url = event.target.value
            event.preventDefault()
            editor
                .wrapInline({
                    type : 'link',
                    data: {
                        href : url
                    }
                })
                .moveToEnd()
                .focus()
            setShowLinkInput(false)
        }
    }

    return ReactDOM.createPortal(
        <Menu ref={ref}>
            { showLinkInput ? 
                <input
                    type="text" id="linkInput"
                    onKeyDown={onLinkAlterKeyDown}
                    onBlur={() => {setShowLinkInput(false)}}
                    autoComplete="off"
                /> : 
                <React.Fragment>
                    <MarkButton editor={editor} type='bold'>bold</MarkButton>
                    <MarkButton editor={editor} type='italic'>italic</MarkButton>
                    <MarkButton editor={editor} type='underlined'>underlined</MarkButton>
                    <HeadingButton editor={editor} type='heading-one'>H1</HeadingButton>
                    <HeadingButton editor={editor} type='heading-two'>H2</HeadingButton>
                    <HeadingButton editor={editor} type='block-quote'>quote</HeadingButton>
                    <HeadingButton editor={editor} type='ordered-list'>list</HeadingButton>
                    <HeadingButton editor={editor} type='bulleted-list'>bullet</HeadingButton>
                    <InlineButton editor={editor} setShowLinkInput={() => setShowLinkInput(true)}>link</InlineButton>
                </React.Fragment>
            }
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

const InlineButton = (props) => {
    let { editor } = props
    const hasLink = editor.value.inlines.some(node => node.type === "link")

    return (
        <button
            className={hasLink ? "button-active" : 'button-dead'}
            onMouseDown={(event) => {
                if (hasLink) {
                    editor.unwrapInline({
                        type : 'link'
                    })
                } else {
                    props.setShowLinkInput()
                }
                event.preventDefault()
            }}
        >
            {props.children}
        </button>
    );
}

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
    const { editor, type } = props
    let { value } = editor
    let { document } = value
    let isActive = value.blocks.some(node => node.type === type)

    if (value.blocks.size > 0) {
        let parent = document.getParent(value.blocks.first().key)
        if (parent && ['ordered-list', 'bulleted-list'].includes(parent.type)) {
            isActive = type === parent.type
        }
    }

    const className = isActive ? "button-active" : "button-dead"

    return (
        <button
            className={className}
            onMouseDown={(event) => onHeadingClick(event, editor, type)}
        >
            {props.children}
        </button>
    )
}

const onHeadingClick = (event, editor, type) => {
    const { document } = editor.value
    const isActive = editor.value.blocks.some(node => node.type === type)
    const isList = editor.value.blocks.some(node => node.type === "list-item")

    if (type !== 'ordered-list' && type !== 'bulleted-list') {
        editor.setBlocks(isActive ? 'paragraph' : type)

        if (isList) {
            editor
                .unwrapBlock('ordered-list')
                .unwrapBlock('bulleted-list')
        }

    } else {
        let parent = document.getParent(editor.value.blocks.first().key)
        const isType = parent.type === type
    
        if (isList && isType) {
            editor
                .setBlocks('paragraph')
                .unwrapBlock('ordered-list')
                .unwrapBlock('bulleted-list')
        } else if (isList) {
            editor
                .unwrapBlock(type === "bulleted-list" ? "ordered-list" : "bulleted-list")
                .wrapBlock(type)
        } else {
            editor
                .setBlocks('list-item')
                .wrapBlock(type)
        }
    }

    event.preventDefault()
}

export { HoverMenu };