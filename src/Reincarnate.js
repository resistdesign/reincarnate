import React, { PureComponent } from 'react';

export default class Reincarnate {
  incarnate;
  pathDelimiter = '/';

  constructor ({
    incarnate,
    pathDelimiter = '/'
  }) {
    this.incarnate = incarnate;
    this.pathDelimiter = pathDelimiter
  }

  createElement = (Component, props) => {
    if (
      Component instanceof Function &&
      props instanceof Object &&
      props.route instanceof Object &&
      props.routes instanceof Array &&
      this.incarnate instanceof Object &&
      this.incarnate.resolvePath instanceof Function &&
      this.incarnate.addInvalidationListener instanceof Function &&
      this.incarnate.removeInvalidationListener instanceof Function
    ) {
      const INCARNATE = this.incarnate;
      const PATH_LIST = [];

      // TRICKY: Get the props for the specific point in the path
      // that the current route represents.
      for (let i = 0; i < props.routes.length; i++) {
        const r = props.routes[i];

        if (r instanceof Object) {
          const pathPart = r.path === this.pathDelimiter ? '' : r.path;

          PATH_LIST.push(pathPart);
        }

        if (r === props.route) {
          break;
        }
      }

      const PATH = PATH_LIST.join(this.pathDelimiter);

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
