import React, { PureComponent, PropTypes as T } from 'react';

export default class ReincarnateDemo extends PureComponent {
  static propTypes = {
    title: T.string
  };

  constructor () {
    super();
  }

  render = () => {
    const {
      title,
      children
    } = this.props;

    return (
      <div>
        <h1>
          {title}
        </h1>
        {children}
      </div>
    );
  };
}
