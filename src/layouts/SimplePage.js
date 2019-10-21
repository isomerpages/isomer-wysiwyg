import React, { Component } from 'react';
import '../test-files/isomer-template.scss';

export default class SimplePage extends Component {
    state = {
        cssLink: ""
    }

    componentDidMount() {
    }

    // This following template was taken from the 'Simple Page' Layout 
    nestWithinLayout = (chunk) => {
        return `<section class="bp-section"><div class="bp-container content padding--top--lg padding--bottom--xl"><div class="row"><div class="col is-8 is-offset-2 print-content">`
        + chunk + `</div></div></div></section>`
    }

    render() {
        return (
            <div dangerouslySetInnerHTML={{__html: this.nestWithinLayout(this.props.chunk)}}>
            </div>
        );
    }
}