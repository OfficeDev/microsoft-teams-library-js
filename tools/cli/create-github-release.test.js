const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { afterEach, describe, it } = require('node:test');

const {
  GitHubClient,
  createOrUpdatePrerelease,
  isReleaseVersion,
  parseArgs,
  readReleaseCandidate,
  resolveTagCommitSha,
} = require('./create-github-release');

const version = '2.56.0';
const baseRef = `release/${version}`;
const targetSha = 'a'.repeat(40);
const notes = 'Release notes';
const temporaryDirectories = [];

function createClient(overrides = {}) {
  return {
    getBranchReference: async () => ({ object: { type: 'commit', sha: targetSha } }),
    getTagReference: async () => undefined,
    getAnnotatedTag: async () => {
      throw new Error('Unexpected annotated tag lookup.');
    },
    getReleaseByTag: async () => undefined,
    createTagReference: async () => {
      throw new Error('Unexpected tag creation.');
    },
    updateTagReference: async () => {
      throw new Error('Unexpected tag update.');
    },
    createRelease: async () => {
      throw new Error('Unexpected release creation.');
    },
    updateRelease: async () => {
      throw new Error('Unexpected release update.');
    },
    ...overrides,
  };
}

function createCandidateFiles(packageVersion = version) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'teamsjs-release-'));
  const packageFile = path.join(directory, 'package.json');
  const changelogFile = path.join(directory, 'CHANGELOG.md');
  temporaryDirectories.push(directory);

  fs.writeFileSync(packageFile, JSON.stringify({ version: packageVersion }));
  fs.writeFileSync(changelogFile, `# Changelog\n\n## ${version}\n\n${notes}\n\n## 2.55.0\n\nPrevious notes\n`);

  return { packageFile, changelogFile };
}

afterEach(() => {
  while (temporaryDirectories.length > 0) {
    fs.rmSync(temporaryDirectories.pop(), { recursive: true });
  }
});

describe('createOrUpdatePrerelease', () => {
  it('creates the tag and a prerelease without marking it latest', async () => {
    let tagSha;
    let createdRelease;
    const client = createClient({
      getTagReference: async () => (tagSha ? { object: { type: 'commit', sha: tagSha } } : undefined),
      createTagReference: async (_tag, sha) => {
        tagSha = sha;
      },
      createRelease: async (release) => {
        createdRelease = release;
      },
    });

    const result = await createOrUpdatePrerelease({ baseRef, version, targetSha, notes, client });

    assert.deepEqual(result, { action: 'created', tag: 'v2.56.0' });
    assert.equal(tagSha, targetSha);
    assert.deepEqual(createdRelease, {
      name: 'v2.56.0 (prerelease)',
      body: notes,
      draft: false,
      prerelease: true,
      make_latest: 'false',
      tag_name: 'v2.56.0',
    });
  });

  it('updates an existing prerelease without moving a matching tag', async () => {
    let updatedRelease;
    const client = createClient({
      getTagReference: async () => ({ object: { type: 'commit', sha: targetSha } }),
      getReleaseByTag: async () => ({ id: 42, prerelease: true }),
      updateRelease: async (releaseId, release) => {
        updatedRelease = { releaseId, release };
      },
    });

    const result = await createOrUpdatePrerelease({ baseRef, version, targetSha, notes, client });

    assert.deepEqual(result, { action: 'updated', tag: 'v2.56.0' });
    assert.equal(updatedRelease.releaseId, 42);
    assert.deepEqual(updatedRelease.release, { body: notes });
  });

  it('advances a prerelease tag when a later release fix merges', async () => {
    let tagSha = 'b'.repeat(40);
    let updateCalled = false;
    const client = createClient({
      getTagReference: async () => ({ object: { type: 'commit', sha: tagSha } }),
      getReleaseByTag: async () => ({ id: 42, prerelease: true }),
      updateTagReference: async (_tag, sha, force) => {
        assert.equal(force, false);
        tagSha = sha;
      },
      updateRelease: async () => {
        updateCalled = true;
      },
    });

    const result = await createOrUpdatePrerelease({ baseRef, version, targetSha, notes, client });

    assert.deepEqual(result, { action: 'updated', tag: 'v2.56.0' });
    assert.equal(tagSha, targetSha);
    assert.equal(updateCalled, true);
  });

  it('restores the tag if the prerelease is promoted during an update', async () => {
    const originalSha = 'b'.repeat(40);
    let tagSha = originalSha;
    let releaseLookup = 0;
    const client = createClient({
      getTagReference: async () => ({ object: { type: 'commit', sha: tagSha } }),
      getReleaseByTag: async () => {
        releaseLookup += 1;
        return { id: 42, prerelease: releaseLookup < 3 };
      },
      updateTagReference: async (_tag, sha, force) => {
        if (sha === originalSha) {
          assert.equal(force, true);
        } else {
          assert.equal(force, false);
        }
        tagSha = sha;
      },
    });

    await assert.rejects(
      createOrUpdatePrerelease({ baseRef, version, targetSha, notes, client }),
      /was promoted while its tag was being updated/,
    );
    assert.equal(tagSha, originalSha);
  });

  it('leaves an existing full release unchanged on a matching commit', async () => {
    const client = createClient({
      getTagReference: async () => ({ object: { type: 'commit', sha: targetSha } }),
      getReleaseByTag: async () => ({ id: 42, prerelease: false }),
    });

    const result = await createOrUpdatePrerelease({ baseRef, version, targetSha, notes, client });

    assert.deepEqual(result, { action: 'unchanged', tag: 'v2.56.0' });
  });

  it('refuses to move a full release tag', async () => {
    const client = createClient({
      getTagReference: async () => ({ object: { type: 'commit', sha: 'b'.repeat(40) } }),
      getReleaseByTag: async () => ({ id: 42, prerelease: false }),
    });

    await assert.rejects(
      createOrUpdatePrerelease({ baseRef, version, targetSha, notes, client }),
      /Full release v2.56.0 points to a different commit/,
    );
  });

  it('refuses to reuse an orphaned tag from a different commit', async () => {
    let tagSha = 'b'.repeat(40);
    const client = createClient({
      getTagReference: async () => ({ object: { type: 'commit', sha: tagSha } }),
      updateTagReference: async (_tag, sha) => {
        tagSha = sha;
        throw new Error('Not a fast-forward update.');
      },
    });

    await assert.rejects(
      createOrUpdatePrerelease({ baseRef, version, targetSha, notes, client }),
      /Not a fast-forward update/,
    );
  });

  it('recovers an orphaned tag left by a partial earlier run', async () => {
    let tagSha = 'b'.repeat(40);
    let releaseCreated = false;
    const client = createClient({
      getTagReference: async () => ({ object: { type: 'commit', sha: tagSha } }),
      updateTagReference: async (_tag, sha, force) => {
        assert.equal(force, false);
        tagSha = sha;
      },
      createRelease: async () => {
        releaseCreated = true;
      },
    });

    const result = await createOrUpdatePrerelease({ baseRef, version, targetSha, notes, client });

    assert.deepEqual(result, { action: 'created', tag: 'v2.56.0' });
    assert.equal(tagSha, targetSha);
    assert.equal(releaseCreated, true);
  });

  it('does not publish an orphaned tag after the branch advances', async () => {
    let branchLookup = 0;
    let releaseCreated = false;
    const client = createClient({
      getBranchReference: async () => {
        branchLookup += 1;
        return { object: { type: 'commit', sha: branchLookup === 1 ? targetSha : 'b'.repeat(40) } };
      },
      getTagReference: async () => ({ object: { type: 'commit', sha: targetSha } }),
      createRelease: async () => {
        releaseCreated = true;
      },
    });

    const result = await createOrUpdatePrerelease({ baseRef, version, targetSha, notes, client });

    assert.deepEqual(result, { action: 'stale', tag: 'v2.56.0' });
    assert.equal(releaseCreated, false);
  });

  it('skips a stale workflow run instead of rewinding the tag', async () => {
    const client = createClient({
      getBranchReference: async () => ({ object: { type: 'commit', sha: 'b'.repeat(40) } }),
    });

    const result = await createOrUpdatePrerelease({ baseRef, version, targetSha, notes, client });

    assert.deepEqual(result, { action: 'stale', tag: 'v2.56.0' });
  });

  it('rejects a target that is not a full commit SHA', async () => {
    const client = createClient();

    await assert.rejects(
      createOrUpdatePrerelease({ baseRef, version, targetSha: 'abc123', notes, client }),
      /full commit SHA/,
    );
  });
});

describe('resolveTagCommitSha', () => {
  it('resolves annotated tags to their commit', async () => {
    const tagObjectSha = 'b'.repeat(40);
    const client = createClient({
      getTagReference: async () => ({ object: { type: 'tag', sha: tagObjectSha } }),
      getAnnotatedTag: async (sha) => {
        assert.equal(sha, tagObjectSha);
        return { object: { type: 'commit', sha: targetSha } };
      },
    });

    assert.equal(await resolveTagCommitSha(client, 'v2.56.0'), targetSha);
  });

  it('rejects malformed tag objects', async () => {
    const client = createClient({
      getTagReference: async () => ({ object: { type: 'commit' } }),
    });

    await assert.rejects(resolveTagCommitSha(client, 'v2.56.0'), /invalid Git object/);
  });
});

describe('readReleaseCandidate', () => {
  it('reads a matching package version and changelog section', () => {
    const files = createCandidateFiles();

    assert.deepEqual(
      readReleaseCandidate({
        baseRef: `release/${version}`,
        targetSha,
        ...files,
      }),
      {
        eligible: true,
        baseRef: `release/${version}`,
        version,
        targetSha,
        notes,
      },
    );
  });

  it('skips test release branches without reading candidate files', () => {
    assert.deepEqual(
      readReleaseCandidate({
        baseRef: 'release/test-esrp-release',
        targetSha,
        packageFile: 'missing-package.json',
        changelogFile: 'missing-changelog.md',
      }),
      {
        eligible: false,
        version: 'test-esrp-release',
      },
    );
  });

  it('rejects a package version that does not match the release branch', () => {
    const files = createCandidateFiles('2.55.0');

    assert.throws(
      () =>
        readReleaseCandidate({
          baseRef: `release/${version}`,
          targetSha,
          ...files,
        }),
      /does not match package version/,
    );
  });

  it('rejects a missing changelog section', () => {
    const files = createCandidateFiles();
    fs.writeFileSync(files.changelogFile, '# Changelog\n\n## 2.55.0\n\nPrevious notes\n');

    assert.throws(
      () =>
        readReleaseCandidate({
          baseRef: `release/${version}`,
          targetSha,
          ...files,
        }),
      /was not found in the changelog/,
    );
  });

  it('rejects an empty changelog section', () => {
    const files = createCandidateFiles();
    fs.writeFileSync(files.changelogFile, `# Changelog\n\n## ${version}\n\n## 2.55.0\n\nPrevious notes\n`);

    assert.throws(
      () =>
        readReleaseCandidate({
          baseRef: `release/${version}`,
          targetSha,
          ...files,
        }),
      /must not be empty/,
    );
  });
});

describe('GitHubClient', () => {
  it('treats only a not-found response as an absent release', async () => {
    const notFoundClient = new GitHubClient({
      repository: 'owner/repository',
      token: 'token',
      fetchImpl: async () => ({ status: 404, ok: false }),
    });
    const failedClient = new GitHubClient({
      repository: 'owner/repository',
      token: 'token',
      fetchImpl: async () => ({ status: 500, ok: false }),
    });

    assert.equal(await notFoundClient.getReleaseByTag('v2.56.0'), undefined);
    assert.equal(await notFoundClient.getTagReference('v2.56.0'), undefined);
    await assert.rejects(failedClient.getReleaseByTag('v2.56.0'), /HTTP 500/);
    await assert.rejects(failedClient.getTagReference('v2.56.0'), /HTTP 500/);
  });
});

describe('parseArgs', () => {
  it('rejects missing required arguments', () => {
    assert.throws(() => parseArgs([]), /Missing required argument: --base-ref/);
  });

  it('rejects flags that could change prerelease behavior', () => {
    assert.throws(
      () => parseArgs(['--base-ref', `release/${version}`, '--prerelease', 'false']),
      /Invalid argument: --prerelease/,
    );
  });
});

describe('isReleaseVersion', () => {
  it('accepts release versions and rejects test release branches', () => {
    assert.equal(isReleaseVersion('2.56.0'), true);
    assert.equal(isReleaseVersion('01.2.3'), false);
    assert.equal(isReleaseVersion('1.02.3'), false);
    assert.equal(isReleaseVersion('1.2.03'), false);
    assert.equal(isReleaseVersion('test-esrp-release'), false);
    assert.equal(isReleaseVersion('test/owner/scenario'), false);
  });
});
