import T from 'prop-types';
import React, {PureComponent} from 'react';
import Incarnate from 'incarnate';

export const PATHS = {
  ROUTE_CONTEXT: 'ROUTE_CONTEXT',
  PROPS: 'PROPS',
  COMPONENT: 'COMPONENT'
};

export function getRouteContextPath(propName, pathDelimiter = '.') {
  const {ROUTE_CONTEXT} = PATHS;

  return [ROUTE_CONTEXT, propName].join(pathDelimiter);
}

export class ReincarnateWrapper extends PureComponent {
  static propTypes = {
    incarnate: T.object,
    component: T.func,
    path: T.string,
    routeProps: T.object,
    multiComponentKey: T.string,
    childComponentMap: T.object,
    onResolveError: T.func
  };

  mounted = false;
  assigningProps = false;

  incarnate;
  component;
  path;
  routeProps;
  multiComponentKey;
  childComponentMap;
  onResolveError;

  constructor() {
    super();
  }

  state = {
    componentProps: undefined
  };

  componentWillMount = () => {
    this.mounted = true;
    this.assignProps(this.props);
  };

  componentWillReceiveProps(nextProps) {
    this.assignProps(nextProps);
  }

  shouldComponentUpdate() {
    // TRICKY: DO NOT render while assigning props;
    return !this.assigningProps;
  }

  componentWillUnmount = () => {
    this.mounted = false;
    this.unListen(this.path);
  };

  unListen(path) {
    if (typeof path === 'string') {
      this.incarnate.removeEventListener(
        Incarnate.EVENTS.PATH_CHANGE,
        this.onPathChange
      );
      this.incarnate.removeEventListener(
        Incarnate.EVENTS.ERROR,
        this.handleResolveError
      );
    }
  }

  listen(path) {
    if (typeof path === 'string') {
      this.incarnate.addEventListener(
        Incarnate.EVENTS.PATH_CHANGE,
        this.onPathChange
      );
      this.incarnate.addEventListener(
        Incarnate.EVENTS.ERROR,
        this.handleResolveError
      );
    }
  }

  assignProps(props) {
    this.assigningProps = true;

    this.unListen(this.path);
    Object.assign(this, props);
    this.listen(this.path);

    // Setup the route context.
    // TRICKY: IMPORTANT: Only do this while NOT listening for changes to avoid an infinite loop.
    this.incarnate.setPath(
      getRouteContextPath(PATHS.PROPS, this.incarnate.pathDelimiter),
      this.routeProps
    );
    this.incarnate.setPath(
      getRouteContextPath(PATHS.COMPONENT, this.incarnate.pathDelimiter),
      this.component
    );

    const componentProps = this.resolveProps();

    this.assigningProps = false;

    if (componentProps instanceof Object) {
      this.safeSetState({
        componentProps
      });
    }
  }

  safeSetState(...args) {
    if (this.mounted) {
      this.setState(...args);
    }
  }

  onPathChange = (path) => {
    if (path === this.path) {
      const componentProps = this.resolveProps();

      if (componentProps instanceof Object) {
        this.safeSetState({
          componentProps
        });
      }
    }
  };

  handleResolveError = (data) => {
    if (this.onResolveError instanceof Function) {
      this.onResolveError(data);
    }
  };

  resolveProps = () => {
    try {
      const resolvedProps = this.incarnate.getPath(this.path);
      const unmappedProps = typeof this.multiComponentKey === 'string' && resolvedProps instanceof Object ?
        resolvedProps[this.multiComponentKey] :
        resolvedProps;

      const baseProps = unmappedProps instanceof Object ? unmappedProps : this.routeProps;

      if (this.childComponentMap instanceof Object) {
        return {
          ...(Object.keys(this.childComponentMap).reduce((acc, childComponentSectionKey) => {
            acc[childComponentSectionKey] = this.routeProps[childComponentSectionKey];

            return acc;
          }, {})),
          ...baseProps
        };
      } else {
        return {
          children: this.routeProps.children,
          ...baseProps
        };
      }
    } catch (error) {
      return undefined;
    }
  };

  render = () => {
    const {componentProps} = this.state;

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
  onResolveError;

  constructor({
                incarnate,
                pathDelimiter = '/',
                pathAliasMap = {},
                onResolveError
              }) {
    this.incarnate = incarnate;
    this.pathDelimiter = pathDelimiter;
    this.pathAliasMap = pathAliasMap;
    this.onResolveError = onResolveError;
  }

  createElement = (Component, props) => {
    if (
      Component instanceof Function &&
      props instanceof Object &&
      props.route instanceof Object &&
      props.routes instanceof Array &&
      this.incarnate instanceof Incarnate
    ) {
      const {key: multiComponentKey, route: routeConfig = {}} = props || {};
      const {components: componentMap} = routeConfig;
      const cleanMultiComponentKey = componentMap instanceof Object ? multiComponentKey : undefined;
      const PATH_LIST = [];

      let pathListComplete = false,
        directChildRoute;

      // TRICKY: Get the props for the specific point in the path
      // that the current route represents.
      for (let i = 0; i < props.routes.length; i++) {
        const r = props.routes[i];

        if (pathListComplete) {
          directChildRoute = r;

          break;
        } else {
          if (r instanceof Object) {
            const pathPart = r.path === this.pathDelimiter ? '' : r.path;

            PATH_LIST.push(pathPart || '');
          }

          if (r === props.route) {
            pathListComplete = true;
          }
        }
      }

      const {components: childComponentMap} = directChildRoute || {};

      let JOINED_PATH = PATH_LIST.join(this.pathDelimiter);
      // TRICKY: Correct for the root path.
      JOINED_PATH = JOINED_PATH === '' ? this.pathDelimiter : JOINED_PATH;

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
          key={`ReincarnateWrapper:${PATH}`}
          incarnate={this.incarnate}
          component={Component}
          path={PATH}
          routeProps={props}
          multiComponentKey={cleanMultiComponentKey}
          childComponentMap={childComponentMap}
          onResolveError={this.onResolveError}
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
