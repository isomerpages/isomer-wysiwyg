import React from 'react';

function ParagraphNode(props) {
    return (
      <pre {...props.attributes}>
        <p {...props.attributes}>{props.children}</p>
      </pre>
    )
}

function Header1Node(props) {
    return (
      <pre {...props.attributes}>
        <h1 {...props.attributes}>{props.children}</h1>
      </pre>
    )
}

function Header2Node(props) {
    return (
      <pre {...props.attributes}>
        <h2 {...props.attributes}>{props.children}</h2>
      </pre>
    )
}

function renderBlock(props, editor, next) {
    switch (props.node.type) {
      case 'paragraph':
        return <ParagraphNode {...props}/>
    case 'h1':
        return <Header1Node {...props}/>
      default:
        return next()
    }
  }

export default renderBlock;