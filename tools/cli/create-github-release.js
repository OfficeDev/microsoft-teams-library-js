const fs = require('fs');

const RELEASE_VERSION_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const COMMIT_SHA_PATTERN = /^[0-9a-f]{40}$/;
const REPOSITORY_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const MAX_TAG_DEPTH = 10;

class GitHubClient {
  constructor({ repository, token, fetchImpl = globalThis.fetch }) {
    if (!REPOSITORY_PATTERN.test(repository)) {
      throw new Error('GITHUB_REPOSITORY must have the form owner/repository.');
    }
    if (!token) {
      throw new Error('GITHUB_TOKEN is required.');
    }
    if (typeof fetchImpl !== 'function') {
      throw new Error('This script requires Node.js 18 or newer.');
    }

    this.repository = repository;
    this.token = token;
    this.fetchImpl = fetchImpl;
  }

  async request(method, apiPath, body, allowNotFound = false) {
    const response = await this.fetchImpl(`https://api.github.com/repos/${this.repository}${apiPath}`, {
      method,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${this.token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'microsoft-teams-library-js-release',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (allowNotFound && response.status === 404) {
      return undefined;
    }
    if (!response.ok) {
      throw new Error(`GitHub API request failed (${method} ${apiPath}, HTTP ${response.status}).`);
    }

    return response.json();
  }

  getReleaseByTag(tag) {
    return this.request('GET', `/releases/tags/${encodeURIComponent(tag)}`, undefined, true);
  }

  getTagReference(tag) {
    return this.request('GET', `/git/ref/tags/${encodeURIComponent(tag)}`, undefined, true);
  }

  getAnnotatedTag(sha) {
    return this.request('GET', `/git/tags/${sha}`);
  }

  getBranchReference(branch) {
    const encodedBranch = branch.split('/').map(encodeURIComponent).join('/');
    return this.request('GET', `/git/ref/heads/${encodedBranch}`);
  }

  createTagReference(tag, sha) {
    return this.request('POST', '/git/refs', { ref: `refs/tags/${tag}`, sha });
  }

  updateTagReference(tag, sha, force = false) {
    return this.request('PATCH', `/git/refs/tags/${encodeURIComponent(tag)}`, { sha, force });
  }

  createRelease(release) {
    return this.request('POST', '/releases', release);
  }

  updateRelease(releaseId, release) {
    return this.request('PATCH', `/releases/${releaseId}`, release);
  }
}

function parseArgs(argv) {
  const allowedArgs = new Set(['--base-ref', '--target', '--package-file', '--changelog-file']);
  const args = {};

  for (let index = 0; index < argv.length; index += 2) {
    const name = argv[index];
    const value = argv[index + 1];

    if (!allowedArgs.has(name) || !value || value.startsWith('--')) {
      throw new Error(`Invalid argument: ${name || '(missing)'}.`);
    }
    if (Object.prototype.hasOwnProperty.call(args, name)) {
      throw new Error(`Duplicate argument: ${name}.`);
    }

    args[name] = value;
  }

  for (const requiredArg of allowedArgs) {
    if (!args[requiredArg]) {
      throw new Error(`Missing required argument: ${requiredArg}.`);
    }
  }

  return {
    baseRef: args['--base-ref'],
    targetSha: args['--target'],
    packageFile: args['--package-file'],
    changelogFile: args['--changelog-file'],
  };
}

function isReleaseVersion(version) {
  return RELEASE_VERSION_PATTERN.test(version || '');
}

function extractChangelogSection(changelog, version) {
  const sections = changelog.split(/(^## .*$)/m);
  const headingIndex = sections.findIndex((section) => section.trim() === `## ${version}`);
  if (headingIndex === -1) {
    throw new Error(`Matching version ${version} was not found in the changelog.`);
  }

  const notes = sections[headingIndex + 1] ? sections[headingIndex + 1].trim() : '';
  if (!notes) {
    throw new Error(`Changelog notes for version ${version} must not be empty.`);
  }
  return notes;
}

function readReleaseCandidate({ baseRef, targetSha, packageFile, changelogFile }) {
  const version = (baseRef || '').replace(/^release\//, '');
  if (!isReleaseVersion(version)) {
    return { eligible: false, version };
  }
  if (!COMMIT_SHA_PATTERN.test(targetSha || '')) {
    throw new Error('Release target must be a full commit SHA.');
  }
  if (!packageFile || !changelogFile) {
    throw new Error('Package and changelog file paths are required.');
  }

  const packageVersion = JSON.parse(fs.readFileSync(packageFile, 'utf8')).version;
  if (version !== packageVersion) {
    throw new Error(`Release branch version ${version} does not match package version ${packageVersion}.`);
  }

  const changelog = fs.readFileSync(changelogFile, 'utf8');
  return {
    eligible: true,
    baseRef,
    version,
    targetSha,
    notes: extractChangelogSection(changelog, version),
  };
}

function validateGitObject(object, tag) {
  if (!object || !['commit', 'tag'].includes(object.type) || !COMMIT_SHA_PATTERN.test(object.sha || '')) {
    throw new Error(`Tag ${tag} has an invalid Git object.`);
  }
}

async function resolveTagCommitSha(client, tag) {
  const reference = await client.getTagReference(tag);
  if (!reference) {
    return undefined;
  }

  let object = reference.object;
  for (let depth = 0; depth < MAX_TAG_DEPTH; depth += 1) {
    validateGitObject(object, tag);
    if (object.type === 'commit') {
      return object.sha;
    }

    const annotatedTag = await client.getAnnotatedTag(object.sha);
    object = annotatedTag.object;
  }

  throw new Error(`Tag ${tag} exceeds the supported annotation depth.`);
}

async function verifyTagTarget(client, tag, targetSha) {
  const actualSha = await resolveTagCommitSha(client, tag);
  if (actualSha !== targetSha) {
    throw new Error(`Tag ${tag} does not point to the expected release commit.`);
  }
}

async function isCurrentReleaseCandidate(client, baseRef, targetSha) {
  const reference = await client.getBranchReference(baseRef);
  validateGitObject(reference.object, baseRef);
  if (reference.object.type !== 'commit') {
    throw new Error(`Release branch ${baseRef} does not point to a commit.`);
  }
  return reference.object.sha === targetSha;
}

async function createOrUpdatePrerelease({ baseRef, version, targetSha, notes, client }) {
  if (!isReleaseVersion(version)) {
    throw new Error('Release version must have the form x.y.z.');
  }
  if (!COMMIT_SHA_PATTERN.test(targetSha || '')) {
    throw new Error('Release target must be a full commit SHA.');
  }
  if (!notes || !notes.trim()) {
    throw new Error('Release notes must not be empty.');
  }

  const tag = `v${version}`;
  const name = `${tag} (prerelease)`;
  if (!(await isCurrentReleaseCandidate(client, baseRef, targetSha))) {
    return { action: 'stale', tag };
  }

  const existingRelease = await client.getReleaseByTag(tag);
  const existingTagSha = await resolveTagCommitSha(client, tag);

  if (existingRelease && !existingRelease.prerelease) {
    if (existingTagSha !== targetSha) {
      throw new Error(`Full release ${tag} points to a different commit.`);
    }
    return { action: 'unchanged', tag };
  }

  if (existingRelease) {
    if (!existingTagSha) {
      throw new Error(`Release ${tag} exists without a matching tag.`);
    }
    if (!(await isCurrentReleaseCandidate(client, baseRef, targetSha))) {
      return { action: 'stale', tag };
    }

    const currentRelease = await client.getReleaseByTag(tag);
    if (!currentRelease) {
      throw new Error(`Release ${tag} disappeared while it was being updated.`);
    }
    if (!currentRelease.prerelease) {
      if (existingTagSha !== targetSha) {
        throw new Error(`Full release ${tag} points to a different commit.`);
      }
      return { action: 'unchanged', tag };
    }

    if (existingTagSha !== targetSha) {
      await client.updateTagReference(tag, targetSha, false);
      await verifyTagTarget(client, tag, targetSha);

      const releaseAfterTagUpdate = await client.getReleaseByTag(tag);
      if (!releaseAfterTagUpdate) {
        throw new Error(`Release ${tag} disappeared while its tag was being updated.`);
      }
      if (!releaseAfterTagUpdate.prerelease) {
        // Promotion is sequenced after this workflow, so restore the tag if that invariant is violated.
        await client.updateTagReference(tag, existingTagSha, true);
        await verifyTagTarget(client, tag, existingTagSha);
        throw new Error(`Release ${tag} was promoted while its tag was being updated.`);
      }
    }
  } else if (existingTagSha) {
    if (existingTagSha !== targetSha) {
      if (!(await isCurrentReleaseCandidate(client, baseRef, targetSha))) {
        return { action: 'stale', tag };
      }
      await client.updateTagReference(tag, targetSha, false);
      await verifyTagTarget(client, tag, targetSha);
    }
  } else {
    if (!(await isCurrentReleaseCandidate(client, baseRef, targetSha))) {
      return { action: 'stale', tag };
    }
    await client.createTagReference(tag, targetSha);
    await verifyTagTarget(client, tag, targetSha);
  }

  if (existingRelease) {
    const currentRelease = await client.getReleaseByTag(tag);
    if (!currentRelease) {
      throw new Error(`Release ${tag} disappeared while it was being updated.`);
    }
    if (!currentRelease.prerelease) {
      return { action: 'unchanged', tag };
    }

    await client.updateRelease(currentRelease.id, { body: notes.trim() });
    return { action: 'updated', tag };
  }

  if (!(await isCurrentReleaseCandidate(client, baseRef, targetSha))) {
    return { action: 'stale', tag };
  }
  await client.createRelease({
    name,
    body: notes.trim(),
    draft: false,
    prerelease: true,
    make_latest: 'false',
    tag_name: tag,
  });
  await verifyTagTarget(client, tag, targetSha);
  return { action: 'created', tag };
}

async function main() {
  const candidate = readReleaseCandidate(parseArgs(process.argv.slice(2)));
  if (!candidate.eligible) {
    console.log(`Skipping GitHub prerelease for non-version release branch ${candidate.version}.`);
    return;
  }

  const client = new GitHubClient({
    repository: process.env.GITHUB_REPOSITORY || '',
    token: process.env.GITHUB_TOKEN || '',
  });
  const result = await createOrUpdatePrerelease({ ...candidate, client });
  const action = {
    created: 'Created',
    stale: 'Skipped stale',
    unchanged: 'Kept',
    updated: 'Updated',
  }[result.action];
  console.log(`${action} GitHub prerelease ${result.tag}.`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`ERROR: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = {
  GitHubClient,
  createOrUpdatePrerelease,
  extractChangelogSection,
  isReleaseVersion,
  isCurrentReleaseCandidate,
  parseArgs,
  readReleaseCandidate,
  resolveTagCommitSha,
};
