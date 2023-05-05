import { getBaselineCommit, getPriorCommit } from '../src/utilities/gitCommands';

let latestCommand: string | null;

jest.mock('child_process', () => {
  return {
    execFileSync: (command, args) => {
      latestCommand = command;
      return command + ' ' + [...args].join(' ');
    },
  };
});

describe('gitCommands', () => {
  describe('getBaselineCommit', () => {
    afterEach(() => {
      latestCommand = null;
    });
    it('assembles correct git command and passes it to execFileSync', () => {
      expect(getBaselineCommit('main')).toEqual('git merge-base origin/main HEAD');
    });
    it('the command passed to execFileSync should be only "git"', () => {
      getBaselineCommit('test');
      // eslint-disable-next-line strict-null-checks/all
      expect(latestCommand).toEqual('git');
    });
    it('will throw if undefined baseBranch is passed in', () => {
      expect(() => getBaselineCommit(undefined as unknown as string)).toThrowError(
        'Invalid input passed to getBaselineCommit: "undefined"',
      );
    });
    it('will throw if empty baseBranch is passed in', () => {
      expect(() => getBaselineCommit('')).toThrowError('Invalid input passed to getBaselineCommit: ""');
    });
    it('will throw if baseBranch that reduces to empty string is passed in', () => {
      expect(() => getBaselineCommit('   ')).toThrowError('Invalid input passed to getBaselineCommit: "   "');
    });
  });

  describe('getPriorCommit', () => {
    afterEach(() => {
      latestCommand = null;
    });
    it('assembles correct git command and passes it to execFileSync', () => {
      expect(getPriorCommit('main')).toEqual('git log --pretty=format:"%H" -1 main~1');
    });
    it('the command passed to execFileSync should be only "git"', () => {
      getPriorCommit('test');
      // eslint-disable-next-line strict-null-checks/all
      expect(latestCommand).toEqual('git');
    });
    it('will throw if undefined baseCommit is passed in', () => {
      expect(() => getPriorCommit(undefined as unknown as string)).toThrowError(
        'Invalid input passed to getPriorCommit: "undefined"',
      );
    });
    it('will throw if empty getPriorCommit is passed in', () => {
      expect(() => getPriorCommit('')).toThrowError('Invalid input passed to getPriorCommit: ""');
    });
    it('will throw if getPriorCommit that reduces to empty string is passed in', () => {
      expect(() => getPriorCommit('   ')).toThrowError('Invalid input passed to getPriorCommit: "   "');
    });
  });
});
