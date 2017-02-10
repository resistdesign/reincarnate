import React, { PureComponent, PropTypes as T } from 'react';

export default class Panel1 extends PureComponent {
  static propTypes = {};

  constructor () {
    super();
  }

  render = () => {
    return (
      <div>
        Panel 1
        {this.props.children}
      </div>
    );
  };
}
