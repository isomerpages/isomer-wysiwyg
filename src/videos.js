import React from 'react'

/**
 * An video embed component.
 *
 * @type {Component}
 */

class Video extends React.Component {

  /**
   * Render.
   *
   * @return {Element}
   */

  render() {
    // const { isSelected } = this.props

    return (
      <div {...this.props.attributes}>
        {this.renderVideo()}
      </div>
    )
  }

  /**
   * Render the Youtube iframe, responsively.
   *
   * @return {Element}
   */

  renderVideo = () => {
    const { node, isFocused } = this.props
    const video = node.data.get('src')

    const wrapperStyle = {
      position: 'relative',
      outline: isFocused ? '2px solid blue' : 'none',
    }

    const maskStyle = {
      display: isFocused ? 'none' : 'block',
      position: 'absolute',
      top: '0',
      left: '0',
      height: '100%',
      width: '100%',
      cursor: 'cell',
      zIndex: 1,
    }

    const iframeStyle = {
      display: 'block',
    }

    return (
      <div style={wrapperStyle}>
        <div style={maskStyle} />
        <iframe
          title='videoplayer'
          id="ytplayer"
          type="text/html"
          width="400"
          height="250"
          src={video}
          frameBorder="0"
          style={iframeStyle}
        />
      </div>
    )
  }
}

/**
 * Export.
 */

export default Video