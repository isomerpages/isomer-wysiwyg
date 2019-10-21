import React from 'react';

const BLOCK_TAGS = {
  blockquote: 'quote',
  p: 'paragraph',
  a: 'link',
  b: 'semi-bold',
  h3: 'header3',
  pre: 'code',
  ul: 'bulleted-list',
  ol: 'numbered-list',
  li: 'list-item',
  table: 'table',
  tr: 'table-row',
  th: 'table-header',
  td: 'table-entry',
  div: 'division',
}

// Add a dictionary of mark tags.
const MARK_TAGS = {
  em: 'italic',
  strong: 'bold',
  u: 'underline',
}

export const rules = [
  {
    deserialize(el, next) {
      const tag = el.tagName.toLowerCase()
      const type = BLOCK_TAGS[tag]
    
      if (type) {
        return {
          object: 'block',
          type: type,
          data: {
            className: el.getAttribute('class'),
            href: el.getAttribute('href'),
            idName: el.getAttribute('id'),
            // what else should we include? we can discrmiminate more based on type instead of returning one template for all
          },
          nodes: next(el.childNodes),
        }
      } 

    },
    serialize(obj, children) {
      if (obj.object === 'block') {
        switch (obj.type) {
          case 'paragraph':
            // we can inclde class or id data inside the slate data object
            return <p className={obj.data.get('className')} id={obj.data.get('idName')}>{children}</p>
          case 'link': // problem serializing links
            return <a href={obj.data.get('href')}>{children}</a>
          case 'semi-bold':
            return <b>{children}</b>
          case 'header3':
            return <h3 id={obj.data.get('idName')}>{children}</h3>
          case 'quote':
            return <blockquote>{children}</blockquote>
          case 'bulleted-list':
            return <ul>{children}</ul>
          case 'numbered-list':
            return <ol>{children}</ol>
          case 'list-item':
            return <li>{children}</li>
          case 'table':
            return <table className={obj.data.get('className')}>{children}</table>
            // default implementation: https://github.com/jasonphillips/slate-deep-table/blob/master/lib/defaultSerializers.js
          case 'table-row':
            return <tr>{children}</tr>
          case 'table-entry':
            return <td>{children}</td>
          default:
            return
        }
      }
    },
  },
  // Add a new rule that handles marks...
  {
    deserialize(el, next) {
      const type = MARK_TAGS[el.tagName.toLowerCase()]
      if (type) {
        return {
          object: 'mark',
          type: type,
          nodes: next(el.childNodes),
        }
      }
    },
    serialize(obj, children) {
      if (obj.object === 'mark') {
        switch (obj.type) {
          case 'bold':
            return <strong>{children}</strong>
          case 'italic':
            return <em>{children}</em>
          case 'underline':
            return <u>{children}</u>
          case 'code':
              return (
                <pre>
                  <code>{children}</code>
                </pre>
              )
          default:
            return
        }
      }
    },
  },
]

export default rules
