import React from 'react';
// import logo from './logo.svg';
import './App.css';
import SimpleMDE from 'simplemde';
import 'simplemde/dist/simplemde.min.css'
import file from './test-files/pages/privacy.md'

class App extends React.Component {
  yamlParser (markdownFile) {
    // format file to extract yaml front matter
    const contents = markdownFile.split('---')
    const articleConfig = contents[1]
    const articleContent = contents[2]

    // parse yaml and retrieve the attributes like layout etc.
    const resultsArr = articleConfig.split('\n').map(curr => {
      if (curr !== '') {
        return {
          [curr.split(': ')[0]]: curr.split(': ')[1]
        }
      } else {
        return null
      }
    }).filter(function (el) {
      return el != null;
    })

    // get the configs all in one object
    var configObj = {}
    for (var i = 0; i < resultsArr.length; i++) {
      configObj = Object.assign(configObj, resultsArr[i])
    }

    return {
      configObj,
      content: articleContent
    }
  }
  
  async componentDidMount() {
    // load editor
    const editor = new SimpleMDE()
    editor.toggleSideBySide()
   
    // load editor with file 
    const result = await fetch(file)
    const markdown = await result.text()
  
    // parse the content
    const markdownOutput = this.yamlParser(markdown)

    // test
    console.log(markdownOutput.configObj)

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
