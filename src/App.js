import React from 'react';
import './App.css';
import file from './test-files/sample-markdown.md';
import SimplePage from './layouts/SimplePage';
import './editor.scss'
import { Editor } from 'slate-react';
import { Value } from 'slate';
import marked from 'marked';
import Html from 'slate-html-serializer'
import pretty from 'pretty'
import rules from 'htmlRules'
import plugins from 'marks'

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

class App extends React.Component {
  state = {
    // initialize display pane with initial value
    chunk: '',// marked(initialValue.toJS().document.nodes[0].nodes[0].text),
    // initialize editor with initial value
    editorValue: initialValue,
    init: '',
  }

  fetchFile(file) {
    return fetch(file)
        .then((r) => r.text())
        // this is to set initial value to be our imported markdown
        .then((r) => {
          this.setState( { chunk: marked(r) } )
          // console.log(marked(r))
          console.log(pretty(html.serialize(html.deserialize(marked(r)), {ocd: true})))
        })
        .then((r) => {
          window.init = this.state.init
        })
  }

  componentDidMount() {
    this.fetchFile(file)
  }

  onEditorChange = (change) => {
    // const content = JSON.stringify(change.value.toJSON())
    // console.log(content)

    // this prevents trigger when only selections are made
    if (change.value.document !== this.state.editorValue.document) {
      console.log(change.value)

      // update the state to reflect new value on editor pane
      this.setState({ editorValue: change.value })
      marked.setOptions({ sanitize: true })

      // update the state to reflect new value for display pane
      this.setState({ chunk: marked(change.value.document.text) })
    }
  }

  displayEditor() {
    return (
      <div className="d-flex flex-row">
        <div className="pane">
          <Editor 
            value={this.state.editorValue}
            onChange={this.onEditorChange}
            // onKeyDown={this.onKeyDown} 
            // renderBlock={this.renderBlock} 
            renderMark={this.renderMark}
            plugins={plugins}
          />
        </div>
        <div className="pane">
          <SimplePage chunk={this.state.chunk}/>
        </div>
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
      default:
        return next()
    }
  }
}

export default App;
