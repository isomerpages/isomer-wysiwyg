const BLOCK_TAGS = {
  blockquote: 'quote',
  p: 'paragraph',
  a: 'hyperlink',
  pre: 'code',
  ul: 'unordered-list',
  ol: 'ordered-list',
  li: 'list',
  tr: 'table-row',
  td: 'table-entry',
}

// Add a dictionary of mark tags.
const MARK_TAGS = {
  em: 'italic',
  strong: 'bold',
  u: 'underline',
  h3: 'header3',
}

export const rules = [
  {
    deserialize(el, next) {
      const type = BLOCK_TAGS[el.tagName.toLowerCase()]
      if (type) {
        return {
          object: 'block',
          type: type,
          data: {
            className: el.getAttribute('class'),
            href: el.getAttribute('href'),
          },
          nodes: next(el.childNodes),
        }
      }
    },
    serialize(obj, children) {
      if (obj.object === 'block') {
        switch (obj.type) {
          case 'code':
            return (
              <pre>
                <code>{children}</code>
              </pre>
            )
          case 'paragraph':
            // we can inclde class or id data inside the slate data object
            return <p className={obj.data.get('className')}>{children}</p>
          case 'hyperlink':
             return <a href={obj.data.get('href')}>{children}</a>
          case 'quote':
            return <blockquote>{children}</blockquote>
          case 'unordered-list':
            return <ul>{children}</ul>
          case 'ordered-list':
            return <ol>{children}</ol>
          case 'list':
            return <li>{children}</li>
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
          case 'header3':
            return <h3>{children}</h3>
          default:
            return
        }
      }
    },
  },
]
