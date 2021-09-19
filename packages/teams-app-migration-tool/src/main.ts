import yargs from 'yargs';
import { existsSync } from 'fs-extra';
import { copyDir } from './backupHelper';
import { applyTransform } from './codemod';
import { docLinkLogger } from './loggers';

/**
 * Determine whether this source path is valid
 * @param sourcePath a string type directory path from the project to be migrated
 * @returns boolean value, true if source path is valid
 */
function validSourcePath(sourcePath: string): boolean {
  /**
   * undefined sourcePath
   */
  if (!sourcePath) {
    console.error('invalid source path which is undefined');
    return false;
  } else if (!existsSync(sourcePath)) {
    /**
     * source path is defined but doesn't exist
     */
    console.error('invalid source path which does not exist');
    return false;
  }
  return true;
}

/**
 * Determine whether this target path is valid
 * @param targetPath a string type directory path where migrated project locates at
 * @returns boolean value, true if target path is valid
 */
function validTargetPath(targetPath: string): boolean {
  /**
   * undefined targetPath
   */
  if (!targetPath) {
    console.error('invalid target path which is undefined');
    return false;
  } else if (existsSync(targetPath)) {
    /**
     * target path exists, for safety,
     * require a new target path so that overlapping the directory won't occur
     */
    console.error('target path has existed, please use another name to avoid overwriting');
    return false;
  }
  return true;
}

/**
 * the function to run commands input from users in the interface
 */
function run(): void {
  /**
   * Define command options
   */
  const argv = yargs
    .usage('Usage: yarn run codemod -- <filePath> -t <transformName>')
    .option('sourcePath', {
      alias: 'sp',
      description: 'source path of root directory which supposes to be transformed',
      type: 'string',
    })
    .option('targetPath', {
      alias: 'tp',
      description: 'target path of new directory which is copied from source path and where migration would be done',
      type: 'string',
    })
    .help()
    .alias('help', 'h').argv;
  /**
   * migrate the project if every argument is valid
   */
   if (argv.sourcePath && validSourcePath(argv.sourcePath) && argv.targetPath && validTargetPath(argv.targetPath)) {
    /**
     * beginning logs
     */
    console.log('migration starts');
    console.log('begin copying directory...');
    /**
     * copy and apply transformation
     */
    copyDir(argv.sourcePath, argv.targetPath);
    applyTransform(argv.targetPath);
    /**
     * end logs
     */
    console.log('migration successfully finished.');
    docLinkLogger();
  }
}

run();
