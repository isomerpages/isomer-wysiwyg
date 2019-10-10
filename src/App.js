import React from 'react';
import ReactDOM from 'react-dom'
import './App.css';
import file from './test-files/sample-markdown.md'
import SimplePage from './layouts/SimplePage'
import './editor.scss'
import { Editor } from 'slate-react'
import { Value } from 'slate'
import marked from 'marked'
import { Button, Icon, Menu } from './components'
import Html from 'slate-html-serializer'
import pretty from 'pretty'
import rules from './htmlRules'
import plugins from './marks'
import { css } from 'emotion'

// Create a new serializer instance with our `rules` from above.
const html = new Html({ rules })

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

const MarkButton = ({ editor, type, icon }) => {
  const { value } = editor
  const isActive = value.activeMarks.some(mark => mark.type === type)
  return (
    <Button
      reversed
      active={isActive}
      onMouseDown={event => {
        event.preventDefault()
        editor.toggleMark(type)
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

const HoverMenu = React.forwardRef(({ editor }, ref) => {
  const root = window.document.getElementById('root')
  return ReactDOM.createPortal(
    <Menu
      ref={ref}
      className={css`
        padding: 8px 7px 6px;
        position: absolute;
        z-index: 1;
        top: -10000px;
        left: -10000px;
        margin-top: -6px;
        opacity: 0;
        background-color: #222;
        border-radius: 4px;
        transition: opacity 0.75s;
      `}
    >
      <MarkButton editor={editor} type="bold" icon="format_bold" />
      <MarkButton editor={editor} type="italic" icon="format_italic" />
      <MarkButton editor={editor} type="underline" icon="format_underlined" />
      <MarkButton editor={editor} type="code" icon="code" />
      <MarkButton editor={editor} type="strikethrough" icon="X" />
      <MarkButton editor={editor} type="header3" icon="h3" />
    </Menu>,
    root
  )
})

class App extends React.Component {
  state = {
    // initialize display pane with initial value
    chunk: '',// marked(initialValue.toJS().document.nodes[0].nodes[0].text),
    // initialize editor with initial value
    value: initialValue,
    init: '',
    menu: '',
  }

  fetchFile(file) {
    return fetch(file)
        .then((r) => r.text())
        // this is to set initial value to be our imported markdown
        .then((r) => {
          this.setState( { chunk: marked(r) } )
          // console.log(pretty(marked(r)))
          // console.log(pretty(html.serialize(html.deserialize(marked(r)))))
          // console.log(html.deserialize(marked(r)))
        })
        .then((r) => {
          window.init = this.state.init
        })
  }

  componentDidMount() {
    this.fetchFile(file)
    this.updateMenu()
  }

  componentDidUpdate = () => {
    this.updateMenu()
  }

  menuRef = React.createRef()

  /**
   * Update the menu's absolute position.
   */

  updateMenu = () => {
    const menu = this.menuRef.current
    if (!menu) return
    // console.log(this.menuRef)

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

  onEditorChange = (change) => {
    // const content = JSON.stringify(change.value.toJSON())
    // console.log(content)

    // this prevents trigger when only selections are made
    // if (change.value.document !== this.state.value.document) {
      console.log(change.value)

      // update the state to reflect new value on editor pane
      this.setState({ value: change.value })
      marked.setOptions({ sanitize: true })

      // update the state to reflect new value for display pane
      this.setState({ chunk: marked(change.value.document.text) })
    // }
  }

  displayEditor() {
    return (
      <div className="d-flex flex-row p-5 l-5">
        <div className="pane">
          <Editor 
            value={this.state.value}
            onChange={this.onEditorChange}
            renderEditor={this.renderEditor}
            renderMark={this.renderMark}
            plugins={plugins}
          />
        </div>
        {/* <div className="pane">
          <SimplePage chunk={this.state.chunk}/>
        </div> */}
      </div>
    );
  }

  render() {
    return this.displayEditor();
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
      case 'header3':
          return <h3>{props.children}</h3>
      default:
        return next()
    }
  }

  renderEditor = (props, editor, next) => {
    const children = next()
    return (
      <React.Fragment>
        {children}
        <HoverMenu ref={this.menuRef} editor={editor} />
      </React.Fragment>
    )
  }
}

export default App;
