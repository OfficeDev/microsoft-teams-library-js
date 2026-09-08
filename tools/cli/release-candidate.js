const fs = require('node:fs');
const { SHA, VERSION, REPOSITORY, canonical } = require('./release-plan');

function readCandidate(baseRef, source, tooling, packageFile, changelogFile) {
  const version = baseRef.startsWith('release/') ? baseRef.slice('release/'.length) : '';
  if (!VERSION.test(version) || !SHA.test(source) || !SHA.test(tooling))
    throw new Error('Invalid pinned candidate identity.');
  const manifest = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
  const changelog = fs.readFileSync(changelogFile, 'utf8');
  if (
    manifest.name !== '@microsoft/teams-js' ||
    manifest.version !== version ||
    !changelog.split('\n').some((line) => line.trim() === `## ${version}`)
  ) {
    throw new Error('Candidate package or changelog does not match its release branch.');
  }
  return { schemaVersion: 1, status: 'unverified-candidate', repository: REPOSITORY, source, tooling, version };
}

if (require.main === module) {
  try {
    const args = process.argv.slice(2);
    if (args.length !== 6)
      throw new Error(
        'Usage: release-candidate.js <base-ref> <source-sha> <tooling-sha> <package.json> <CHANGELOG.md> <new-candidate.json>',
      );
    const candidate = readCandidate(...args.slice(0, 5));
    fs.writeFileSync(args[5], `${canonical(candidate)}\n`, { flag: 'wx' });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { readCandidate };
