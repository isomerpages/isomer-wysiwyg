import React from 'react';

function ParagraphNode(props) {
    return (
      <pre {...props.attributes}>
        <p {...props.attributes}>{props.children}</p>
      </pre>
    )
}

function HeaderOneNode(props) {
    return (
      <pre {...props.attributes}>
        <h1 {...props.attributes}>{props.children}</h1>
      </pre>
    )
}

function HeaderTwoNode(props) {
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
        return <HeaderOneNode {...props}/>
      default:
        return next()
    }
  }

export default renderBlock;