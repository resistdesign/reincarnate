import T from 'prop-types';
import React, { PureComponent } from 'react';

export class ReincarnateWrapper extends PureComponent {
  static propTypes = {
    incarnate: T.object,
    component: T.func,
    path: T.string,
    routeProps: T.object
  };

  mounted = false;
  assigningProps = false;

  incarnate;
  component;
  path;
  routeProps;

  constructor () {
    super();
  }

  state = {
    componentProps: undefined
  };

  componentWillMount = () => {
    this.mounted = true;
    this.assignProps(this.props);
  };

  componentWillReceiveProps (nextProps) {
    this.assignProps(nextProps);
  }

  shouldComponentUpdate () {
    // TRICKY: DO NOT render while assigning props;
    return !this.assigningProps;
  }

  componentWillUnmount = () => {
    this.mounted = false;
    this.unListen(this.path);
  };

  unListen (path) {
    if (typeof path === 'string') {
      this.incarnate.removeInvalidationListener(
        path,
        this.onInvalid
      );
    }
  }

  listen (path) {
    if (typeof path === 'string') {
      this.incarnate.addInvalidationListener(
        path,
        this.onInvalid
      );
    }
  }

  async assignProps (props) {
    this.assigningProps = true;

    this.unListen(this.path);
    Object.assign(this, props);
    this.listen(this.path);

    const componentProps = await this.resolveProps();

    this.assigningProps = false;

    this.safeSetState({
      componentProps
    });
  }

  safeSetState (...args) {
    if (this.mounted) {
      this.setState(...args);
    }
  }

  onInvalid = () => {
    setTimeout(async () => {
      this.safeSetState({
        componentProps: await this.resolveProps()
      });
    }, 0);
  };

  resolveProps = async () => {
    this.incarnate.context = {
      props: this.routeProps,
      component: this.component
    };

    const resolvedProps = await this.incarnate.resolvePath(this.path);
    const unmappedProps = resolvedProps instanceof Map ?
      resolvedProps.get(this.component) :
      resolvedProps;

    return {
      children: this.routeProps.children,
      ...(unmappedProps instanceof Object ? unmappedProps : this.routeProps)
    };
  };

  render = () => {
    const { componentProps } = this.state;

    if (componentProps instanceof Object) {
      const WrappedComponent = this.component;

      return (
        <WrappedComponent
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

      return (
        <ReincarnateWrapper
          incarnate={this.incarnate}
          component={Component}
          path={PATH}
          routeProps={props}
        />
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
