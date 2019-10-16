import React from 'react';
import ReactDOM from 'react-dom'
import { Editor } from 'slate-react'
import { Block, Value } from 'slate'
import './App.scss';
import marked from 'marked'
import { Button, Icon, Menu } from './components'
import Html from 'slate-html-serializer'
import pretty from 'pretty'
import rules from './htmlRules'
import plugins from './marks'
import Image from './images'
import { css } from 'emotion'
// import btoa from 'btoa'
// import { request } from '@octokit/request'
// import { thisExpression } from '@babel/types';
// import SimplePage from './layouts/SimplePage'
// import file from './test-files/sample-markdown.md'

// Instantiate a new serializer instance with the imported rules
const html = new Html({ rules })

// set default node
const DEFAULT_NODE = 'paragraph'

// Github Credentials 
// const PERSONAL_ACCESS_TOKEN = 'redacted' // kwajiehao personal access token
// const USERNAME = 'kwajiehao' // user account which possesses the power to perform permissioned actions
// const CREDENTIALS = `${USERNAME}:${PERSONAL_ACCESS_TOKEN}`


// helper functions for links
function wrapLink(editor, href) {
  editor.wrapInline({
    type: 'link',
    data: { href },
  })

  editor.moveToEnd()
}

function unwrapLink(editor) {
  editor.unwrapInline('link')
}

// helper functions for images
function insertImage(editor, src, target) {
  if (target) {
    editor.select(target)
  }
  editor.insertBlock({
    type: 'image',
    data: { src },
  })

  editor.focus()
}

// helper functions for videos
function insertVideo(editor, src, target) {
  if (target) {
    editor.select(target)
  }

  editor.insertBlock({
    type: 'video-embed',
    data: { src },
  })

}


// editor's schema
const schema = {
  document: {
    last: { type: 'paragraph' },
    normalize: (editor, { code, node, child }) => {
      switch (code) {
        case 'last_child_type_invalid': {
          const paragraph = Block.create('paragraph')
          return editor.insertNodeByKey(node.key, node.nodes.size, paragraph)
        }
        default:
          return
      }
    },
  },
  blocks: {
    image: {
      isVoid: true,
    },
    'video-embed': {
      isVoid: true
    }
  },
}


// create initial value to read in
const initialValue = Value.fromJSON({
  document: {
    nodes: [
      {
        object: 'block',
        type: 'paragraph',
        nodes: [
          {
            object: 'text',
            text: `What's in a paragraph? Is it a word? or ...`,
          },
        ],
      },
    ],
  },
})


class App extends React.Component {

  render() {
    return this.displayEditor();
  }

  state = {
    // initialize display pane with initial value
    chunk: '', // marked(initialValue.toJS().document.nodes[0].nodes[0].text),
    
    // initialize editor with initial value
    value: initialValue,
    menu: '',
  }

  componentDidMount() {
    // this.fetchFile(file)
    this.updateMenu()
  }

  componentDidUpdate = () => {
    this.updateMenu()
  }

  fetchFile(file) {
    return fetch(file)
        .then((r) => r.text())
        // this is to set initial value to be our imported markdown
        .then((r) => {
          // set state for 
          this.setState( { chunk: pretty(html.serialize(html.deserialize(marked(r)))) } )// marked(r) } )
          
          // testing the serialization and deserialization
          // console.log(pretty(html.serialize(html.deserialize(marked(r)))))
          // console.log(html.deserialize(marked(r)))
        })
  }

  menuRef = React.createRef()

  /** 
  Menu elements
  */

  
  /**
   *
   * Marks
   * 
   */

  onClickMark = (editor, event, type) => {
      event.preventDefault()
      editor.toggleMark(type)
  }

  // checks whether the value selected has a mark
  hasMark = type => {
    const { value } = this.state
    return value.activeMarks.some(mark => mark.type === type)
  }

  // returns the html to render the mark button
  MarkButton = ({ editor, type, icon }) => {
    const isActive = this.hasMark(type)
    return (
      <Button
        reversed
        active={isActive}
        onMouseDown={event => {
          this.onClickMark(editor, event, type)
        }}
      >
        <Icon>{icon}</Icon>
      </Button>
    )
  }

  /*
  *
  * Blocks
  *
  */

  // checks whether the block is of a certain type
  hasBlock = type => {
    const { value } = this.state
    return value.blocks.some(node => node.type === type)
  }

  // toggles the block type

  onClickBlock = (editor, event, type) => {
    event.preventDefault()
    const { value } = editor
    const { document } = value

    // Handle everything but list buttons.
    if (type !== 'bulleted-list' && type !== 'numbered-list') {
      const isActive = this.hasBlock(type)
      const isList = this.hasBlock('list-item')

      editor.setBlocks(isActive ? DEFAULT_NODE : type)

      if (isList) {
        // if it's already a list, we want to unlist it
        editor
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list')
      } 

      if (type === 'video-embed') {
        const src = 'https://www.youtube.com/embed/6dPI5A_BSjM'
        if (!src) return
        editor.command(insertVideo, src)
      }

    } else {
      // Handle the extra wrapping required for list buttons.
      const parent = document.getParent(this.state.value.blocks.first().key)
      const isList = this.hasBlock('list-item')
      const isType = parent.type === type

      if (isList && isType) {
        // if it's already a list item, but you want to unlist it
        editor
          .setBlocks(DEFAULT_NODE)
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list')
      } else if (isList) {
        // if it's a list item but you want to switch to another type of list
        editor
          .unwrapBlock(
            type === 'bulleted-list' ? 'numbered-list' : 'bulleted-list'
          )
          .wrapBlock(type)
      } else {
        // if not yet a list item, make it a list item
        editor.setBlocks('list-item').wrapBlock(type)
      }
    }

    // refocus on editor
    // editor.focus()
  }


  // returns the code to render the block
  BlockButton = ({ editor, type, icon }) => {
    let isActive = this.hasBlock(type)
    if (['numbered-list', 'bulleted-list'].includes(type)) {
      const { value: { document, blocks } } = this.state

      if (blocks.size > 0) {
        const parent = document.getParent(blocks.first().key)
        isActive = this.hasBlock('list-item') && parent && parent.type === type
      }
    }

    // add a line for different kind of css 
    return (
      <Button
        reversed
        active={isActive}
        onMouseDown={event => {
          this.onClickBlock(editor, event, type)
        }}
      >
        <Icon>{icon}</Icon>
      </Button>
    )
  }

  /*
  *
  * Links
  * 
  */

  hasLinks = () => {
    const { value } = this.state
    return value.inlines.some(inline => inline.type === 'link')
  }

  onClickLink = async (editor, event) => {
    // prevent default behavior
    event.preventDefault()

    const { value } = editor
    const hasLinks = this.hasLinks()

    if (hasLinks) {
      // unwrap link if there's already a link
      editor.command(unwrapLink)
    } else if (value.selection.isExpanded) {
      // otherwise, add a link
      const href = await window.prompt('Enter the URL of the link:')

      if (href == null) {
        return
      }

      editor.command(wrapLink, href)
    } else {
      const href = window.prompt('Enter the URL of the link:')

      if (href == null) {
        return
      }

      const text = window.prompt('Enter the text for the link:')

      if (text == null) {
        return
      }

      editor
        .insertText(text)
        .moveFocusBackward(text.length)
        .command(wrapLink, href)
    }
  }

  LinksButton = ({ editor, event, icon}) => {
    let isActive = this.hasLinks()
    return (
      <Button 
        reversed
        active={isActive} 
        onMouseDown={event => {
          this.onClickLink(editor, event)
        }}
      >
        <Icon>{icon}</Icon>
      </Button>
    )
  }

  /*
  * Images
  */
    
  toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  })

  onFileUpload = async (editor, event) => {
    // prevent default behavior
    event.preventDefault()

    // load file to be uploaded
    const file = event.target.files[0]
    console.log(event)
    
    await this.setState({
      file: file,
      url: URL.createObjectURL(file)
    })

    // convert to base 64 to send to github
    // const result = await this.toBase64(this.state.file)

    // filler value for src
    const src = this.state.url

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

    // get the url from Github as src


    if (!src) return
    editor.command(insertImage, src)
  }

  // when the image button on our hover menu is clicked, it actually
  // clicks on the hidden button to let user upload a file
  onClickImageButton = () => {
    // click on hidden button
    document.getElementById('image-upload-input').click()
  }

  // image button
  ImageButton = ({ editor, icon}) => {
    return (
      <Button 
        reversed
        onMouseDown={this.onClickImageButton}
      >
        <input 
          id='image-upload-input' 
          hidden 
          type='file'
          onChange={event => this.onFileUpload(editor, event)}
        />
        <Icon>{icon}</Icon>
      </Button>
    )
  }

  /*
  * Menu
  */


  HoverMenu = React.forwardRef(({ editor }, ref) => {
    const root = window.document.getElementById('root')
    return ReactDOM.createPortal(
      <Menu
        ref={ref}
        className={css`
          padding: 5px 5px 5px;
          position: absolute;
          z-index: 1;
          top: -10000px;
          left: -10000px;
          margin-top: -3px;
          opacity: 0;
          background-color: #222;
          border-radius: 4px;
          transition: opacity 0.75s;
        `}
      >
        <this.MarkButton editor={editor} type="bold" icon="format_bold" />
        <this.MarkButton editor={editor} type="italic" icon="format_italic" />
        <this.MarkButton editor={editor} type="underline" icon="format_underlined" />
        <this.MarkButton editor={editor} type="code" icon="code" />
        <this.MarkButton editor={editor} type="strikethrough" icon="X" />
        <this.BlockButton editor={editor} type="header3" icon="h3" />
        <this.BlockButton editor={editor} type="video-embed" icon="video" />
        <this.BlockButton editor={editor} type="numbered-list" icon="numbered" />
        <this.BlockButton editor={editor} type="bulleted-list" icon="bullet" />
        <this.LinksButton editor={editor} icon="link" />
        <this.ImageButton editor={editor} icon="image" />
      </Menu>,
      root
    )
  })

  /**
   * Update the menu's absolute position on the screen
   */

  updateMenu = () => {
    const menu = this.menuRef.current
    if (!menu) return

    const { value } = this.state
    const { fragment, selection } = value
    
    if (selection.isBlurred || selection.isCollapsed || fragment.text === '') {
      menu.removeAttribute('style')
      return
    }

    const native = window.getSelection()
    const range = native.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    menu.style.opacity = 1
    menu.style.top = `${rect.top + window.pageYOffset - menu.offsetHeight}px`

    menu.style.left = `${rect.left +
      window.pageXOffset -
      menu.offsetWidth / 2 +
      rect.width / 2}px`
  }

  onEditorChange = ({ value }) => {
    // this prevents trigger when only selections are made
    // if (change.value.document !== this.state.value.document) {
    // console.log(change.value)

      // update the state to reflect new value on editor pane
      this.setState({ value })
     
      // this is for the right hand side display
      marked.setOptions({ sanitize: true })

      // update the state to reflect new value for display pane
      // this.setState({ chunk: marked(this.state.value.document.text) })
      // console.log(html.serialize(value))
    // }
  }

  displayEditor() {
    return (
      <div className="d-flex flex-row">
        <div className="pane">

          <Editor 
            value={this.state.value}
            onChange={this.onEditorChange}
            renderEditor={this.renderEditor}
            renderMark={this.renderMark}
            renderBlock={this.renderBlock}
            renderInline={this.renderInline}
            plugins={plugins}
            schema={schema}
            // onFocus={(event, editor, next) => {

            //   setTimeout(() => {
            //     console.log('editor is focused')
            //   });    
          
            //   return next();
            // }}
          />
        </div>
        {/* need to define serializers for list and other items */}
        {/* <div className="pane">
          <SimplePage chunk={this.state.chunk}/>
        </div>  */}
      </div>
    );
  }


  // Add a `renderMark` method to render marks.
  renderMark = (props, editor, next) => {
    switch (props.mark.type) {
      case 'bold':
        return <strong>{props.children}</strong>
      case 'code':
        return <code>{props.children}</code>
      case 'italic':
        return <em>{props.children}</em>
      case 'strikethrough':
        return <del>{props.children}</del>
      case 'underline':
        return <u>{props.children}</u>
      default:
        return next()
    }
  }

  renderBlock = (props, editor, next) => {
    const { attributes, children, node } = props
    switch (node.type) {
      case 'header3':
        return <h3 {...attributes}>{children}</h3>
      case 'bulleted-list':
        return <ul {...attributes} style={{listStyleType: 'square'}}>{children}</ul>
      case 'numbered-list':
          return <ol {...attributes}>{children}</ol>
      case 'list-item':
        return <li {...attributes}>{children}</li>
      case 'image': {
        const src = node.data.get('src')
        return <Image {...props} editor={editor} src={src}>{children}</Image>
      }
      case 'video-embed': {
        const src = node.data.get('src')
        return <iframe 
        {...attributes} 
        title='video'
        width='400' 
        height='250' 
        src={src}
        frameborder='0' 
        allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture' 
        allowfullscreen>
          {children}
        </iframe>
      }
      default:
        return next()
    }
  }

  // we will need a serializer for this as well - current implementation is not working
  renderInline = (props, editor, next) => {
    const { attributes, children, node } = props

    switch (node.type) {
      case 'link': 
        const { data } = node
        const href = data.get('href')
        return (
          <a {...attributes} onClick={() => window.open(href)} href={href}>
          {/* <a href={href}> */}
            {children}
          </a>
        )

      default: 
        return next()
    }
  }

  renderEditor = (props, editor, next) => {
    const children = next()
    return (
      <React.Fragment>
        {children}
        <this.HoverMenu ref={this.menuRef} editor={editor} />
      </React.Fragment>
    )
  }
}

export default App
