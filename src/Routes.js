import React from 'react';
import Router from 'react-router/lib/Router';
import Route from 'react-router/lib/Route';
import IndexRoute from 'react-router/lib/IndexRoute';
import History from './History';
import PropInjector from './PropInjector';
import ReincarnateDemo from './views/ReincarnateDemo';
import Panel1 from './views/Panel1';

export default (
  <Router
    createElement={PropInjector.createElement}
    history={History}
  >
    <Route
      path='/'
      component={ReincarnateDemo}
    >
      <IndexRoute
        component={Panel1}
      />
      <Route
        path='panel'
        component={Panel1}
      />
    </Route>
    <Route
      path='*'
      onEnter={() => setTimeout(() => History.push('/'), 0)}
    />
  </Router>
);
