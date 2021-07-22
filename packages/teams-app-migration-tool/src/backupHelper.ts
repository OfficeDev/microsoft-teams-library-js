import { copySync } from 'fs-extra';
import { resolve } from 'path';

/**
 * copy all of things under source directory to target directory
 * @param source the source directory
 * @param target the target directory
 */
export function copyDir(sourceDir: string, targetDir: string): void {
  const sourcePath: string = resolve('${__dirname}', sourceDir); // resolve path from source directory
  const targetPath: string = resolve('${__dirname}', targetDir); // resolve path from target directory

  /**
   * use fs-extra copySync to copy all the files and subdirectories
   * under current folder to another place
   */
  try {
    copySync(sourcePath, targetPath);
    copyLog(sourcePath, targetPath);
    /**
     * if there is any error,
     * print it to the console
     */
  } catch (err) {
    console.error(err);
  }
}

function copyLog(sourcePath: string, targetPath: string): string {
  return 'files and subdirectories under ' + sourcePath + ' have been copied to ' + targetPath;
}
