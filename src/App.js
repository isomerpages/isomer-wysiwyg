import React from 'react';
import './App.css';
import file from './test-files/sample-markdown.md';
import SimplePage from './layouts/SimplePage';
import './editor.scss'
import { Editor } from 'slate-react';
import { Value } from 'slate';
import SoftBreak from 'slate-soft-break';
import marked from 'marked';

const plugins = [
  SoftBreak()
]
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
    chunk: "",
    editorValue: initialValue
  }

  fetchFile() {
    return fetch(file)
        .then((r) => r.text())
  }
  onEditorChange = (change) => {
    console.log(change.value.document);
    this.setState({ editorValue: change.value })
    marked.setOptions({ sanitize: true })
    this.setState({ chunk: marked(change.value.document.text) })

  }

  displayEditor() {
    return (
      <div className="d-flex flex-row">
        <div className="pane">
          <Editor 
            value={this.state.editorValue}
            onChange={this.onEditorChange}  
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
}

export default App;
