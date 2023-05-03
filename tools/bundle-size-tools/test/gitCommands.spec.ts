import { getBaselineCommit } from '../src/utilities/gitCommands';

describe('gitCommands', () => {
  describe('getBaselineCommit', () => {
    it('test1', () => {
      expect(getBaselineCommit('test')).toEqual('git merge-base origin/test HEAD');
    });
  });
});
