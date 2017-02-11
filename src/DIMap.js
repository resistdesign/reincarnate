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
      factory: () => {
        return {
          funStuff: 'Panel Index'
        };
      }
    }
  },
  context: {},
  cacheMap: {}
});
