import React from 'react';
import Incarnate from '@resistdesign/incarnate';
import DemoService from './services/Demo';

let STORE = {
  count: 0
};

export default new Incarnate({
  map: {
    'store': {
      factory: () => {
        STORE = {
          ...STORE,
          count: STORE.count + 1
        };

        return STORE;
      }
    },
    'demo-service': {
      factory: () => {
        return new DemoService();
      }
    },
    '': {
      factory: () => {
        return {
          title: 'Reincarnate Demo'
        };
      }
    },
    '/': {
      factory: () => {
        return {
          funStuff: 'In the top of the path - `/`'
        };
      }
    },
    '/panel': {
      factory: () => {
        return {
          funStuff: 'Panel Route Direct'
        };
      }
    },
    '/panel/': {
      args: [
        'demo-service',
        'store',
        (c, i) => {
          return () => {
            i.invalidate(['store']);
          }
        }
      ],
      factory: async (srv, store, invalidateStore) => {
        const headers = await srv.getHeaders();

        return {
          funStuff: `Panel Index: Accessed ${store.count} Times.`,
          children: (
            <div>
              <pre>
                {JSON.stringify(headers, null, '  ')}
              </pre>
              <button
                onClick={invalidateStore}
              >
                Update Store Object
              </button>
            </div>
          )
        };
      }
    }
  },
  context: {},
  cacheMap: {}
});
