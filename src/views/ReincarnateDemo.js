import React, { PureComponent, PropTypes } from 'react';

export default class ReincarnateDemo extends PureComponent {
  constructor () {
    super();
  }

  render = () => {
    const { children } = this.props;

    return (
      <div>
        <h1>
          Reincarnate Demo
        </h1>
        {children}
      </div>
    );
  };
}
