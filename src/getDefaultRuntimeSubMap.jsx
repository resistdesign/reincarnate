import QueryString from 'query-string';

export default function getDefaultRuntimeSubMap(reincarnate = {}) {
  return {
    subMap: {
      global: {
        factory: () => window || global
      },
      history: {
        invalidators: [
          'history'
        ],
        factory: (invalidateHistory) => {
          if (reincarnate.history instanceof Object) {
            if (reincarnate.unlistenToHistory instanceof Function) {
              reincarnate.unlistenToHistory();
            }

            reincarnate.unlistenToHistory = reincarnate.history.listen(() => {
              reincarnate.location = reincarnate.history.getCurrentLocation();
              invalidateHistory();
            });

            return reincarnate.history;
          }
        }
      },
      location: {
        required: [
          'history'
        ],
        factory: () => reincarnate.location || {}
      },
      params: {
        required: [
          'history'
        ],
        factory: () => reincarnate.params || {}
      },
      query: {
        required: [
          'location'
        ],
        factory: ({search = ''}) => QueryString.parse(
          search,
          {
            arrayFormat: 'bracket'
          }
        )
      },
      props: {
        required: [
          'history'
        ],
        factory: () => reincarnate.routeProps || {}
      }
    }
  };
}
