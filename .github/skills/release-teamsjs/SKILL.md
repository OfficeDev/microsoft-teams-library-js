---
name: release-teamsjs
description: Use when releasing @microsoft/teams-js from this repository - the monthly Prod release, the weekly SDF beta, or a valid-domains (DDL) push. Covers pre-flight, version selection, the release branch and prep PR, the internal pipelines with their approvals, verification on npm and the CDN, the GitHub release, merge-back, the announcement draft and failure recovery. Triggers on "release teams-js", "cut a TeamsJS release", "ship 2.59.0", "do the SDF beta", "push valid domains".
---

# release-teamsjs

Interactive workflow for releasing `@microsoft/teams-js`. It guides a maintainer; it does not hold any permission
itself, and nothing in it bypasses a branch ruleset, a required review or a pipeline approval.

**This repository is public.** Publishing runs in Microsoft's internal Azure DevOps and needs approvals from people
other than the releaser. Pipeline IDs, internal URLs, approver group names, channel names and people's names live in
the internal TeamsJS release runbook and must not be added here or pasted into PRs, issues or release notes. When this
file says "the internal runbook", open it rather than guessing.

Read [`failure-modes.md`](./failure-modes.md) before a first release and whenever anything looks wrong.

## Release types

| Type     | When                                                       | Publishes                                                                   | Built from                                             |
| -------- | ---------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------ |
| Prod     | First Wednesday of the month                               | npm `latest` and the Prod CDN (`res.cdn.office.net`)                        | CI build of `release/<x.y.z>` after the prep PR merges |
| SDF beta | Weekly, except the week of a Prod release                  | npm `beta` and the SDF CDN (`res-sdf.cdn.office.net`)                       | Latest successful non-PR CI build of `main`            |
| DDL      | When a `validDomains.json` change must reach the live list | `teams-js/validDomains/json/validDomains.json` on the Prod CDN, overwriting | A CI build containing the change                       |

- The beta version comes from `packages/teams-js/prepBetaRelease.cjs`, which `main` CI runs: the next beachball
  version plus `-beta.N`. Nobody edits a beta version by hand.
- **Beta skip rule.** Skip a weekly beta only when nothing has merged to `main` since the build the last beta
  published. Confirm that from commit history, not memory, and record the skip with the reason.
- The Prod pipeline publishes the npm package and the versioned CDN folder only. It does **not** push the
  valid-domains list; that is the DDL pipeline's job. If a release changes
  `packages/teams-js/src/artifactsForCDN/validDomains.json`, plan a DDL run with the release owner.

## ⛔ Confirmation gates

A gate means: show the exact details, then **wait for an explicit reply in the conversation**. Pre-approval in the
initial prompt ("go end to end", "I approve all gates") does not satisfy a gate. In autopilot or any non-interactive
mode, stop calling tools, print `⛔ AUTOPILOT HOLD - RELEASE SKILL CONFIRMATION GATE` with the details, and yield.

Every write is a gate:

1. **Version and type.** Show the version, release type, release branch, working branch and source commit. A version
   published to npm is burned forever.
2. **Each push and each branch creation**, including the release branch.
3. **Each PR** (prep, merge-back, downstream bumps): show title, base, head and body first.
4. **Each pipeline queue**: show the pipeline by role, the branch, the CI build it consumes and the version inside it.
5. **GitHub release create or edit**, including setting it as Latest.
6. **Any message** (review request, announcement). Release approval never authorizes a message. Each message needs
   its own approval of the exact text and destination, and a readback after it is sent. Test and dry runs are never
   announced.

The releaser never approves their own Lockbox request or their own PR. Never merge a PR without a human code-owner
approval on its current head.

## Prerequisites

- **Repository:** write access to create `release/*` branches, and a code owner (`CODEOWNERS`) available to review
  PRs into `release/*`.
- **Internal ADO:** permission to queue the Prod, SDF and DDL release pipelines, and to authorize the CI pipeline
  resource on the first run. Sign in with `az login` if you use the CLI.
- **Lockbox:** your eligibility is active. It lapses after about 30 days unused; renew it before release day, from a
  managed device if the internal runbook says so. A second eligible person must be available to approve.
- **Tools:** Node 18 (what CI uses), pnpm 9.15.9, git, and `gh` for GitHub reads. On Windows, run the bash blocks in
  Git Bash.
- **npm reachability:** from some corporate networks the public registry is blocked or intercepted. If
  `npm view @microsoft/teams-js version` fails or disagrees with what you expect, confirm from a machine that can reach
  `https://registry.npmjs.org` or a public mirror. An unreachable registry is never evidence that a version is free.

## Step 0 - Summarize the plan

Before touching anything, state the release type, the version you expect, the ordered steps below with each ⛔ gate,
and where you will hand over to someone else (code-owner review, Lockbox approval). One short block.

## Step 1 - Pre-flight (read-only)

```bash
set -euo pipefail
git fetch origin --prune
git log -1 --format='%H %s' origin/main
ls change/                                   # pending change files; none means nothing to release
npm view @microsoft/teams-js dist-tags       # current latest and beta
git ls-remote --heads origin 'release/*' | tail -5
gh pr list --state open --base main --limit 50
```

Check and report:

- `main` CI is green, or the failure is known and unrelated to the release.
- Every feature PR meant for this release has merged, and none are mid-merge. Agree a content freeze for the release
  morning; a PR merged the day before changes the release.
- Pending change files exist. A leftover `none` file ("Released x.y.z") from the last merge-back does not bump the
  version by itself.
- Whether `release/<x.y.z>` already exists (see the failure modes for a stale branch).
- Any release pipeline fix merged since the last release (for example [#3187](https://github.com/OfficeDev/microsoft-teams-library-js/pull/3187)
  or [#3198](https://github.com/OfficeDev/microsoft-teams-library-js/pull/3198)). The release pipelines read their YAML
  from the branch you queue, so a fix reaches a release only if the release branch contains it. A fix still needed on
  release day costs at least an hour and a half (see the failure modes), so check this the day before.
- Lockbox eligibility and an approver are lined up for today. Approval waits have ranged from under an hour to more
  than a day, so queue early.

Stop here if there is nothing to release.

## Prod release

### 2. Prepare the bump locally

```bash
set -euo pipefail
git fetch origin main
source_commit="$(git rev-parse origin/main)"
git switch -c "<alias>/release_<x.y.z>-1" "$source_commit"
pnpm install                       # without it, preRelease.js fails with "beachball is not recognized"
node tools/cli/preRelease.js       # capital R; the lowercase name fails on case-sensitive file systems
version="$(node -p "require('./packages/teams-js/package.json').version")"
echo "$version"
git status --short
```

`preRelease.js` runs `beachball bump`, builds, reads the UMD integrity hash from
`packages/teams-js/dist/umd/MicrosoftTeams-manifest.json`, and rewrites the version carriers. Expect about ten
changed files: consumed change files deleted, `packages/teams-js/CHANGELOG.md`, both `package.json` files,
`packages/teams-js/README.md` and `apps/teams-test-app/index_cdn.html` (script `src` and `integrity`), and
`pnpm-lock.yaml`. Anything else is a reason to stop and look.

Check the carriers and that the version is free (see [Checks](#checks)):

```bash
check carriers --version "$version"
check check-version --version "$version"
```

`check-version` exits 0 only when npm, the Prod CDN folder and the `v<version>` tag are all absent. Exit 3 means a
source was unreachable or answered unexpectedly: resolve it from another network, do not proceed on a guess.

**⛔ Gate 1:** show the version, the diff summary, the new CHANGELOG section and the branch names.

Do not use `.github/workflows/prerelease.yml`. It force-pushes `release/<version>` with an unreviewed bump.

### 3. Create the release branch

The branch must be named exactly `release/<x.y.z>`: the CI build triggers on `release/*`, the Prod pipeline only runs
from `main` or `release/*`, and downstream internal test pipelines resolve the branch by that exact name.

Create it at the same commit the bump was prepared from:

```bash
git push origin "$source_commit:refs/heads/release/$version"   # ⛔ Gate 2
```

If the branch already exists, stop and read "Stale release branch" in the failure modes. Never force-push it.

### 4. Open the prep PR into the release branch

```bash
git commit -am "Pre release $version"
git push --set-upstream origin "<alias>/release_$version-1"   # ⛔ Gate 2
node tools/cli/readChangelog.js "$version"                     # the PR body
```

**⛔ Gate 3:** open the PR from the working branch into `release/<x.y.z>` (**not** `main`), titled
`Pre release <x.y.z>`, with the CHANGELOG section as the body. PRs into `release/*` are squash-only and need a
code-owner approval after the last push; a push dismisses earlier approvals. The reviewer checks the expected files
and that the PR body matches the CHANGELOG. Wait for the merge; do not continue while it is open.

A green prep PR proves nothing about the build: the ADO PR pipeline skips PRs into `release/*`, so the only check that
runs is the CLA. The build gate is the CI run on `release/<x.y.z>` after the merge (step 7). The release PR
validation in [#3141](https://github.com/OfficeDev/microsoft-teams-library-js/pull/3141) is meant to close this gap.

When the prep PR also carries commits already merged to `main` (for example when reusing a release branch), automated
reviewers may comment on those files rather than the bump. Answer with evidence, such as that change's own green CI on
`main`. A real problem gets fixed on `main` and reaches the release through the branch, never by a commit made only on
`release/<x.y.z>`.

### 5. Verify the release branch carries the bump

```bash
set -euo pipefail
git fetch origin "release/$version"
git switch --detach "origin/release/$version"
check carriers --version "$version"
```

A tag or GitHub release created before the bump lands points at the wrong commit.

### 6. Create the GitHub release as a pre-release

**⛔ Gate 5:** tag `v<x.y.z>`, target `release/<x.y.z>` at the verified commit, title `v<x.y.z>`, body the CHANGELOG
section, **pre-release** ticked, no binaries attached. It stays a pre-release until step 9 passes.

When the GitHub pre-release automation in [#3143](https://github.com/OfficeDev/microsoft-teams-library-js/pull/3143)
lands, this step becomes "verify the pre-release the workflow created" rather than creating one.

### 7. Integrity gate on the CI build

The merge triggers the CI build of `release/<x.y.z>`. Check that the whole run succeeded, including the Build Test
Publish job, not just that it finished. Then note its build number and download its `CDNFeed` artifact:

```bash
check artifact --version "$version" --file "<download>/CDNFeed/$version/js/MicrosoftTeams.min.js"
```

This proves the bundle the pipeline will ship is the one the README and test app SRI were computed from. A mismatch
means the published SRI would break every page that uses it: stop.

### 8. Queue the Prod release pipeline

**⛔ Gate 4:** in the internal ADO project, run the Prod release pipeline from branch `release/<x.y.z>` with the
pipeline resource set to the CI build from step 7. Before queuing, confirm the artifact retention task succeeded in
the latest `main` CI run, and that the release branch uses the same task version:

```bash
git grep -n 'AssetRetention@' "origin/release/$version" -- tools   # every line @6 or later
```

Then:

- Find the Lockbox request ID in the "Lockbox Approval Request" task log and raise it with the run link where the
  internal runbook says. Someone else approves it.
- Watch the job: artifact download, deployment preparation, artifact retention (ARROW), `npm pack`, the ESRP npm
  publish with tag `latest`, the 1CDN upload, then "View Published Package URLs".
- Judge the run by the ESRP publish and 1CDN upload task results in the timeline, **not** the run status. Until
  [#3187](https://github.com/OfficeDev/microsoft-teams-library-js/pull/3187) lands, the last task fails on every run,
  and a successful Prod run can also report partially succeeded.

Never re-queue a run that may have published without first checking npm and the CDN (step 9). The CDN upload does not
overwrite, so a second attempt at a published version fails rather than repairing anything.

### 9. Verify publication, fail closed

```bash
check published --version "$version" --dist-tag latest
```

It passes only when the Prod CDN file hashes to the carrier SRI **and** npm reports the version with `latest` pointing
at it. npm and the CDN together are the release; one without the other is half published. The npmjs.com package page
can lag by about 40 minutes; trust the registry answer. If the public registry is unreachable (exit 3), pass
`--registry <https mirror>` or run it from a machine that reaches `https://registry.npmjs.org` before declaring
success. Note the CDN byte count it prints for the size record.

### 10. Promote, merge back and update consumers

- **⛔ Gate 5:** edit the GitHub release: untick pre-release and set it as the latest release.
- **⛔ Gates 2-3:** merge back with `<alias>/cleanup_release_<x.y.z>` cut from `release/<x.y.z>`, merge `origin/main`
  into it, add a `none` change file (`pnpm changefile`, comment `Released <x.y.z>`), and open a PR to `main` titled
  `Cleanup release v<x.y.z>`. Never force-push `main` or change the deployed release branch.
- **⛔ Gates 2-3:** bump the internal downstream test pipelines that pin a TeamsJS version, per the internal runbook.
- `postrelease.yml` notifies a downstream repository when the prep PR merges. It has failed on recent releases without
  affecting publication; report it, do not block on it.
- If the release changed the valid-domains list, run the DDL release below.

### 11. Communication drafts

Prepare, do not send:

- **Review request** for the prep and merge-back PRs, once CI is green, with titled links.
- **Announcement**, only after step 9 passed: "teams-js v<x.y.z> has been released to npm and CDN", the npm version
  page (`https://www.npmjs.com/package/@microsoft/teams-js/v/<x.y.z>`), the Prod CDN URL, the GitHub release, and the
  Minor changes and Patches lists copied from the real CHANGELOG section, not from memory or the PR list.

Each is a separate **⛔ Gate 6**. Record what was sent and where, so a retry never double-posts.

### 12. Close out

Record the bundle size and the delta from the previous version where the internal runbook keeps it, close the
release work item, and run the retro (below).

## SDF beta

1. Pre-flight as in step 1. Apply the skip rule; in a Prod week there is no beta.
2. Pick the latest successful non-PR CI build of `main`. Its `CDNFeed` folder name is the beta version.
3. `check sri --file "<download>/CDNFeed/<beta>/js/MicrosoftTeams.min.js"` and keep the result.
4. **⛔ Gate 4:** queue the SDF release pipeline with that build as its resource. Lockbox and judging the run work as
   in Prod step 8.
5. Verify:

   ```bash
   check published --version "<beta>" --environment sdf --dist-tag beta --expected-sri "<sri from step 3>"
   ```

No release branch, PR, GitHub release or announcement for a beta unless the internal runbook asks for one.

## DDL (valid domains)

1. Confirm with the release owner that the valid-domains change must go live now, and which CI build contains it.
   The DDL pipeline also runs the artifact retention task, so the ARROW failure mode applies to it too.
2. **⛔ Gate 4:** queue the DDL release pipeline with that build. It overwrites the stored list and needs its own
   Lockbox approval.
3. From a checkout of that build's commit, `check domains` passes when the live list equals the source.
4. The list lives at a path with no version, and the CDN serves it with a one-year `Cache-Control: max-age`. A
   successful upload therefore usually stays invisible until the CDN cache is purged. If `check domains` still fails
   after the run, compare the CDN's `Last-Modified` header (`curl -sI <url>`) with the time of the run, then
   **⛔ request the purge** through the process in the internal runbook and rerun `check domains` afterwards. Do not
   queue the DDL again just to refresh the cache.

## Checks

The deterministic checks live in [`check-release.js`](./check-release.js). It uses only Node built-ins, reads files
and public URLs, and never writes anything. Define a shorthand once per shell:

```bash
check() { node .github/skills/release-teamsjs/check-release.js "$@"; }
```

| Command         | Passes when                                                                               |
| --------------- | ----------------------------------------------------------------------------------------- |
| `check-version` | the version is absent from npm, the Prod CDN and GitHub tags                              |
| `carriers`      | both `package.json` files, the README and the test app name the version and share one SRI |
| `artifact`      | a downloaded CI bundle hashes to that SRI                                                 |
| `published`     | the CDN bytes match the SRI and npm has the version, and the dist-tag if given            |
| `domains`       | the live valid-domains list equals the source                                             |
| `links`, `sri`  | (informational) the public announcement links, or a file's SRI                            |

Exit codes: `0` passed, `1` a check failed, `2` usage error, `3` a source was unreachable or answered unexpectedly.
Exit 3 is never success.

## Retro: feed back what the run taught

Close every run by asking: **would knowing this at the start have changed what I did?** Most runs teach nothing; then
say so in one line and stop.

When a run does teach something (a new failure with its symptom and fix, a stale fact, an ambiguous step), open a
**draft** PR from a clean branch off `main` that changes only `.github/skills/release-teamsjs/**`. Never fold it into
a release branch. Changes outside the published package need no change file.

A retro may tighten this skill, never loosen it: it may not remove a gate, relax verification, or let the releaser
approve their own release. Write invariants, not incident stories, and keep internal details out.

## Related work

This skill documents the process as it runs today and points at the automation that will replace manual steps:

- [#3139](https://github.com/OfficeDev/microsoft-teams-library-js/pull/3139)-[#3143](https://github.com/OfficeDev/microsoft-teams-library-js/pull/3143)
  (release pipeline 1-4): a shared changelog extractor, release-integrity and SRI validation, a required check on PRs
  into `release/*`, and GitHub pre-release creation on merge. When they land, steps 4-6 become checks of what the
  automation did, and their validation overlaps `check carriers`; prefer theirs in CI.
- [#3032](https://github.com/OfficeDev/microsoft-teams-library-js/pull/3032): agent instructions and the contributor
  skill, which own build, test and change-file guidance.
- [#3187](https://github.com/OfficeDev/microsoft-teams-library-js/pull/3187) and
  [#3198](https://github.com/OfficeDev/microsoft-teams-library-js/pull/3198): release pipeline fixes.

## Reference

| What                                | Where                                                                             |
| ----------------------------------- | --------------------------------------------------------------------------------- |
| Versioning and change-file rules    | `beachball.config.js`, `CONTRIBUTING.md`                                          |
| Prod bump                           | `tools/cli/preRelease.js`                                                         |
| Beta version                        | `packages/teams-js/prepBetaRelease.cjs`                                           |
| CHANGELOG section for PR bodies     | `tools/cli/readChangelog.js`                                                      |
| CI build and its artifacts          | `tools/releases/build-release.yml`, `tools/yaml-templates/build-test-publish.yml` |
| Prod, SDF and DDL release pipelines | `tools/releases/prod-release.yml`, `sdf-release.yml`, `ddl-release.yml`           |
| Downstream notification             | `.github/workflows/postrelease.yml`                                               |
| Valid-domains source                | `packages/teams-js/src/artifactsForCDN/validDomains.json`                         |
| Read-only checks                    | `.github/skills/release-teamsjs/check-release.js`                                 |
