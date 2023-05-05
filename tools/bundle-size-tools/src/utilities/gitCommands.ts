/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { execFileSync } from 'child_process';
/**
 * Gets the commit in main that the current branch is based on.
 */
export function getBaselineCommit(baseBranch: string): string {
  if (!baseBranch || !baseBranch.trim()) {
    throw new Error(`Invalid input passed to getBaselineCommit: "${baseBranch}"`);
  }
  return execFileSync('git', ['merge-base', `origin/${baseBranch}`, 'HEAD'])
    .toString()
    .trim();
}

export function getPriorCommit(baseCommit: string): string {
  if (!baseCommit || !baseCommit.trim()) {
    throw new Error(`Invalid input passed to getPriorCommit: "${baseCommit}"`);
  }
  return execFileSync('git', ['log', '--pretty=format:"%H"', '-1', `${baseCommit}~1`])
    .toString()
    .trim();
}
