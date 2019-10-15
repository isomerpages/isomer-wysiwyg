import React from 'react'
import { css } from 'emotion'


/**
 * Image node renderer.
 *
 * @type {Component}
 */

class Image extends React.Component {
  // componentDidMount() {
  //   console.log(this.props)
  //   const { node } = this.props
  //   const { data } = node
  //   const file = data.get('file')
  //   this.load(file)
  // }

  // load(file) {
  //   const reader = new FileReader()
  //   reader.addEventListener('load', () => this.setState({ src: reader.result }))
  //   reader.readAsDataURL(file)
  // }

  render() {
    const { attributes, isFocused } = this.props
    const { src } = this.props
    return src ? (
      <img {...attributes} src={src} alt='test' className={css`
      display: block;
      max-width: 100%;
      max-height: 20em;
      box-shadow: ${isFocused ? '0 0 0 2px blue;' : 'none'};`}/>
    ) : (
      <div {...attributes}>Loading...</div>
    )
  }
}

export default Image