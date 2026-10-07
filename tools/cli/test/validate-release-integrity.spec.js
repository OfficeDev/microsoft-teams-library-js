/* eslint-disable */

const { validate } = require('../validate-release-integrity');
const { createReleaseFixture } = require('./fixtures');

describe('validate-release-integrity', () => {
  let fx;
  afterEach(() => fx && fx.cleanup());

  const run = (version, overrides, options) => {
    fx = createReleaseFixture(version, overrides);
    return validate(version, { ...(options || {}), paths: fx.paths });
  };

  it('passes for a fully consistent release', () => {
    expect(run('2.53.1')).toEqual([]);
  });

  it('fails when teams-js package.json version is stale', () => {
    const failures = run('2.53.1', { teamsJsVersion: '2.53.0' });
    expect(failures).toEqual(expect.arrayContaining([expect.stringContaining('packages/teams-js/package.json')]));
  });

  it('fails when the test app package.json version is stale', () => {
    const failures = run('2.53.1', { testAppVersion: '2.53.0' });
    expect(failures).toEqual(expect.arrayContaining([expect.stringContaining('apps/teams-test-app/package.json')]));
  });

  it('fails when beachball change files are still present', () => {
    const failures = run('2.53.1', { changeFiles: ['@microsoft-teams-js-abc.json'] });
    expect(failures).toEqual(expect.arrayContaining([expect.stringContaining('Unconsumed beachball change files')]));
  });

  it('fails when the changelog has no section for the version', () => {
    fx = createReleaseFixture('2.53.2', { changelog: '# Change Log\n\n## 2.53.0\n\n- old\n' });
    const failures = validate('2.53.2', { paths: fx.paths });
    expect(failures).toEqual(expect.arrayContaining([expect.stringContaining('Changelog')]));
  });

  it('fails when README CDN URL points at the wrong version', () => {
    const failures = run('2.53.1', { readmeVersion: '2.53.0' });
    expect(failures).toEqual(expect.arrayContaining([expect.stringContaining('README.md CDN URL')]));
  });

  it('fails when the test app HTML CDN URL points at the wrong version', () => {
    const failures = run('2.53.1', { htmlVersion: '2.53.0' });
    expect(failures).toEqual(
      expect.arrayContaining([expect.stringContaining('index_cdn.html CDN URL')]),
    );
  });

  it('rejects a non-clean semver version', () => {
    const failures = run('2.53.1-beta.0');
    expect(failures).toEqual(expect.arrayContaining([expect.stringContaining('not a clean release semver')]));
  });

  it('rejects a major version bump', () => {
    // Previous version in the fixture changelog is 2.53.0; bumping to 3.x is a major bump.
    fx = createReleaseFixture('3.0.0', {
      changelog: '# Change Log\n\n## 3.0.0\n\n- new\n\n## 2.53.0\n\n- old\n',
    });
    const failures = validate('3.0.0', { paths: fx.paths });
    expect(failures).toEqual(expect.arrayContaining([expect.stringContaining('Major version bump detected')]));
  });

  it('passes PR-body check when the body contains the changelog section', () => {
    const fs = require('fs');
    const path = require('path');
    const { extractChangelogSection } = require('../extract-changelog-section');
    fx = createReleaseFixture('2.53.1');
    const section = extractChangelogSection('2.53.1', fx.paths.changelog);
    const bodyFile = path.join(fx.dir, 'pr-body.md');
    fs.writeFileSync(bodyFile, `Release 2.53.1\n\n${section}\n`);
    const failures = validate('2.53.1', { paths: fx.paths, prBodyFile: bodyFile });
    expect(failures.filter((f) => f.includes('PR body'))).toEqual([]);
  });

  it('fails PR-body check when the body omits the changelog section', () => {
    const fs = require('fs');
    const path = require('path');
    fx = createReleaseFixture('2.53.1');
    const bodyFile = path.join(fx.dir, 'pr-body.md');
    fs.writeFileSync(bodyFile, 'Totally unrelated PR description');
    const failures = validate('2.53.1', { paths: fx.paths, prBodyFile: bodyFile });
    expect(failures).toEqual(
      expect.arrayContaining([expect.stringContaining('PR body does not contain the changelog section')]),
    );
  });
});
