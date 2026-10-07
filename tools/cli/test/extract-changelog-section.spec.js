/* eslint-disable */

const fs = require('fs');
const os = require('os');
const path = require('path');

const { extractChangelogSection } = require('../extract-changelog-section');

function writeChangelog(content) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'teamsjs-changelog-'));
  const file = path.join(dir, 'CHANGELOG.md');
  fs.writeFileSync(file, content);
  return { file, cleanup: () => fs.rmSync(dir, { recursive: true, force: true }) };
}

const SAMPLE = [
  '# Change Log - @microsoft/teams-js',
  '',
  '<!-- Start content -->',
  '',
  '## 2.53.10',
  '',
  'Fri, 01 Jan 2027 00:00:00 GMT',
  '',
  '### Patches',
  '',
  '- MARKER_TEN',
  '',
  '## 2.53.1',
  '',
  'Wed, 17 Jun 2026 17:10:04 GMT',
  '',
  '### Patches',
  '',
  '- MARKER_ONE',
  '',
  '## 2.53.0',
  '',
  'Wed, 06 May 2026 19:04:08 GMT',
  '',
  '### Minor changes',
  '',
  '- MARKER_ZERO',
  '',
].join('\n');

describe('extractChangelogSection', () => {
  let ctx;
  afterEach(() => ctx && ctx.cleanup());

  it('returns only the requested version section', () => {
    ctx = writeChangelog(SAMPLE);
    const section = extractChangelogSection('2.53.1', ctx.file);
    expect(section).toContain('- MARKER_ONE');
    expect(section).not.toContain('- MARKER_ZERO');
    expect(section).not.toContain('- MARKER_TEN');
  });

  it('does not confuse a prefix version with a longer one (2.53.1 vs 2.53.10)', () => {
    ctx = writeChangelog(SAMPLE);
    const s1 = extractChangelogSection('2.53.1', ctx.file);
    const s10 = extractChangelogSection('2.53.10', ctx.file);
    expect(s1).toContain('- MARKER_ONE');
    expect(s1).not.toContain('- MARKER_TEN');
    expect(s10).toContain('- MARKER_TEN');
    expect(s10).not.toContain('- MARKER_ONE');
  });

  it('returns the full changelog when no version is provided', () => {
    ctx = writeChangelog(SAMPLE);
    const full = extractChangelogSection(undefined, ctx.file);
    expect(full).toContain('- MARKER_TEN');
    expect(full).toContain('- MARKER_ONE');
    expect(full).toContain('- MARKER_ZERO');
  });

  it('throws when the version is not present', () => {
    ctx = writeChangelog(SAMPLE);
    expect(() => extractChangelogSection('9.9.9', ctx.file)).toThrow(/9\.9\.9/);
  });

  it('throws when the changelog file does not exist', () => {
    expect(() => extractChangelogSection('2.53.1', path.join(os.tmpdir(), 'does-not-exist-changelog.md'))).toThrow(
      /was not found/,
    );
  });
});
