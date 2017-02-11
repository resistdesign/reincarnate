import React, { PureComponent, PropTypes as T } from 'react';

export default class Panel1 extends PureComponent {
  static propTypes = {
    funStuff: T.string
  };

  constructor () {
    super();
  }

  render = () => {
    const {
      funStuff,
      children
    } = this.props;

    return (
      <div>
        Panel 1 ({funStuff})
        {this.props.children}
      </div>
    );
  };
}
