const { REPOSITORY, SHA, planDigest, requireCompleteReceipt, readJson, verifyPublication } = require('./release-plan');

class GitHubClient {
  constructor({ token, fetchImpl = globalThis.fetch }) {
    if (!token) throw new Error('GITHUB_TOKEN is required.');
    this.token = token;
    this.fetchImpl = fetchImpl;
  }

  async request(method, apiPath, body, allowNotFound = false) {
    const response = await this.fetchImpl(`https://api.github.com/repos/${REPOSITORY}${apiPath}`, {
      method,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${this.token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
      redirect: 'error',
      signal: AbortSignal.timeout(30000),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (allowNotFound && response.status === 404) return undefined;
    if (!response.ok) throw new Error(`GitHub ${method} ${apiPath}: HTTP ${response.status}.`);
    return response.json();
  }

  getTagReference(tag) {
    return this.request('GET', `/git/ref/tags/${encodeURIComponent(tag)}`, undefined, true);
  }

  getAnnotatedTag(sha) {
    return this.request('GET', `/git/tags/${sha}`);
  }

  createTagReference(tag, sha) {
    return this.request('POST', '/git/refs', { ref: `refs/tags/${tag}`, sha });
  }

  createAnnotatedTag(tag, sha, digest) {
    return this.request('POST', '/git/tags', {
      tag,
      object: sha,
      type: 'commit',
      message: `teamsjs-plan-sha256:${digest}`,
    });
  }

  getReleaseByTag(tag) {
    return this.request('GET', `/releases/tags/${encodeURIComponent(tag)}`, undefined, true);
  }

  createRelease(release) {
    return this.request('POST', '/releases', release);
  }
}

function validateObject(object) {
  if (!object || !['tag', 'commit'].includes(object.type) || !SHA.test(object.sha)) {
    throw new Error('Invalid remote Git object.');
  }
}

async function readTag(client, tag) {
  const reference = await client.getTagReference(tag);
  if (!reference) return undefined;
  if (reference.ref !== `refs/tags/${tag}`) throw new Error('Unexpected remote reference.');
  let object = reference.object;
  let annotation;
  for (let depth = 0; depth < 10; depth += 1) {
    validateObject(object);
    if (object.type === 'commit') return { sha: object.sha, annotation };
    const annotated = await client.getAnnotatedTag(object.sha);
    if (annotation === undefined && typeof annotated.message === 'string') annotation = annotated.message.trimEnd();
    object = annotated.object;
  }
  throw new Error('Remote tag annotation depth exceeded.');
}

async function requireTag(client, tag, source, annotation) {
  const actual = await readTag(client, tag);
  if (!actual || actual.sha !== source || (annotation !== undefined && actual.annotation !== annotation)) {
    throw new Error(`Immutable tag ${tag} conflicts with the approved candidate.`);
  }
}

async function finalizeRelease({ plan, receipt, approvedDigest, approvedSource, client, now = Date.now() }) {
  requireCompleteReceipt(plan, receipt, approvedDigest, approvedSource, now);
  const digest = planDigest(plan);
  const source = plan.source.commit;
  const candidateTag = `candidate/${plan.release.version}/${digest}`;
  const finalTag = `v${plan.release.version}`;
  const annotation = `teamsjs-plan-sha256:${digest}`;
  // References are create-only. Concurrent creators or external promotion cannot move a published tag.
  for (const [tag, message] of [
    [candidateTag, undefined],
    [finalTag, annotation],
  ]) {
    const existing = await readTag(client, tag);
    if (existing) {
      await requireTag(client, tag, source, message);
      continue;
    }
    const object = message === undefined ? { sha: source } : await client.createAnnotatedTag(tag, source, digest);
    if (!SHA.test(object.sha)) throw new Error('Invalid created tag object.');
    await client.createTagReference(tag, object.sha);
    await requireTag(client, tag, source, message);
  }
  const existingRelease = await client.getReleaseByTag(finalTag);
  if (!existingRelease) {
    await client.createRelease({
      tag_name: finalTag,
      name: finalTag,
      body: `Publication verified for plan \`${digest}\` at source \`${source}\`.`,
      draft: false,
      prerelease: true,
      make_latest: 'false',
    });
  } else if (existingRelease.tag_name !== finalTag) {
    throw new Error('Unexpected release tag.');
  }
  await requireTag(client, candidateTag, source);
  await requireTag(client, finalTag, source, annotation);
  const persisted = await client.getReleaseByTag(finalTag);
  if (!persisted || persisted.tag_name !== finalTag) throw new Error('Release creation was not persisted.');
  return { tag: finalTag, candidateTag, action: existingRelease ? 'unchanged' : 'created' };
}

async function main(argv) {
  if (argv.length !== 4) {
    throw new Error('Usage: create-github-release.js <plan.json> <receipt.json> <approved-digest> <approved-source>');
  }
  const [planFile, receiptFile, approvedDigest, approvedSource] = argv;
  const plan = readJson(planFile);
  requireCompleteReceipt(plan, readJson(receiptFile), approvedDigest, approvedSource);
  // Re-observe immediately before metadata writes; a file claiming success is not verification authority.
  const receipt = await verifyPublication(plan);
  const client = new GitHubClient({ token: process.env.GITHUB_TOKEN });
  console.log(await finalizeRelease({ plan, receipt, approvedDigest, approvedSource, client }));
}

if (require.main === module) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { GitHubClient, readTag, finalizeRelease };
