/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { execFileSync } from 'child_process';

/**
 * Gets the commit in main that the current branch is based on.
 */
export function getBaselineCommit(baseBranch: string): string {
  return execFileSync(`git merge-base origin/${baseBranch} HEAD`).toString().trim();
}

export function getPriorCommit(baseCommit: string): string {
  return execFileSync(`git log --pretty=format:"%H" -1 ${baseCommit}~1`).toString().trim();
}
