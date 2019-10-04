import React from 'react';
// import logo from './logo.svg';
import './App.css';
import SimpleMDE from 'simplemde';
import 'simplemde/dist/simplemde.min.css'
import file from './test-files/pages/privacy.md'
import utils from './utils'
// import htmlFile from './test-files/layouts/simple-page.html'

class App extends React.Component {
  
  async componentDidMount() {
    // load editor
    const editor = new SimpleMDE()
    editor.toggleSideBySide()
   
    // load editor with file 
    const result = await fetch(file)
    const markdown = await result.text()
  
    // parse the content
    const markdownOutput = utils.frontMatterParser(markdown)

    // test
    console.log(markdownOutput.configObj)
    console.log(file)
    // console.log(htmlFile)

    // load the editor with the original text
    editor.value(markdownOutput.content)

    // 
    editor.codemirror.on('change', () => {
      console.log('a')
    })

    // editor.value(marked(result))
    /*
    fetch(testFilePath)
    .then(response => {
      console.log(response.text())
      return response.text()
    })
    .then(text => {
      this.setState({
        markdown: marked(text)
      })
    })
    */
    
  }

  render() {

    return (
      <textarea rows="4" cols="50"></textarea>
    )
  }
}

export default App;
