import useRouterHistory from 'react-router/lib/useRouterHistory';
import createBrowserHistory from 'history/lib/createBrowserHistory';

export default useRouterHistory(createBrowserHistory)({
  basename: './'
});
