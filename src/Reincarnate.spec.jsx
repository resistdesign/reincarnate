import expect from 'expect.js';
import Reincarnate from './Reincarnate';

export default {
  Reincarnate: {
    'should be a class': () => {
      expect(Reincarnate).to.be.a(Function);
    }
  }
};
