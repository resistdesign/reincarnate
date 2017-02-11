import React, { PureComponent } from 'react';

export default class Reincarnate {
  incarnate;
  pathDelimiter = '/';
  pathAliasMap = {};

  constructor ({
    incarnate,
    pathDelimiter = '/',
    pathAliasMap = {}
  }) {
    this.incarnate = incarnate;
    this.pathDelimiter = pathDelimiter;
    this.pathAliasMap = pathAliasMap;
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

          PATH_LIST.push(pathPart || '');
        }

        if (r === props.route) {
          break;
        }
      }

      const JOINED_PATH = PATH_LIST.join(this.pathDelimiter);

      let PATH;

      // TRICKY: Some paths may contain the `incarnate` path delimiter so
      // use the `pathAliasMap` to replace them with a less complex
      // dependency name.
      if (
        this.pathAliasMap instanceof Object &&
        this.pathAliasMap.hasOwnProperty(JOINED_PATH) &&
        typeof this.pathAliasMap[JOINED_PATH] === 'string'
      ) {
        PATH = this.pathAliasMap[JOINED_PATH];
      } else {
        PATH = JOINED_PATH;
      }

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
          INCARNATE.context = {
            props,
            component: Component
          };
          const resolvedProps = await INCARNATE.resolvePath(PATH);
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
