import React from 'react';
import Incarnate from 'incarnate';
import DemoService from './services/Demo';
import History from './History';
import AlbumService from './services/Album';
import AlbumServiceConfig from './services/config/AlbumConfig';
import Axios from 'axios';

let STORE = {
  count: 0,
  albumId: undefined
};

export default new Incarnate({
  map: {
    // NEW...
    'axios': {
      args: [],
      factory: () => {
        return Axios;
      }
    },
    'albumServiceConfig': {
      args: [],
      factory: () => {
        return AlbumServiceConfig;
      }
    },
    'albumService': {
      args: [
        'axios',
        'albumServiceConfig'
      ],
      factory: async (httpService, config) => {
        return new AlbumService({
          httpService,
          config
        });
      }
    },
    'albumId': {
      args: [],
      factory: () => {
        return STORE.albumId;
      }
    },
    'albumsList': {
      args: [
        'albumService',
        'albumId'
      ],
      factory: async (service, id) => {
        return await service.get(id);
      }
    },
    '/albums': {
      args: [
        'albumsList',
        'albumId',
        (ctx, inc) => {
          return (id) => {
            STORE.albumId = id;
            inc.invalidate(['albumId']);
          }
        }
      ],
      factory: async (albums, albumId, onAlbumIdChange) => {
        return {
          albums,
          albumId,
          onAlbumIdChange
        };
      }
    },
    // OLD...
    'history': { factory: () => History },
    'store': { factory: () => STORE = { ...STORE, count: STORE.count + 1 } },
    'demo-service': { factory: () => new DemoService() },
    'json-headers': {
      args: ['demo-service'],
      factory: async (srv) => await srv.getHeaders()
    },
    '': { factory: () => ({ title: 'Reincarnate Demo' }) },
    '/': {
      args: ['history'],
      factory: (history) => {
        return {
          funStuff: 'In the top of the path - `/`',
          children: (
            <div>
              <button
                onClick={() => history.push('/panel')}
              >
                Go To /panel
              </button>
            </div>
          )
        };
      }
    },
    '/panel': { factory: () => ({ funStuff: 'Panel Route Direct' }) },
    '/panel/': {
      args: [
        'json-headers',
        'store',
        (c, i) => {
          return () => {
            i.invalidate(['json-headers']);
          }
        },
        (c, i) => {
          return () => {
            i.invalidate(['store']);
          }
        },
        'history'
      ],
      factory: async (headers, store, invalidateHeaders, invalidateStore, history) => {
        return {
          funStuff: `Panel Index: Accessed ${store.count} Times.`,
          children: (
            <div>
              <pre>
                {JSON.stringify(headers, null, '  ')}
              </pre>
              <button
                onClick={invalidateHeaders}
              >
                Update Headers
              </button>
              <br/>
              <button
                onClick={invalidateStore}
              >
                Update Store Object
              </button>
              <br/>
              <button
                onClick={() => history.push('/panel/more')}
              >
                Go To /panel/more
              </button>
            </div>
          )
        };
      }
    },
    '/panel/more': {
      args: ['history'],
      factory: (history) => {
        return {
          funStuff: 'MORE!',
          children: (
            <div>
              <button
                onClick={() => history.push('/')}
              >
                Home
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
