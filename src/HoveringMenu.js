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
										<ImageButton editor={editor}>image</ImageButton>
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

/*
	Images
*/
const ImageButton = (props) => {
	const { editor } = props
	return (
		<button 
			className={'button-dead'}
			onMouseDown={onClickImageButton}
		>
			<input 
				id='image-upload-input' 
				hidden 
				type='file'
				onChange={event => onImageUpload(editor, event)}
			/>
			{props.children}
		</button>
	)
}

const  onClickImageButton = () => {
		// click on hidden button
		document.getElementById('image-upload-input').click()
}

// helper function to insert images or videos
const insertMedia = (editor, src, type, target) => {
  if (target) {
    editor.select(target)
  }

  editor.insertBlock({
    type,
    data: { src },
  })

  // set block type to ensure video becomes void
  editor.setBlocks(type)

  // set focus back to editor
  editor.focus()
}

// const toBase64 = file => new Promise((resolve, reject) => {
// 	const reader = new FileReader();
// 	reader.readAsDataURL(file);
// 	reader.onload = () => resolve(reader.result);
// 	reader.onerror = error => reject(error);
// })

const onImageUpload = async (editor, event) => {	
	// prevent default behavior
	event.preventDefault()

	// load file to be uploaded
	const file = await event.target.files[0]

	// get the local url to be referenced to generate a preview
	// and set as src
	const src = await URL.createObjectURL(file)

	// need to convert to base 64 to send to github
	// const result = await this.toBase64(this.state.file)

	// upload to Github
	// try {
	//   await request('PUT /repos/:owner/:repo/contents/:path', {
	//     owner: 'kwajiehao',
	//     repo: 'telegram_kwabot',
	//     path: 'hello.jpg',
	//     message: 'Uploaded image',
	//     content: result.replace(/data:.+\/.+;base64,/, ''),
	//     committer: {
	//       name: 'Kwa Jie Hao',
	//       email: 'kwajiehao@gmail.com'
	//     },
	//     headers: {
	//       authorization: `basic ${btoa(CREDENTIALS)}`
	//     },
	//   })
	// } catch (err) {
	//   console.log(err)
	// }

	// get the url from Github and save as src


	if (!src) return
	await editor.command(insertMedia, src, 'image')

	// reset input value so that the same file can be uploaded twice!
	document.getElementById('image-upload-input').value = null
}


export { HoverMenu };