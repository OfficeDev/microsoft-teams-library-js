const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const REPOSITORY = 'OfficeDev/microsoft-teams-library-js';
const PACKAGE = '@microsoft/teams-js';
const SHA = /^[0-9a-f]{40}$/;
const DIGEST = /^[0-9a-f]{64}$/;
const EVIDENCE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const VERSION =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|[0-9]*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|[0-9]*[A-Za-z-][0-9A-Za-z-]*))*))?$/;
const STATES = Object.freeze({
  matching: 'present-matching',
  absent: 'absent',
  conflicting: 'conflicting',
  unknown: 'unknown',
  notAttempted: 'not-attempted',
});
const MAX_RESPONSE_BYTES = 50 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 30000;
const RECEIPT_MAX_AGE_MS = 15 * 60 * 1000;

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

function keys(value, expected) {
  requireValue(value && typeof value === 'object' && !Array.isArray(value), 'Expected an object.');
  requireValue(Object.keys(value).sort().join(',') === [...expected].sort().join(','), 'Unexpected or missing fields.');
}

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function hash(bytes, algorithm = 'sha256', encoding = 'hex') {
  return createHash(algorithm).update(bytes).digest(encoding);
}

function destination(version, artifact) {
  return artifact === PACKAGE
    ? {
        id: 'npm',
        artifact,
        destination: `https://registry.npmjs.org/@microsoft/teams-js/-/teams-js-${version}.tgz`,
        algorithm: 'sha512',
      }
    : {
        id: `cdn:${artifact}`,
        artifact,
        destination: `https://res.cdn.office.net/teams-js/${version}/${artifact}`,
        algorithm: 'sha384',
      };
}

function validatePlan(plan) {
  keys(plan, ['schemaVersion', 'kind', 'release', 'source', 'build', 'tooling', 'targets']);
  keys(plan.release, ['component', 'version', 'channel']);
  keys(plan.source, ['repository', 'commit']);
  keys(plan.build, ['evidenceId']);
  keys(plan.tooling, ['revision']);
  requireValue(
    plan.schemaVersion === 1 && plan.kind === 'teamsjs-publication-projection' && plan.release.component === PACKAGE,
    'Unsupported publication projection.',
  );
  requireValue(
    typeof plan.release.version === 'string' && VERSION.test(plan.release.version),
    'Invalid semantic version.',
  );
  requireValue(
    !plan.release.version.includes('-'),
    'Semantic prerelease publication requires a separately approved destination adapter.',
  );
  requireValue(
    plan.release.channel === (plan.release.version.includes('-') ? 'prerelease' : 'stable'),
    'Version/channel mismatch.',
  );
  requireValue(plan.source.repository === REPOSITORY && SHA.test(plan.source.commit), 'Invalid source identity.');
  requireValue(SHA.test(plan.tooling.revision), 'Invalid tooling revision.');
  // The publisher retains the immutable mapping from this random export identity to full private provenance.
  requireValue(EVIDENCE_ID.test(plan.build.evidenceId), 'Invalid opaque build evidence identity.');
  requireValue(Array.isArray(plan.targets) && plan.targets.length >= 2, 'Both publication destinations are required.');
  const artifacts = plan.targets.slice(1).map((target) => target.artifact);
  requireValue(artifacts.includes('js/MicrosoftTeams.min.js'), 'Primary CDN bundle is required.');
  requireValue(
    new Set(artifacts).size === artifacts.length && [...artifacts].sort().join('\n') === artifacts.join('\n'),
    'Duplicate or unordered CDN inventory.',
  );
  plan.targets.forEach((actual, index) => {
    keys(actual, ['id', 'artifact', 'destination', 'integrity']);
    requireValue(
      index === 0
        ? actual.artifact === PACKAGE
        : typeof actual.artifact === 'string' &&
            /^js\/[A-Za-z0-9_-][A-Za-z0-9_./-]*\.(js|ts|map)$/.test(actual.artifact) &&
            !actual.artifact.split('/').some((part) => !part || part === '.' || part === '..'),
      'Invalid artifact path.',
    );
    const expected = destination(plan.release.version, actual.artifact);
    requireValue(
      actual.id === expected.id && actual.artifact === expected.artifact && actual.destination === expected.destination,
      'Invalid or reordered publication target.',
    );
    const digestBytes = expected.algorithm === 'sha512' ? 64 : 48;
    const prefix = `${expected.algorithm}-`;
    requireValue(
      typeof actual.integrity === 'string' && actual.integrity.startsWith(prefix),
      'Invalid integrity algorithm.',
    );
    const encoded = actual.integrity.slice(prefix.length);
    const decoded = Buffer.from(encoded, 'base64');
    requireValue(decoded.length === digestBytes && decoded.toString('base64') === encoded, 'Invalid integrity digest.');
  });
  return plan;
}

function planDigest(plan) {
  return hash(canonical(validatePlan(plan)));
}

function producePlan(identity, npmBytes, cdnFiles) {
  keys(identity, ['schemaVersion', 'kind', 'release', 'source', 'build', 'tooling']);
  const files = [
    [PACKAGE, npmBytes],
    ...Object.keys(cdnFiles)
      .sort()
      .map((name) => [name, cdnFiles[name]]),
  ];
  const targets = files.map(([artifact, bytes]) => {
    requireValue(Buffer.isBuffer(bytes) && bytes.length > 0, 'Empty build output.');
    const { algorithm, ...target } = destination(identity.release.version, artifact);
    return { ...target, integrity: `${algorithm}-${hash(bytes, algorithm, 'base64')}` };
  });
  return validatePlan({ ...identity, targets });
}

async function fetchBytes(url, fetchImpl) {
  const response = await fetchImpl(url, { redirect: 'error', signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  requireValue(response.status >= 100 && response.status <= 599, 'Invalid HTTP response.');
  if (response.status !== 200) {
    if (response.body) await response.body.cancel();
    return { status: response.status };
  }
  requireValue(response.body, 'Missing HTTP response body.');
  const chunks = [];
  let sizeBytes = 0;
  for await (const chunk of response.body) {
    sizeBytes += chunk.length;
    requireValue(sizeBytes <= MAX_RESPONSE_BYTES, 'HTTP response exceeds the size limit.');
    chunks.push(Buffer.from(chunk));
  }
  return { status: response.status, bytes: Buffer.concat(chunks) };
}

async function observeTarget(plan, target, fetchImpl) {
  if (target.id === 'npm') {
    const metadata = await fetchBytes(
      `https://registry.npmjs.org/@microsoft%2Fteams-js/${plan.release.version}`,
      fetchImpl,
    );
    if (metadata.status !== 200) return { state: STATES.unknown, evidence: `npm metadata HTTP ${metadata.status}` };
    const entry = JSON.parse(metadata.bytes.toString('utf8'));
    if (
      entry.name !== PACKAGE ||
      entry.version !== plan.release.version ||
      !entry.dist ||
      entry.dist.tarball !== target.destination ||
      entry.dist.integrity !== target.integrity ||
      (entry.gitHead !== undefined && entry.gitHead !== plan.source.commit)
    ) {
      return { state: STATES.conflicting, evidence: 'npm metadata does not match the approved plan' };
    }
  }
  const artifact = await fetchBytes(target.destination, fetchImpl);
  // A generic 404 is not authoritative evidence of absence, including negative CDN cache responses.
  if (artifact.status !== 200) return { state: STATES.unknown, evidence: `artifact HTTP ${artifact.status}` };
  const algorithm = target.id === 'npm' ? 'sha512' : 'sha384';
  const integrity = `${algorithm}-${hash(artifact.bytes, algorithm, 'base64')}`;
  return {
    state: integrity === target.integrity ? STATES.matching : STATES.conflicting,
    evidence: integrity,
  };
}

async function verifyPublication(plan, { fetchImpl = globalThis.fetch, now = Date.now } = {}) {
  const digest = planDigest(plan);
  const observations = [];
  for (const target of plan.targets) {
    let result;
    try {
      result = await observeTarget(plan, target, fetchImpl);
    } catch (error) {
      // Persist an explicit unknown and still inspect the other destination after a partial failure.
      result = {
        state: STATES.unknown,
        evidence: error instanceof SyntaxError ? 'Malformed metadata' : 'Publication request failed',
      };
    }
    observations.push({ targetId: target.id, ...result, observedAt: new Date(now()).toISOString() });
  }
  return {
    schemaVersion: 1,
    planDigest: digest,
    observations,
    complete: observations.every(({ state }) => state === STATES.matching),
  };
}

function requireCompleteReceipt(plan, receipt, approvedDigest, approvedSource, now = Date.now()) {
  requireValue(
    DIGEST.test(approvedDigest) && approvedDigest === planDigest(plan),
    'Plan does not match independent approval.',
  );
  requireValue(
    SHA.test(approvedSource) && approvedSource === plan.source.commit,
    'Source does not match independent approval.',
  );
  keys(receipt, ['schemaVersion', 'planDigest', 'observations', 'complete']);
  requireValue(
    receipt.schemaVersion === 1 && receipt.planDigest === approvedDigest && receipt.complete === true,
    'Incomplete or mismatched receipt.',
  );
  requireValue(
    Array.isArray(receipt.observations) && receipt.observations.length === plan.targets.length,
    'Incomplete target observations.',
  );
  plan.targets.forEach((target, index) => {
    const observation = receipt.observations[index];
    keys(observation, ['targetId', 'state', 'evidence', 'observedAt']);
    const observedAtMs = Date.parse(observation.observedAt);
    requireValue(
      observation.targetId === target.id &&
        observation.state === STATES.matching &&
        observation.evidence === target.integrity,
      'Target is not present-matching.',
    );
    requireValue(
      Number.isFinite(observedAtMs) &&
        new Date(observedAtMs).toISOString() === observation.observedAt &&
        observedAtMs <= now &&
        now - observedAtMs <= RECEIPT_MAX_AGE_MS,
      'Stale or invalid observation.',
    );
  });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function readInventory(directory, prefix = '') {
  const files = {};
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const name = `${prefix}${entry.name}`;
    if (entry.isDirectory()) Object.assign(files, readInventory(path.join(directory, entry.name), `${name}/`));
    else {
      requireValue(entry.isFile(), 'CDN inventory must not contain links or special files.');
      files[name] = fs.readFileSync(path.join(directory, entry.name));
    }
  }
  return files;
}

async function main(argv) {
  const [command, ...args] = argv;
  if (command === 'produce' && args.length === 4) {
    const [identityFile, npmFile, cdnDirectory, planFile] = args;
    const plan = producePlan(readJson(identityFile), fs.readFileSync(npmFile), readInventory(cdnDirectory));
    fs.writeFileSync(planFile, `${canonical(plan)}\n`, { flag: 'wx' });
    console.log(planDigest(plan));
    return;
  }
  if (command === 'verify' && args.length === 4) {
    const [planFile, approvedDigest, approvedSource, receiptFile] = args;
    const plan = validatePlan(readJson(planFile));
    requireValue(
      planDigest(plan) === approvedDigest && plan.source.commit === approvedSource,
      'Plan does not match independent approval.',
    );
    const receipt = await verifyPublication(plan);
    fs.writeFileSync(receiptFile, `${canonical(receipt)}\n`, { flag: 'wx' });
    requireCompleteReceipt(plan, receipt, approvedDigest, approvedSource);
    return;
  }
  throw new Error(
    'Usage: release-plan.js produce <identity.json> <package.tgz> <cdn-version-directory> <new-plan.json> | verify <plan.json> <approved-digest> <approved-source> <new-receipt.json>',
  );
}

if (require.main === module) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  REPOSITORY,
  SHA,
  VERSION,
  STATES,
  canonical,
  hash,
  planDigest,
  producePlan,
  validatePlan,
  verifyPublication,
  requireCompleteReceipt,
  readJson,
  readInventory,
};
