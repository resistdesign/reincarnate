import T from 'prop-types';
import React, {PureComponent} from 'react';
import {
  HashMatrix,
  LifePod
} from 'incarnate';

export default class ReincarnateWrapper extends PureComponent {
  static PLACE_HOLDER_CLASS_NAME = 'REINCARNATE_COMPONENT_PLACEHOLDER';
  static propTypes = {
    path: T.string,
    multiComponentKey: T.string,
    dependency: T.instanceOf(
      HashMatrix
    ),
    componentClass: T.func,
    directProps: T.object,
    handleResolveError: T.func
  };

  mounted = false;

  state = {
    componentProps: undefined
  };

  componentWillMount() {
    const {dependency} = this.props;

    this.mounted = true;

    if (dependency instanceof HashMatrix) {
      dependency.addChangeHandler('', this.updateComponentProperties);
    }

    this.updateComponentProperties();
  }

  componentWillReceiveProps(nextProps) {
    const {dependency: oldDependency} = this.props;
    const {dependency} = nextProps;

    if (oldDependency instanceof HashMatrix) {
      oldDependency.removeChangeHandler('', this.updateComponentProperties);
    }

    if (dependency instanceof HashMatrix) {
      dependency.addChangeHandler('', this.updateComponentProperties);
    }
  }

  componentWillUnmount() {
    const {dependency} = this.props;

    this.mounted = false;

    if (dependency instanceof HashMatrix) {
      dependency.removeChangeHandler('', this.updateComponentProperties);
    }
  }

  safeSetState = (...args) => {
    if (this.mounted) {
      return this.setState(...args);
    }
  };

  handleResolveError(error) {
    const {handleResolveError} = this.props;

    if (handleResolveError instanceof Function) {
      handleResolveError(error);
    }
  }

  async resolveDependencyPromise(promise) {
    try {
      const componentProps = await promise;

      this.safeSetState({
        componentProps
      });
    } catch (error) {
      this.handleResolveError(error);
    }
  }

  updateComponentProperties = () => {
    try {
      const {dependency} = this.props;
      const componentProps = dependency instanceof LifePod ?
        dependency.resolve() :
        // TRICKY: If the dependency is not directly defined just use a default object
        // so that the component will be rendered.
        dependency.getPath() || {};

      if (componentProps instanceof Promise) {
        this.resolveDependencyPromise(componentProps);

        this.safeSetState({
          componentProps: undefined
        });
      } else {
        this.safeSetState({
          componentProps
        });
      }
    } catch (error) {
      this.handleResolveError(error);
    }
  };

  render() {
    const {componentProps} = this.state;

    if (componentProps instanceof Object) {
      const {
        multiComponentKey,
        componentClass: ComponentClass,
        directProps
      } = this.props;
      const renderProps = {
        ...(typeof multiComponentKey === 'string' ?
          componentProps[multiComponentKey] :
          componentProps),
        ...directProps
      };

      return (
        <ComponentClass
          {...renderProps}
        />
      );
    } else {
      return (
        <div
          className={ReincarnateWrapper.PLACE_HOLDER_CLASS_NAME}
        >
        </div>
      );
    }
  }
}
