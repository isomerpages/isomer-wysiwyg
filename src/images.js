import React from 'react'
import { css } from 'emotion'

/**
 * Image node renderer.
 *
 * @type {Component}
 */

class Image extends React.Component {

    /**
   * Render.
   *
   * @return {Element}
   */

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