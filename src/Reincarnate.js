import React, { PureComponent } from 'react';

export default class Reincarnate {
  incarnate;

  constructor ({ incarnate }) {
    this.incarnate = incarnate;
  }

  createElement = (Component, props) => {
    if (
      Component instanceof Function &&
      props instanceof Object &&
      props.route instanceof Object &&
      typeof props.route.path === 'string' &&
      this.incarnate instanceof Object &&
      this.incarnate.resolvePath instanceof Function &&
      this.incarnate.addInvalidationListener instanceof Function &&
      this.incarnate.removeInvalidationListener instanceof Function
    ) {
      const PATH = props.route.path;
      const INCARNATE = this.incarnate;

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
          const resolvedProps = await INCARNATE.resolvePath(
            PATH,
            {
              props,
              component: Component
            }
          );
          const unmappedProps = resolvedProps instanceof Map ?
            resolvedProps.get(Component) :
            resolvedProps;
          const componentProps = {
            children: props.children,
            ...(unmappedProps instanceof Object ? unmappedProps : props)
          };

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
    } else if (Component instanceof Function) {
      return (
        <Component
          {...props}
        />
      );
    }
  };
}
