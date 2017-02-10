import React, { PureComponent } from 'react';

export default class Reincarnate {
  incarnate;

  constructor ({ incarnate }) {
    this.incarnate = incarnate;
  }

  createElement = (Component, props) => {
    if (
      props instanceof Object &&
      props.route instanceof Object &&
      typeof props.route.path === 'string' &&
      this.incarnate instanceof Object &&
      this.incarnate.resolvePath instanceof Function
    ) {
      const INCARNATE = this.incarnate;
      const PATH = props.route.path;

      class Wrapper extends PureComponent {
        constructor () {
          super();
        }

        state = {
          componentProps: undefined
        };

        componentWillMount = () => {
          INCARNATE.addInvalidationListener(
            PATH,
            this.resolveProps
          );
          this.resolveProps();
        };

        componentWillUnmount = () => {
          INCARNATE.removeInvalidationListener(
            PATH,
            this.resolveProps
          );
        };

        resolveProps = async () => {
          const componentProps = await this.incarnate.resolvePath(
            props.route.path,
            props
          );

          this.setState({
            componentProps
          });
        };

        render = () => {
          const { componentProps } = this.state;

          if (componentProps instanceof Object) {
            return (
              <Component
                {...componentProps}
              />
            );
          } else {
            return (
              <span>
              </span>
            );
          }
        };
      }

      return (
        <Wrapper/>
      );
    }
  };
}
