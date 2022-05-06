import { BundleBuddyConfig, BundleSummaries, WebpackStatsJson, WebpackStatsProcessor } from '../BundleBuddyTypes';
import { runProcessorsOnStatsFile } from '../utilities/runProcessorOnStatsFile';
import { BundleFileData } from './getBundleFilePathsFromFolder';

/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export interface GetBundleSummariesArgs {
  bundlePaths: BundleFileData[];

  statsProcessors: WebpackStatsProcessor[];

  getStatsFile: (relativePath: string) => Promise<WebpackStatsJson>;

  getBundleBuddyConfigFile: (
    bundleName: string,
  ) => Promise<BundleBuddyConfig | undefined> | (BundleBuddyConfig | undefined);
}

export async function getBundleSummaries(args: GetBundleSummariesArgs): Promise<BundleSummaries> {
  const result: BundleSummaries = new Map();

  const pendingAsyncWork = args.bundlePaths.map(async bundle => {
    const [statsFile, bundleBuddyConfig] = await Promise.all([
      args.getStatsFile(bundle.relativePathToStatsFile),
      args.getBundleBuddyConfigFile(bundle.bundleName),
    ]);

    const bundleSummary = runProcessorsOnStatsFile(
      bundle.bundleName,
      statsFile!, // non-null assertion here needed to due TS bug. Stats file is never undefined here
      bundleBuddyConfig,
      args.statsProcessors,
    );

    result.set(bundle.bundleName, bundleSummary);
  });

  await Promise.all(pendingAsyncWork);

  return result;
}
