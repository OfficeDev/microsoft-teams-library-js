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

## Ownership

One owning team runs TeamsJS releases end to end. Its members release, approve each other's Lockbox requests,
review the release PRs (as code owners) and receive the review requests. Announcements go to both the owning team's
chat and the platform SDK channel. Ask that team, in the team chat and channels the internal runbook lists, rather
than other teams' channels. The current approvers and contacts live in the internal runbook, not here.

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
  valid-domains list; that is the DDL pipeline's job. Once the SDK has fetched the live list from the CDN it validates
  against that list instead of the one bundled in the package, so a Prod release alone does not reliably make new
  origins valid. After every release, compare `packages/teams-js/src/artifactsForCDN/validDomains.json` with the live
  list (see the DDL section) and plan a DDL run with the release owner if they differ.

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
- **Lockbox:** two separate permissions, both described in the internal runbook. You need active Lockbox
  eligibility to queue a pipeline that raises a request (Prod, SDF and DDL all do). The approver must be a different
  member of the owning team who is in the release approver group, with active eligibility and the managed device and
  hardware key the runbook requires. Request eligibility through the access portal the runbook names. Eligibility
  lapses after about 30 days unused; renew it before release day. Line
  up the approver before
  you queue.
- **Tools:** Node 18 (what CI uses), pnpm 9.15.9, git, and `gh` for GitHub reads. On Windows, run the bash blocks in
  Git Bash.
- **npm reachability:** some corporate devices cannot reach `registry.npmjs.org` at all, even with
  `--registry https://registry.npmjs.org`; the TLS handshake fails. There, use the default configured registry
  (`npm view @microsoft/teams-js dist-tags --json`), which can lag; the publish task's "npm notice version" log line;
  the npmjs.com version page in a browser; and a public mirror such as jsDelivr. An unreachable registry is never
  evidence that a version is free or published.

## Step 0 - Summarize the plan

Before touching anything, state the release type, the version you expect, the ordered steps below with each ⛔ gate,
and where you will hand over to someone else (code-owner review, Lockbox approval). One short block.

Typical timings to plan around: the release-branch CI run takes about 25 minutes (once, 2 hours); Lockbox approval
usually under 10 minutes but up to more than a day; the publish job about 10 minutes after approval; the npmjs.com
page up to 40 minutes behind the registry; the merge-back PR 1 to 3 hours. Queue Prod by early afternoon. Several
past releases slipped by a day or more between the GitHub release and npm. Take times from pipeline and API
timestamps rather than the local clock, which can be off.

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
- Lockbox eligibility (yours, confirmed or re-requested at least one business day ahead; a lapsed requester is the
  most common first-run failure) and an approver plus a backup from the owning team are lined up for today.

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

**⛔ Gate 1:** show the version, the diff summary, the new CHANGELOG section and the branch names. Cross-check the
version against the latest beta (`npm view @microsoft/teams-js dist-tags.beta`): without its `-beta.N` suffix it is
normally the same version. Explain any difference before asking.

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
code-owner approval after the last push; a push dismisses earlier approvals. Wait for the merge; do not continue while
it is open. The reviewer confirms the PR has exactly:

- every pending change file deleted
- a new version section in `packages/teams-js/CHANGELOG.md` holding those entries, matching the PR body
- the new version in `packages/teams-js/package.json` and `apps/teams-test-app/package.json`
- the script `src` and `integrity` in `packages/teams-js/README.md` and `apps/teams-test-app/index_cdn.html` pointing
  at the new version
- `pnpm-lock.yaml` churn and nothing else

A green prep PR proves nothing about the build: the ADO PR pipeline skips PRs into `release/*`, so the only check that
runs is the CLA. The build gate is the CI run on `release/<x.y.z>` after the merge (step 6). The release PR
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

### 6. Integrity gate on the CI build

The merge triggers the CI build of `release/<x.y.z>`, named after the prep PR. Wait for it, and check that the whole
run succeeded, including the Build Test Publish job, not just that it finished.

Every release branch gets at least two CI runs: one when the branch is pushed, one when the prep PR merges. A
reused branch can also carry an old successful run with the previous release's content. Use the run **from the prep
PR merge**, at the release branch's head commit, never an earlier one. Note its build number and download its
`CDNFeed` pipeline artifact; its only version folder must be named `<x.y.z>`:

```bash
ls "<download>/CDNFeed"                             # exactly one folder, named $version
check artifact --version "$version" --file "<download>/CDNFeed/$version/js/MicrosoftTeams.min.js"
```

This proves the bundle the pipeline will ship is the one the README and test app SRI were computed from. A mismatch
means the published SRI would break every page that uses it: stop.

### 7. Create the GitHub release as a pre-release

**⛔ Gate 5:** once the CI run in step 6 has passed, create the GitHub release: tag `v<x.y.z>` (a new tag), target
`release/<x.y.z>` at the verified commit, title `v<x.y.z>`, body the CHANGELOG section, **pre-release** ticked, no
binaries attached (publishing adds them). It stays a pre-release until step 9 passes. Read it back: the tag points at
the release branch head, it is a pre-release, and the previous release is still Latest:

```bash
check github-release --version "$version" --expect prerelease
```

The internal runbook creates it straight after the prep PR merges, before CI. Waiting for CI means a failed build
never leaves a dangling tag; either order works as long as it happens before Prod is queued.

When the GitHub pre-release automation in [#3143](https://github.com/OfficeDev/microsoft-teams-library-js/pull/3143)
lands, this step becomes "verify the pre-release the workflow created" rather than creating one.

### 8. Queue the Prod release pipeline

**⛔ Gate 4:** in the internal ADO project, run the Prod release pipeline from branch `release/<x.y.z>` (not `main`)
and **explicitly set the pipeline artifact** to the CI build from step 6; do not accept whatever is preselected.
Before queuing, confirm the artifact retention task succeeded in the latest `main` CI run, and check the release
branch's pipeline YAML (Prod publishes with `tag latest`, artifact retention is @6 or later) from a checkout of it:

```bash
git switch --detach "origin/release/$version"
check pipeline-config
```

Then:

- Find the Lockbox request ID in the "Lockbox Approval Request" task log (it is also in the request email). Check
  the request targets the TeamsJS release service group the runbook names; a request routed to another team cannot
  be approved by the release approvers. Ask the owning team's approvers in the owning team's chat, with the ID and
  run link. Someone other than the releaser approves it.
- Watch the job: artifact download, deployment preparation, artifact retention (ARROW), `npm pack`, the ESRP npm
  publish, the 1CDN upload, then "View Published Package URLs".
- Judge the run by these tasks in the job, **not** the run status: artifact retention, "Publish to npm (tag latest) -
  ESRP release" and "Push teams-js to M365 1CDN (Prod)". The npm task name must say **tag latest**; a past typo
  published a Prod release with the `beta` tag.
- Until [#3187](https://github.com/OfficeDev/microsoft-teams-library-js/pull/3187) lands, a successful Prod run ends
  **failed**: "View Published Package URLs" is the only red task, and because of it the template's closing "Publish
  to ARROW" step is skipped. Any other red task is a real failure. A warning that the ESRP release task "will be
  blocked in future releases" appears on every run and does not block today.

Never re-queue a run that may have published without first checking npm and the CDN (step 9). The CDN upload does not
overwrite, so a second attempt at a published version fails rather than repairing anything.

### 9. Verify publication, fail closed

```bash
check published --version "$version" --dist-tag latest
```

It passes only when the Prod CDN file hashes to the carrier SRI **and** npm reports the version with `latest` pointing
at it. npm and the CDN together are the release; one without the other is half published. The npmjs.com package page
can lag by about 40 minutes; trust the registry answer. If this device cannot reach the public registry (exit 3), pass
`--registry <https mirror>`, or use the fallbacks in Prerequisites: the default registry, the publish task's "npm
notice version" line and the npmjs.com version page in a browser. Note the CDN byte count it prints for the size
record.

### 10. Promote, merge back and update consumers

- **⛔ Gate 5:** edit the GitHub release: untick pre-release and set it as the latest release, then
  `check github-release --version "$version" --expect latest`.
- **⛔ Gates 2-3:** merge `release/<x.y.z>` back to `main` with a PR titled `Cleanup release v<x.y.z>`. If `main` has
  not moved since the branch was cut, a PR straight from the release branch merges cleanly. Otherwise cut
  `<alias>/cleanup_release_<x.y.z>` from `release/<x.y.z>`, merge `origin/main` into it and open the PR from that;
  if the change-file check then fails, add a `none` change file (`pnpm changefile`, comment `Released <x.y.z>`).
  Merging `main` can bring back change files the release already consumed; delete any change file whose comment
  appears in the new CHANGELOG section, or the next release ships those entries twice.
  Never force-push `main`. A PR from release content can run an extra end-to-end check against the newly deployed
  CDN; leave the PR open until it completes. After it merges, `check merged-back --version "$version"` confirms
  `main` has the release's CHANGELOG section (the merge-back is squashed, so commit ancestry cannot show it).
- **Never push to `release/<x.y.z>` after Prod.** Internal downstream tests check that branch out by name.
- **⛔ Gates 2-3:** update the internal hub end-to-end tests to cover the new version, per the internal runbook. On the
  web side that is a PR that bumps the pinned TeamsJS version and adds the version to the client SDK checkpoint lists
  in both test helpers; it needs a linked work item. The iOS pipelines follow the latest release automatically. This
  step is easy to forget, and one recent release went without it.
- `postrelease.yml` tries to notify a downstream repository when the prep PR merges. It currently fails on every
  release with a credentials error, so that repository is not being notified; report it, do not block on it.
- Compare the valid-domains list (DDL section, step 3). If the live list differs from `main`, raise a DDL run with
  the release owner.

### 11. Communication drafts

Prepare, do not send:

- **Review request** for the prep and merge-back PRs, once CI is green, with titled links, to the owning team's chat.
- **Announcement**, only after step 9 passed, in both the owning team's chat and the platform SDK channel the internal
  runbook names. Subject
  `TeamsJS v<x.y.z> Release`; body "teams-js v<x.y.z> has been released to npm and CDN", the npm version page
  (`https://www.npmjs.com/package/@microsoft/teams-js/v/<x.y.z>`), the Prod CDN URL, the GitHub release, and the
  Minor changes and Patches lists copied from the real CHANGELOG section, not from memory or the PR list. Tag the
  current contacts listed in the runbook; older example posts tag people who are no longer the contacts.
  Two recent announcements linked the previous version: save the draft to a file, run
  `check announcement --version "$version" --file <draft>`, and open every link fresh before sending.

Each is a separate **⛔ Gate 6**. Record what was sent and where, so a retry never double-posts.

### 12. Close out

Record the bundle size and the delta from the previous version in the size table the internal runbook keeps
(`check size --version "$version" --previous <previous version>` prints both), close the release work item, then
confirm the post-release checklist and run the retro (below).

### Post-release checklist

- [ ] npm has the version, and `latest` points at it: `check published --version <v> --dist-tag latest`
- [ ] The Prod CDN serves `MicrosoftTeams.min.js` for the version with the README SRI: the same command
- [ ] The GitHub release is published, not a pre-release, and marked Latest:
      `check github-release --version <v> --expect latest`
- [ ] The release branch is merged back to `main`: `check merged-back --version <v>`
- [ ] The web hub end-to-end tests cover the new version; iOS is automatic (step 10; internal, so not scripted)
- [ ] The announcement is posted (step 11)
- [ ] The size table has the new entry: `check size --version <v> --previous <p>` gives the numbers

## SDF beta

1. Pre-flight as in step 1. Apply the skip rule; in a Prod week there is no beta.
2. Pick the latest successful non-PR CI build of `main`; both of its stages must be green. Its `CDNFeed` folder name is
   the beta version. Checking it before queuing is what stops an unexpected version from being published.
   - The beta must be newer than the current `latest`: `check beta-version --version "<beta>"` passes only when
     `<x.y.z>` in `<x.y.z>-beta.N` is greater than npm's `latest`. Two past betas were published for versions that
     had already shipped, which sorts them below the release.
   - Note any feature that will reach Prod without a beta soak (merged after the last beta) and tell the release
     owner.
3. `check sri --file "<download>/CDNFeed/<beta>/js/MicrosoftTeams.min.js"` and keep the result.
4. **⛔ Gate 4:** queue the SDF release pipeline with that build as its resource. Lockbox and judging the run work as
   in Prod step 8.
5. Verify:

   ```bash
   check published --version "<beta>" --environment sdf --dist-tag beta --expected-sri "<sri from step 3>"
   ```

   The npm publish task's log also shows the published version ("npm notice version"); it must match `<beta>`.

No release branch, PR, GitHub release or announcement for a beta unless the internal runbook asks for one.

## DDL (valid domains)

1. Confirm with the release owner that the valid-domains change must go live now, and which CI build contains it.
   The DDL pipeline also runs the artifact retention task, so the ARROW failure mode applies to it too.
2. **⛔ Gate 4:** queue the DDL release pipeline with that build. It overwrites the stored list and needs its own
   Lockbox approval. A successful DDL run normally ends "partially succeeded".
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

| Command                | Passes when                                                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `check-version`        | the version is absent from npm, the Prod CDN and GitHub tags                                                                                                        |
| `carriers`             | both `package.json` files, the README and the test app name the version and share one SRI                                                                           |
| `artifact`             | a downloaded CI bundle is under `CDNFeed/<v>/js` and hashes to that SRI                                                                                             |
| `published`            | the CDN bytes match the SRI and npm has the version, and the dist-tag if given                                                                                      |
| `domains`              | the live valid-domains list equals the source                                                                                                                       |
| `github-release`       | `--expect prerelease` or `latest`: the release is in that state, tag `v<v>` carries the bump and sits at the release branch head, and Latest is right for the stage |
| `merged-back`          | `main`'s CHANGELOG has the version's section                                                                                                                        |
| `pipeline-config`      | the checkout's release YAML: Prod publishes with `tag latest`, SDF with `tag beta`, artifact retention @6+                                                          |
| `beta-version`         | a beta `<x.y.z>-beta.<n>` is of a version newer than npm's `latest`                                                                                                 |
| `announcement`         | every npm, CDN and GitHub release link in a draft names the version, and npm and CDN links are present                                                              |
| `size`, `links`, `sri` | (informational) bundle bytes and change from `--previous`, announcement links, a file's SRI                                                                         |

GitHub API calls send `GITHUB_TOKEN` as a bearer token when it is set, which avoids anonymous rate limits.

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
  into `release/*`, and GitHub pre-release creation on merge. When they land, steps 4-7 become checks of what the
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
