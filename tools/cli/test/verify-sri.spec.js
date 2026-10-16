/* eslint-disable */

const { verifySri, getManifestIntegrity, getIntegrityAttributes } = require('../verify-sri');
const { createReleaseFixture } = require('./fixtures');

describe('verify-sri', () => {
  let fx;
  afterEach(() => fx && fx.cleanup());

  it('passes when README and HTML integrity match the manifest', () => {
    fx = createReleaseFixture('2.53.1');
    expect(verifySri(fx.paths)).toEqual([]);
  });

  it('fails when the README integrity is stale', () => {
    fx = createReleaseFixture('2.53.1', { readmeIntegrity: 'sha384-STALE0000000000000000000000000000000000000000000000000000000000000' });
    const failures = verifySri(fx.paths);
    expect(failures).toEqual(expect.arrayContaining([expect.stringContaining('Integrity mismatch')]));
    expect(failures.some((f) => f.includes('README.md'))).toBe(true);
  });

  it('fails when the test app HTML integrity is stale', () => {
    fx = createReleaseFixture('2.53.1', { htmlIntegrity: 'sha384-STALE0000000000000000000000000000000000000000000000000000000000000' });
    const failures = verifySri(fx.paths);
    expect(failures.some((f) => f.includes('index_cdn.html'))).toBe(true);
  });

  it('reads the integrity hash from the manifest', () => {
    fx = createReleaseFixture('2.53.1');
    expect(getManifestIntegrity(fx.paths.manifest)).toBe(fx.integrity);
  });

  it('throws a helpful error when the manifest is missing', () => {
    expect(() => getManifestIntegrity('/nope/MicrosoftTeams-manifest.json')).toThrow(/Run 'pnpm build' first/);
  });

  it('extracts every integrity attribute in a file', () => {
    fx = createReleaseFixture('2.53.1');
    const attrs = getIntegrityAttributes(fx.paths.readme);
    expect(attrs.length).toBeGreaterThanOrEqual(1);
    attrs.forEach((a) => expect(a).toBe(fx.integrity));
  });
});
