import expect from 'expect.js';
import ReincarnateWrapper from './ReincarnateWrapper';

export default {
  ReincarnateWrapper: {
    'should be a class': () => {
      expect(ReincarnateWrapper).to.be.a(Function);
    }
  }
};
