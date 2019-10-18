import React, { useState } from 'react'
import ReactDOM from 'react-dom'

const HoverMenu = React.forwardRef(({ editor }, ref) => {
    const root = document.getElementById('root')

		// react hook to hide and display textbox to enter links
		let [showLinkInput, setShowLinkInput] = useState(false)

		// react hook to decide whether textbox link is used for videos or for links
		let [isLink, setIsLink] = useState(false)


    const onLinkAlterKeyDown = async (event) => {
        if (event.key === "Enter") {
					// get url entered in text box
					let url = event.target.value

					// if it is a link
					if (isLink) {
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
					}
					else {
						if (!url) return // how to make this async?

						// parse the youtube embed url to ensure it can be displayed
							// for example, no `watch?`

						// insert video url
						await editor.command(insertMedia, url, 'video')
					}

					// stop displaying the link input
					setShowLinkInput(false)

					// there is no need to setIsLink because it is set at the menu level
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
										<UploadButton editor={editor} type='file-upload'>file</UploadButton>
										<UploadButton editor={editor} type='image'>image</UploadButton>
										<InlineButton editor={editor} setShowLinkInput={() => setShowLinkInput(true)} setIsLink={() => setIsLink(false)}>video</InlineButton>
                    <InlineButton editor={editor} setShowLinkInput={() => setShowLinkInput(true)} setIsLink={() => setIsLink(true)}>link</InlineButton>
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
										props.setIsLink()
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

		// for non-list blocks
    if (type !== 'ordered-list' && type !== 'bulleted-list') {
        editor.setBlocks(isActive ? 'paragraph' : type)

				// if already a list, unlist the block
        if (isList) {
            editor
                .unwrapBlock('ordered-list')
                .unwrapBlock('bulleted-list')
        }

		// for list blocks
    } else {
        let parent = document.getParent(editor.value.blocks.first().key)
        const isType = parent.type === type

				// if it's a list and the parent is the same type of list
        if (isList && isType) {
            editor
                .setBlocks('paragraph')
                .unwrapBlock('ordered-list')
								.unwrapBlock('bulleted-list')
				// list but parent is a different type of list
        } else if (isList) {
            editor
                .unwrapBlock(type === "bulleted-list" ? "ordered-list" : "bulleted-list")
								.wrapBlock(type)
				// list-ify it
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
const UploadButton = (props) => {
	const { editor, type } = props
	const buttonId = `upload-input-${type}`
	return (
		<button 
			className={'button-dead'}
			onMouseDown={() => {onClickUploadButton(buttonId)}}
		>
			{props.children}
			<input 
				id={buttonId}
				hidden 
				type='file'
				onChange={event => onFileUpload(editor, event, type)}
			/>
		</button>
	)
}

// function to click on the hidden image upload button
const  onClickUploadButton = (buttonId) => {
		// click on hidden button
		document.getElementById(buttonId).click()
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

const onFileUpload = async (editor, event, type) => {	
	// prevent default behavior
	event.preventDefault()

	// load file to be uploaded
	const file = await event.target.files[0]

	// get the local url to be referenced to generate a preview
	// and set as src
	const src = URL.createObjectURL(file)

		
	if (type === 'image') {
		console.log('we reached here')
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

		if (!src) return // how to make this async?
		await editor.command(insertMedia, src, type)

	}

	if (type === 'file-upload') {
		// create a link to the file
		editor
		.wrapInline({
				type : 'link',
				data: {
						href : src
				}
		})
		.moveToEnd()
		.focus()
	}

	// reset input value so that the same file can be uploaded twice!
	document.getElementById(`upload-input-${type}`).value = null
}

/*
	File Upload
*/

export { HoverMenu };