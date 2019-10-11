import React from 'react';
import './App.css';
import file from './test-files/sample-markdown.md';
import SimplePage from './layouts/SimplePage';
import './editor.scss'
import RichTextEditor from './RichTextEditor'



class App extends React.Component {
  state = {
    chunk: "",
  }

  fetchFile() {
    return fetch(file)
        .then((r) => r.text())
  }
  
  displayEditor() {
    return (
      <div className="d-flex">
        <div className="pane p-5">
          <RichTextEditor/>
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
