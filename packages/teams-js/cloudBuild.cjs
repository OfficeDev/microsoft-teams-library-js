/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * Build-time cloud selection for teamsjs.
 *
 * A sovereign build swaps the bundled valid-domains artifact for that cloud's artifact via a
 * bundler alias. Because the artifact is the only place origins live, a sovereign bundle cannot
 * contain prod origins: they are never imported, so they are never emitted.
 *
 * Usage:
 *   TEAMSJS_CLOUD=gcch pnpm build
 */

const path = require('path');
const fs = require('fs');

/** The default public/commercial cloud. Produces the existing, unsuffixed output. */
const PROD = 'prod';

// Clouds with a distinct artifact. `prod` uses the default (unaliased) file.
const SOVEREIGN_CLOUDS = ['gcch', 'dod', 'gallatin', 'ag08', 'ag09'];

const ALL_CLOUDS = [PROD, ...SOVEREIGN_CLOUDS];

const DEFAULT_ARTIFACT = path.resolve(__dirname, 'src/artifactsForCDN/validDomains.json');

function getTargetCloud() {
  const requested = (process.env.TEAMSJS_CLOUD || PROD).toLowerCase();
  if (!ALL_CLOUDS.includes(requested)) {
    throw new Error(`Unknown TEAMSJS_CLOUD "${requested}". Expected one of: ${ALL_CLOUDS.join(', ')}`);
  }
  return requested;
}

/**
 * Absolute path to the valid-domains artifact for the target cloud.
 *
 * Also asserts that the artifact declares the cloud it is being used for. The artifact is the
 * runtime source of truth, so a mis-wired alias would otherwise produce a bundle that silently
 * trusts the wrong cloud's origins. Failing here turns that into a build error instead.
 */
function getArtifactPathForCloud(cloud) {
  const artifactPath =
    cloud === PROD ? DEFAULT_ARTIFACT : path.resolve(__dirname, `src/artifactsForCDN/validDomains.${cloud}.json`);

  if (!fs.existsSync(artifactPath)) {
    throw new Error(`No valid-domains artifact for cloud "${cloud}" at ${artifactPath}`);
  }
  const declared = JSON.parse(fs.readFileSync(artifactPath, 'utf8')).cloud;
  if (declared !== cloud) {
    throw new Error(
      `Artifact ${path.basename(artifactPath)} declares cloud "${declared}" but is being used for a "${cloud}" build.`,
    );
  }
  return artifactPath;
}

/**
 * Output sub-directory for the target cloud, so cloud builds do not overwrite each other.
 * `prod` keeps the existing `dist/umd` and `dist/esm` paths so published output is unchanged.
 */
function getDistSuffixForCloud(cloud) {
  return cloud === PROD ? '' : `-${cloud}`;
}

module.exports = {
  PROD,
  SOVEREIGN_CLOUDS,
  ALL_CLOUDS,
  DEFAULT_ARTIFACT,
  getTargetCloud,
  getArtifactPathForCloud,
  getDistSuffixForCloud,
};
