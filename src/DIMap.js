import React from 'react';
import Incarnate from '@resistdesign/incarnate';
import DemoService from './services/Demo';

export default new Incarnate({
  map: {
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
        'demo-service'
      ],
      factory: async (srv) => {
        const headers = await srv.getHeaders();

        return {
          funStuff: 'Panel Index',
          children: (
            <pre>
              {JSON.stringify(headers, null, '  ')}
            </pre>
          )
        };
      }
    }
  },
  context: {},
  cacheMap: {}
});
