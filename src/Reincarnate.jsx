import React from 'react';
import IncarnateInternal, {
  LifePod as LifePodInternal,
  HashMatrix as HashMatrixInternal
} from 'incarnate';
import ReincarnateWrapperInternal, {PATHS} from './ReincarnateWrapper';
import getDefaultRuntimeSubMap from './getDefaultRuntimeSubMap';

/**
 * @see http://incarnate.resist.design/class/src/HashMatrix.jsx~HashMatrix.html
 * */
export const HashMatrix = HashMatrixInternal;
/**
 * @see http://incarnate.resist.design/class/src/LifePod.jsx~LifePod.html
 * */
export const LifePod = LifePodInternal;
/**
 * @see http://incarnate.resist.design/class/src/Incarnate.jsx~Incarnate.html
 * */
export const Incarnate = IncarnateInternal;
/**
 * @type {ReincarnateWrapper}
 * */
export const ReincarnateWrapper = ReincarnateWrapperInternal;

/**
 * Integrate the `Incarnate` dependency lifecycle with **React Router**
 * @see http://incarnate.resist.design
 * */
export default class Reincarnate extends Incarnate {
  static WARNINGS = {
    NO_HISTORY_OBJECT_SUPPLIED: 'NO_HISTORY_OBJECT_SUPPLIED'
  };
  static DEFAULT_NAME = 'Reincarnate';
  static DEFAULT_ROUTE_PATH_DELIMITER = '/';
  static SUPPLIED_DEPENDENCY_NAMES = {
    RUNTIME: 'RUNTIME'
  };

  /**
   * The `string` delimiter for route paths.
   * @type {string}
   * */
  routePathDelimiter;

  /**
   * A map of aliases for route paths.
   * Keys are existing route paths, values are actual paths to dependencies.
   * @type {Object.<string>}
   * */
  pathAliasMap;

  /**
   * A function used to handle dependency resolution errors.
   * `handleResolveError(error = {message: '', data: *}):*`
   * @type {Function}
   * */
  handleResolveError;

  /**
   * A history controller.
   * @type {Object}
   *
   * */
  history;

  unlistenToHistory;

  location;

  params;

  routeProps;

  constructor(config = {}) {
    super(config);

    if (!this.hasOwnProperty('routePathDelimiter')) {
      this.routePathDelimiter = Reincarnate.DEFAULT_ROUTE_PATH_DELIMITER;
    }

    if (!this.hasOwnProperty('pathAliasMap')) {
      this.pathAliasMap = {};
    }

    if (!this.hasOwnProperty('history')) {
      console.warn(Reincarnate.WARNINGS.NO_HISTORY_OBJECT_SUPPLIED, this);
    } else if (
      this.history instanceof Object &&
      this.history.getCurrentLocation instanceof Function
    ) {
      this.location = this.history.getCurrentLocation();
    }

    this.setupMap(this.map);
  }

  setupMap(map = {}) {
    // IMPORTANT: Declare the `RUNTIME` sub-map.
    const runtimeMap = getDefaultRuntimeSubMap(this);

    this.map = {
      ...map,
      [Reincarnate.SUPPLIED_DEPENDENCY_NAMES.RUNTIME]: runtimeMap
    };
  }

  getPathFromRoutes(currentRoute, routeList = []) {
    const routeIndex = routeList.indexOf(currentRoute);
    const delimiter = this.routePathDelimiter;

    return routeList
      .filter((r, i) => i <= routeIndex)
      .map(({path}) => path === delimiter ? '' : path)
      .join(delimiter) || delimiter;
  }

  getPathOrAlias(path) {
    if (this.pathAliasMap.hasOwnProperty(path)) {
      return this.pathAliasMap[path];
    }

    return path;
  }

  createElement = (Component, props = {}) => {
    const {
      key: multiComponentKey,
      route,
      routes = [],
      params,
      children
    } = props;
    const childRoute = routes[routes.indexOf(route) + 1] || {};
    const {components = {}} = childRoute;
    const directProps = {
      children,
      ...Object.keys(components)
        .reduce((acc, k) => {
          acc[k] = props[k];

          return acc;
        }, {})
    };
    const PATH = this.getPathFromRoutes(route, routes);
    const DEPENDENCY = this.getDependency(
      this.getPathOrAlias(PATH)
    );

    // TRICKY: IMPORTANT: Set the current `params` and `routeProps` on this instance.
    this.params = params;
    this.routeProps = props;

    return (
      <ReincarnateWrapper
        key={`ReincarnateWrapper:${PATH}`}
        path={PATH}
        dependency={DEPENDENCY}
        componentClass={Component}
        multiComponentKey={multiComponentKey}
        directProps={directProps}
        handleResolveError={this.handleResolveError}
      />
    );
  };
}
