'use strict';

// Run with: node --test tools/releases/sdf-beta-schedule.test.js
const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const path = require('node:path');
const { test } = require('node:test');

const { decide, main, prodWeek, readHistory, releasedVersionFromReadme } = require('./sdf-beta-schedule.js');

const at = (iso) => new Date(iso);
const lastPublished = { runId: 100, commit: 'aaa', runName: '20261014.3', sdfRun: '20261015.1' };
const scheduled = {
  reason: 'Schedule',
  now: at('2026-11-11T18:00:00Z'),
  beta: '2.60.0-beta.0',
  releasedVersion: '2.59.0',
  sourceBranch: 'refs/heads/main',
  current: { runId: 120, commit: 'bbb', runName: '20261106.1' },
  lastPublished,
  inFlight: [],
};

test('Prod week is the Monday-Sunday week containing the first Wednesday of a month', () => {
  // October 2025: the first Wednesday is the 1st, so the Prod week starts in September.
  for (const day of ['2025-09-29', '2025-09-30', '2025-10-01', '2025-10-03', '2025-10-05']) {
    assert.equal(prodWeek(at(`${day}T12:00:00Z`)).isProdWeek, true, day);
  }
  assert.equal(prodWeek(at('2025-09-28T23:59:59Z')).isProdWeek, false, 'the Sunday before');
  assert.equal(prodWeek(at('2025-10-06T00:00:00Z')).isProdWeek, false, 'the Monday after');
  assert.equal(prodWeek(at('2025-10-01T12:00:00Z')).wednesday, '2025-10-01');

  // January 2026: the first Wednesday is the 7th. The week of Wednesday 31 December is not a Prod week, even though
  // it ends in January.
  for (const day of ['2025-12-29', '2025-12-31', '2026-01-01', '2026-01-04']) {
    assert.equal(prodWeek(at(`${day}T12:00:00Z`)).isProdWeek, false, day);
  }
  for (const day of ['2026-01-05', '2026-01-07', '2026-01-11']) {
    assert.equal(prodWeek(at(`${day}T12:00:00Z`)).isProdWeek, true, day);
  }
  assert.equal(prodWeek(at('2026-01-12T00:00:00Z')).isProdWeek, false);
  assert.equal(prodWeek(at('2026-01-11T23:59:59Z')).wednesday, '2026-01-07');

  // Other Wednesdays of a month are not Prod weeks.
  for (const day of ['2026-11-11', '2026-11-18', '2026-11-25', '2026-04-08']) {
    assert.equal(prodWeek(at(`${day}T18:00:00Z`)).isProdWeek, false, day);
  }
  assert.equal(prodWeek(at('2026-11-04T18:00:00Z')).isProdWeek, true);
  assert.equal(prodWeek(at('2026-04-01T18:00:00Z')).isProdWeek, true, 'a first Wednesday on the 1st');
  assert.equal(prodWeek(at('2024-02-28T18:00:00Z')).isProdWeek, false, 'leap-year February');
  assert.equal(prodWeek(at('2024-03-03T18:00:00Z')).isProdWeek, false, 'week of 28 February 2024');
  assert.equal(prodWeek(at('2024-03-04T18:00:00Z')).isProdWeek, true, 'week of 6 March 2024');
});

test('the Prod week uses the UTC date, so the agent time zone and daylight saving time do not matter', () => {
  const script = path.join(__dirname, 'sdf-beta-schedule.js');
  // Instants on either side of US and EU daylight-saving changes and of a UTC day boundary.
  const instants = [
    '2026-03-08T09:59:00Z',
    '2026-03-08T10:01:00Z',
    '2026-03-29T00:30:00Z',
    '2026-11-01T08:59:00Z',
    '2026-11-01T09:01:00Z',
    '2026-11-01T23:59:00Z',
    '2026-11-02T00:01:00Z',
    '2025-10-05T23:59:00Z',
    '2025-10-06T00:01:00Z',
  ];
  const code = `const { prodWeek } = require(${JSON.stringify(script)}); console.log(JSON.stringify(${JSON.stringify(
    instants,
  )}.map((i) => prodWeek(new Date(i)))));`;
  const outputs = ['UTC', 'America/Los_Angeles', 'Pacific/Kiritimati', 'Europe/London'].map((tz) =>
    childProcess.execFileSync(process.execPath, ['-e', code], { env: { ...process.env, TZ: tz }, encoding: 'utf8' }),
  );
  for (const output of outputs) {
    assert.equal(output, outputs[0]);
  }
  assert.deepEqual(
    JSON.parse(outputs[0]).map((week) => week.isProdWeek),
    [true, true, false, false, false, false, true, true, false],
  );
});

test('manual runs always publish without any other input', () => {
  assert.deepEqual(decide({ reason: 'Manual' }), {
    publish: true,
    reasons: ['Manual run: the skip rule applies only to scheduled runs'],
  });
  assert.equal(decide({ reason: 'Manual', now: at('2026-11-04T18:00:00Z'), beta: 'not a beta' }).publish, true);
});

test('a scheduled run with a newer main build outside a Prod week publishes', () => {
  assert.deepEqual(decide(scheduled), { publish: true, reasons: [] });
});

test('a scheduled run skips in a Prod week', () => {
  const decision = decide({ ...scheduled, now: at('2026-11-04T18:00:00Z') });
  assert.equal(decision.publish, false);
  assert.match(decision.reasons[0], /Prod week: 2026-11-04/);
});

test('a scheduled run skips when nothing new reached main since the last beta', () => {
  const sameCommit = decide({ ...scheduled, current: { runId: 121, commit: 'aaa', runName: '20261106.2' } });
  assert.equal(sameCommit.publish, false);
  assert.match(sameCommit.reasons[0], /same commit as 20261014\.3/);

  const sameRun = decide({ ...scheduled, current: { runId: 100, commit: 'aaa', runName: '20261014.3' } });
  assert.equal(sameRun.publish, false);

  const olderRun = decide({ ...scheduled, current: { runId: 90, commit: 'ccc', runName: '20261001.1' } });
  assert.equal(olderRun.publish, false);
  assert.match(olderRun.reasons[0], /not newer than 20261014\.3/);
});

test('a scheduled run skips a beta of a version that has already shipped', () => {
  for (const beta of ['2.59.0-beta.1', '2.58.1-beta.0']) {
    const decision = decide({ ...scheduled, beta });
    assert.equal(decision.publish, false, beta);
    assert.match(decision.reasons[0], /not newer than the released 2\.59\.0/);
  }
  assert.equal(decide({ ...scheduled, beta: '2.59.1-beta.0' }).publish, true);
  assert.equal(decide({ ...scheduled, beta: '2.60.0-beta.12', releasedVersion: '2.59.10' }).publish, true);
  assert.equal(decide({ ...scheduled, releasedVersion: null }).publish, true, 'no README link to compare with');
});

test('a scheduled run skips while another run of the pipeline is in progress', () => {
  const decision = decide({ ...scheduled, inFlight: ['20261111.1'] });
  assert.equal(decision.publish, false);
  assert.match(decision.reasons[0], /in progress: 20261111\.1/);
});

test('a scheduled run lists every reason that applies', () => {
  const decision = decide({
    ...scheduled,
    now: at('2026-11-04T18:00:00Z'),
    current: { runId: 100, commit: 'aaa', runName: '20261014.3' },
  });
  assert.equal(decision.reasons.length, 2);
});

test('a scheduled run fails rather than guess', () => {
  assert.throws(() => decide({ ...scheduled, sourceBranch: 'refs/heads/release/2.59.0' }), /not refs\/heads\/main/);
  assert.throws(() => decide({ ...scheduled, sourceBranch: '' }), /unknown branch/);
  assert.throws(() => decide({ ...scheduled, beta: '2.59.0' }), /not a beta version/);
  assert.throws(() => decide({ ...scheduled, beta: undefined }), /not a beta version/);
  assert.throws(() => decide({ ...scheduled, lastPublished: null }), /No published beta/);
  // In a Prod week the run skips anyway, so a missing history does not fail it.
  assert.equal(decide({ ...scheduled, now: at('2026-11-04T18:00:00Z'), lastPublished: null }).publish, false);
});

test('the released version is the highest Prod CDN version the README links to', () => {
  const readme = [
    '[from here](https://res.cdn.office.net/teams-js/2.59.0/js/MicrosoftTeams.min.js)',
    '<script src="https://res.cdn.office.net/teams-js/2.59.0/js/MicrosoftTeams.min.js"',
    'An old example: https://res.cdn.office.net/teams-js/2.9.0/js/MicrosoftTeams.min.js',
    'SDF: https://res-sdf.cdn.office.net/teams-js/2.60.0-beta.0/js/MicrosoftTeams.min.js',
  ].join('\n');
  assert.equal(releasedVersionFromReadme(readme), '2.59.0');
  assert.equal(releasedVersionFromReadme('no links'), null);
});

function fakeAdo(routes) {
  const requested = [];
  const fetchImpl = async (url, init) => {
    requested.push(url);
    assert.equal(init.headers.Authorization, 'Bearer token');
    const key = Object.keys(routes).find((fragment) => url.includes(fragment));
    if (!key) {
      return { ok: false, status: 404, json: async () => ({}) };
    }
    const body = routes[key];
    return typeof body === 'number'
      ? { ok: false, status: body, json: async () => ({}) }
      : { ok: true, status: 200, json: async () => body };
  };
  return { fetchImpl, requested };
}

const published = { records: [{ type: 'Task', task: { name: 'EsrpRelease' }, result: 'succeeded' }] };
const notPublished = {
  records: [
    { type: 'Task', task: { name: 'EsrpRelease' }, result: 'skipped' },
    { type: 'Task', task: { name: 'PowerShell' }, result: 'succeeded' },
  ],
};
const historyRoutes = {
  'builds?definitions=7&': {
    value: [
      { id: 9, buildNumber: '20261111.2', status: 'inProgress' },
      { id: 8, buildNumber: '20261111.1', status: 'inProgress' },
      { id: 6, buildNumber: '20261104.1', status: 'completed' },
      { id: 5, buildNumber: '20261015.1', status: 'completed' },
      { id: 4, buildNumber: '20261008.1', status: 'completed' },
    ],
  },
  'builds/6/timeline': notPublished,
  'builds/5/timeline': published,
  // As Azure DevOps answers it: the resource's pipeline.id is the consumed CI run's ID.
  'pipelines/7/runs/5': {
    resources: { pipelines: { ci: { pipeline: { id: 100 }, version: '20261014.3' } } },
  },
  'builds/100?': { id: 100, buildNumber: '20261014.3', sourceVersion: 'aaa' },
};
const historyInput = {
  collectionUri: 'https://ado.example/org/',
  project: 'project-id',
  definitionId: '7',
  buildId: '9',
  alias: 'ci',
  token: 'token',
};

test('the history names the CI build behind the newest published beta and the runs still in progress', async () => {
  const { fetchImpl, requested } = fakeAdo(historyRoutes);
  const history = await readHistory({ ...historyInput, fetchImpl });
  assert.deepEqual(history, {
    inFlight: ['20261111.1'],
    lastPublished: { runId: 100, commit: 'aaa', runName: '20261014.3', sdfRun: '20261015.1' },
  });
  assert.ok(requested[0].startsWith('https://ado.example/org/project-id/_apis/build/builds?definitions=7&'));
  assert.ok(!requested.some((url) => url.includes('builds/4/timeline')), 'stops at the newest published run');
});

test('the history reports no published beta, and fails on errors or an unexpected CI run', async () => {
  const none = fakeAdo({ ...historyRoutes, 'builds/5/timeline': notPublished, 'builds/4/timeline': { records: [] } });
  assert.equal((await readHistory({ ...historyInput, fetchImpl: none.fetchImpl })).lastPublished, null);

  const denied = fakeAdo({ ...historyRoutes, 'builds?definitions=7&': 401 });
  await assert.rejects(readHistory({ ...historyInput, fetchImpl: denied.fetchImpl }), /answered 401/);

  const renamed = fakeAdo({ ...historyRoutes, 'builds/100?': { id: 100, buildNumber: '20261014.4' } });
  await assert.rejects(readHistory({ ...historyInput, fetchImpl: renamed.fetchImpl }), /named 20261014\.4, expected/);

  const missing = fakeAdo({ ...historyRoutes, 'builds/100?': 404 });
  await assert.rejects(readHistory({ ...historyInput, fetchImpl: missing.fetchImpl }), /answered 404/);

  const noResource = fakeAdo({ ...historyRoutes, 'pipelines/7/runs/5': { resources: { pipelines: {} } } });
  await assert.rejects(readHistory({ ...historyInput, fetchImpl: noResource.fetchImpl }), /does not name its ci/);
});

const env = {
  SYSTEM_ACCESSTOKEN: 'token',
  SYSTEM_COLLECTIONURI: 'https://ado.example/org/',
  SYSTEM_TEAMPROJECTID: 'project-id',
  SYSTEM_DEFINITIONID: '7',
  BUILD_BUILDID: '9',
};
const feed = {
  'package.json': JSON.stringify({ version: '2.60.0-beta.0' }),
  'README.md': 'https://res.cdn.office.net/teams-js/2.59.0/js/MicrosoftTeams.min.js',
};
const readFile = (file) => feed[path.basename(file)];
const scheduledArgs = (now, commit = 'bbb', runId = '120') => [
  '--reason',
  'Schedule',
  '--npm-feed',
  'NPMFeed',
  '--alias',
  'ci',
  '--source-branch',
  'refs/heads/main',
  '--run-id',
  runId,
  '--run-name',
  '20261106.1',
  '--commit',
  commit,
  '--now',
  now,
];

test('main sets the publish output variable', async () => {
  const lines = [];
  const log = (line) => lines.push(line);
  const { fetchImpl } = fakeAdo({
    ...historyRoutes,
    'builds?definitions=7&': { value: historyRoutes['builds?definitions=7&'].value.slice(2) },
  });

  const publish = await main(scheduledArgs('2026-11-11T18:00:00Z'), env, { fetchImpl, readFile, log });
  assert.equal(publish.publish, true);
  assert.equal(lines.at(-1), '##vso[task.setvariable variable=publish;isOutput=true]true');

  lines.length = 0;
  const skip = await main(scheduledArgs('2026-11-11T18:00:00Z', 'aaa', '100'), env, { fetchImpl, readFile, log });
  assert.equal(skip.publish, false);
  assert.ok(lines.some((line) => line.startsWith('##vso[task.logissue type=warning]Skipping the weekly beta.')));
  assert.equal(lines.at(-1), '##vso[task.setvariable variable=publish;isOutput=true]false');

  lines.length = 0;
  const manual = await main(['--reason', 'Manual'], {}, { fetchImpl: () => assert.fail('no requests'), log });
  assert.equal(manual.publish, true);
  assert.equal(lines.at(-1), '##vso[task.setvariable variable=publish;isOutput=true]true');
});

test('main fails a scheduled run that lacks its inputs', async () => {
  const { fetchImpl } = fakeAdo(historyRoutes);
  const quiet = () => {};
  await assert.rejects(main(['--reason', 'Schedule'], env, { fetchImpl, readFile, log: quiet }), /needs --npm-feed/);
  await assert.rejects(
    main(
      scheduledArgs('2026-11-11T18:00:00Z'),
      { ...env, SYSTEM_ACCESSTOKEN: '' },
      { fetchImpl, readFile, log: quiet },
    ),
    /Missing SYSTEM_ACCESSTOKEN/,
  );
  await assert.rejects(main(scheduledArgs('not a date'), env, { fetchImpl, readFile, log: quiet }), /is not a date/);
  await assert.rejects(main(['--reason'], env, { fetchImpl, readFile, log: quiet }), /takes a value/);
});
