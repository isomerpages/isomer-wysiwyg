import React from 'react';
import './App.css';
import SimpleMDE from 'simplemde';
import 'simplemde/dist/simplemde.min.css';
import file from './test-files/sample-markdown.md';
import SimplePage from './layouts/SimplePage';
import './editor.scss'

class App extends React.Component {
  state = {
    chunk: ""
  }

  fetchFile() {
    return fetch(file)
        .then((r) => r.text())
  }

  createEditor() {
    const editor = new SimpleMDE({ spellChecker : false, hideIcons : ["side-by-side", "fullscreen", "preview"] });
    
    this.fetchFile().then(value => {
      editor.value(value);
      this.setState({ chunk: editor.options.previewRender(editor.value()) });
    });

    editor.codemirror.on('change', () => {
      let formattedVal = editor.options.previewRender(editor.value())
      this.setState({ chunk: formattedVal })
    })
  }
  displayEditor() {
    return (
      <div className="d-flex flex-row">
        <div className="pane">
          <textarea id="editor"></textarea>
        </div>
        <div className="pane">
          <SimplePage chunk={this.state.chunk}/>
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.createEditor();

  }

  render() {
    return this.displayEditor();
  }
}

export default App;
