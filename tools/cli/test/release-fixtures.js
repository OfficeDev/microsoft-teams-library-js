const { producePlan, planDigest, REPOSITORY } = require('../release-plan');

const source = 'a'.repeat(40);
const now = Date.parse('2026-01-01T00:00:00Z');
const npmBytes = Buffer.from('synthetic final package bytes');
const cdnFiles = {
  'js/MicrosoftTeams.min.js': Buffer.from('synthetic final bundle bytes'),
  'js/MicrosoftTeams.min.js.map': Buffer.from('synthetic source map'),
};
const identity = {
  schemaVersion: 1,
  kind: 'teamsjs-publication-projection',
  release: { component: '@microsoft/teams-js', version: '3.0.0', channel: 'stable' },
  source: { repository: REPOSITORY, commit: source },
  build: { evidenceId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' },
  tooling: { revision: 'c'.repeat(40) },
};

function fixture() {
  const plan = producePlan(structuredClone(identity), npmBytes, cdnFiles);
  const approvedDigest = planDigest(plan);
  const receipt = {
    schemaVersion: 1,
    planDigest: approvedDigest,
    observations: plan.targets.map((target) => ({
      targetId: target.id,
      state: 'present-matching',
      evidence: target.integrity,
      observedAt: new Date(now).toISOString(),
    })),
    complete: true,
  };
  return { plan, receipt, approvedDigest, approvedSource: source, now };
}

module.exports = { fixture, identity, source, now, npmBytes, cdnFiles };
