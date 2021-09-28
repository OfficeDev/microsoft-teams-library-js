import { SpawnSyncReturns } from 'child_process';
import execa from 'execa';
/**
 * run transform function with jscodeshift executable
 * @param files files that need to be transformed
 */
export function applyTransform(files: string): void {
  /**
   * find absolute file path for jscodeshift to be executed
   */
  const jscodeshiftExec: string = require.resolve('jscodeshift/bin/jscodeshift');
  /**
   * prepare a commands array to be executed by jscodeshift
   */
  const cmd: string[] = [];
  /**
   * some arguments are set
   * verbose is mentioned here as a remind that jscodeshift provides part of logs we
   * might could use in the future
   * for more details, refer to jscodeshift in github
   */
  cmd.push('--transform=./packages/teams-app-migration-tool/src/transforms/replaceSDK.ts');
  cmd.push('--ignore-pattern=node_modules');
  cmd.push('--verbose=0');
  cmd.push(files);
  /**
   * execute the command
   */
  const result: SpawnSyncReturns<string> = execa.sync(jscodeshiftExec, cmd, {
    stdio: 'inherit',
  });
  if (result.stderr) {
    throw result.stderr;
  }
}
