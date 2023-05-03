import { getBaselineCommit } from '../src/utilities/gitCommands';

jest.mock('child_process', () => {
  return {
    execFileSync: (command, args) => command + ' ' + [...args].join(' '),
  };
});

describe('gitCommands', () => {
  describe('getBaselineCommit', () => {
    it('test1', () => {
      expect(getBaselineCommit('test')).toEqual('git merge-base origin/test HEAD');
    });
  });
});
