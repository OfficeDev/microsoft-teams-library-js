---
name: release-teamsjs
description: Use when releasing @microsoft/teams-js from this repository - the monthly Prod release, the weekly SDF beta, or a valid-domains (DDL) push. Covers pre-flight, version selection, the release branch and prep PR, the internal pipelines with their approvals, verification on npm and the CDN, the GitHub release, merge-back, the announcement draft and failure recovery. Triggers on "release teams-js", "cut a TeamsJS release", "ship 2.59.0", "do the SDF beta", "push valid domains".
---

# release-teamsjs

Interactive workflow for releasing `@microsoft/teams-js`. It guides a maintainer; it does not hold any permission
itself, and nothing in it bypasses a branch ruleset, a required review or a pipeline approval.

**This repository is public.** Publishing runs in Microsoft's internal Azure DevOps and needs approvals from people
other than the releaser. Pipeline IDs, internal URLs, approver group names, channel names and people's names live in
the internal TeamsJS release runbook (the "TeamsJS v2.0 Release Process" page in the team's internal wiki) and must
not be added here or pasted into PRs, issues or release notes. When this file says "the internal runbook", open that
page rather than guessing.

Read [`failure-modes.md`](./failure-modes.md) before a first release and whenever anything looks wrong.

## Ownership

One owning team runs TeamsJS releases end to end. Its members release, approve each other's Lockbox requests,
review the release PRs (as code owners) and receive the review requests. The formal announcement goes to the platform
SDK channel, with a short note in the owning team's chat. Ask that team, in the team chat and channels the internal
runbook lists, rather than other teams' channels. The current approvers and contacts live in the internal runbook, not
here.

## At a glance

- **The day before:** Lockbox eligibility confirmed, an approver and a backup named, pipeline fixes already on `main`,
  the release work item created.
- **Release morning:** content freeze, version gate, release branch, prep PR, code-owner review.
- **After the prep PR merges:** the release CI run, the integrity gate, the GitHub pre-release, Prod with Lockbox.
- **After Prod:** verify npm and the CDN, promote to Latest, merge back, hub test bump, announcements, size table.
- **Any time something is red:** [`failure-modes.md`](./failure-modes.md) before re-running anything.

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
  valid-domains list; that is the DDL pipeline's job. Every TeamsJS version bundles a copy of the list, but uses it
  only until the live list loads from the CDN, when that fetch fails, and in server-side rendering; once the live list
  has loaded, it replaces the bundled copy. So new origins are reliably accepted, by the new version and by every
  older one, only after a DDL run reaches the CDN edge. After every release, compare
  `packages/teams-js/src/artifactsForCDN/validDomains.json` with the live list (see the DDL section) and plan a DDL run
  with the release owner if they differ.

## ⛔ Confirmation gates

A gate means: show the exact details, then **wait for an explicit reply in the conversation**. Pre-approval in the
initial prompt ("go end to end", "I approve all gates") does not satisfy a gate. In autopilot or any non-interactive
mode, stop calling tools, print `⛔ AUTOPILOT HOLD - RELEASE SKILL CONFIRMATION GATE` with the details, and yield.

Every write is a gate:

1. **Version and type.** Show the version, release type, release branch, working branch and source commit. A version
   published to npm is burned forever.
2. **Each push and each branch creation**, including the release branch.
3. **Each PR** (prep, merge-back, downstream bumps): show title, base, head and body first.
4. **GitHub release create or edit**, including setting it as Latest.
5. **Each pipeline queue**: show the pipeline by role, the branch, the CI build it consumes and the version inside it.
6. **Any message** (Lockbox ask, review request, announcement). Release approval never authorizes a message. Each
   message needs its own approval of the exact text and destination, and a readback after it is sent. Test and dry
   runs are never announced.
7. **Any wiki or work-item create or edit**, including the size table and the release work item.

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
  lapses after about 30 days unused; renew it before release day. Line up the approver before you queue.
- **Tools:** Node 18 (what CI uses), pnpm 9.15.9, git, and `gh` for GitHub reads. On Windows, run the bash blocks in
  Git Bash.
- **npm reachability:** some corporate devices cannot reach `registry.npmjs.org` at all, even with
  `--registry https://registry.npmjs.org`; the TLS handshake fails. A corporate proxy registry and public mirrors such
  as jsDelivr or unpkg can lag by hours: they can confirm that a version **is** published, never that it is absent or
  that a dist-tag is current. Use them, the publish task's "npm notice version" log line and the npmjs.com version page
  in a browser to confirm presence. Prove absence (a free version) only from `registry.npmjs.org`, from another
  machine if needed. An unreachable or lagging registry is never evidence either way.

## Step 0 - Summarize the plan

Before touching anything, state the release type, the version you expect, the ordered steps below with each ⛔ gate,
and where you will hand over to someone else (code-owner review, Lockbox approval). One short block.

Typical timings to plan around: the release-branch CI run takes about 25 minutes (once, 2 hours); Lockbox approval
usually under 10 minutes but up to more than a day; the publish job about 10 minutes after approval; the npmjs.com
page up to 40 minutes behind the registry; the merge-back PR 1 to 3 hours. Queue Prod by early afternoon. On four
past releases npm came 18 to 91 hours after the GitHub release. Take times from pipeline and API timestamps rather
than the local clock, which can be off.

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
- The release work item exists. Create it at the start of the release week under the parent the internal runbook
  names (**⛔ Gate 7**); the downstream hub test PR links to it, and step 12 closes it.

Stop here if there is nothing to release.

## Prod release

### 2. Prepare the bump locally

```bash
set -euo pipefail
git fetch origin main
source_commit="$(git rev-parse origin/main)"
git switch --detach "$source_commit"
pnpm install                       # without it, preRelease.js fails with "beachball is not recognized"
node tools/cli/preRelease.js       # capital R; the lowercase name fails on case-sensitive file systems
version="$(node -p "require('./packages/teams-js/package.json').version")"
echo "$version"
git switch -c "<alias>/release_${version}-1"   # local only; carries the uncommitted bump
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

`check-version` exits 0 only when `registry.npmjs.org`, the Prod CDN folder and the `v<version>` tag all show the
version absent, and no mirror lists it. A proxy or mirror that lacks the version proves nothing, so where the public
registry is unreachable the npm leg is inconclusive (exit 3): resolve it from another network, do not proceed on a
guess.

**⛔ Gate 1:** show the version, the diff summary, the new CHANGELOG section and the branch names. Cross-check the
version against the latest beta (`npm view @microsoft/teams-js dist-tags.beta`): without its `-beta.N` suffix it is
normally the same version. Explain any difference before asking.

Do not use `.github/workflows/prerelease.yml`. It has never been run: it lacks `contents: write`, it would force-push
`release/<version>` from `main`'s head while the bump goes to a separate generated PR, and the ruleset blocks
force-pushes to release branches. Follow the manual steps here.

### 3. Create the release branch

The branch must be named exactly `release/<x.y.z>`: the CI build triggers on `release/*`, the Prod pipeline only runs
from `main` or `release/*`, and downstream internal test pipelines resolve the branch by that exact name.

Create it at the same commit the bump was prepared from, only if it does not exist yet:

```bash
if git ls-remote --exit-code --heads origin "release/$version" >/dev/null; then
  echo "release/$version already exists; see 'Stale release branch' in the failure modes" >&2; exit 1
fi
git push origin "$source_commit:refs/heads/release/$version"   # ⛔ Gate 2
```

Never force-push it. Rulesets block that for most people, but not for bypass actors.

### 4. Open the prep PR into the release branch

```bash
git commit -am "Pre release $version"
git push --set-upstream origin "<alias>/release_${version}-1"   # ⛔ Gate 2
node tools/cli/readChangelog.js "$version"                       # the PR body
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
validation workflow in [#3140](https://github.com/OfficeDev/microsoft-teams-library-js/pull/3140) is meant to close
this gap.

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
`CDNFeed` pipeline artifact. Besides a `_manifest` folder, it must hold exactly one version folder, named `<x.y.z>`:

```bash
ls "<download>/CDNFeed"                             # _manifest plus one folder, named $version
check artifact --version "$version" --file "<download>/CDNFeed/$version/js/MicrosoftTeams.min.js"
```

This proves the bundle the pipeline will ship is the one the README and test app SRI were computed from. A mismatch
means the published SRI would break every page that uses it: stop.

### 7. Create the GitHub release as a pre-release

**⛔ Gate 4:** once the CI run in step 6 has passed, create the GitHub release: tag `v<x.y.z>` (a new tag), target
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

**⛔ Gate 5:** in the internal ADO project, run the Prod release pipeline from branch `release/<x.y.z>` (not `main`)
and **explicitly set the pipeline artifact** to the CI build from step 6; do not accept whatever is preselected.
Before queuing, confirm the artifact retention task succeeded in the latest `main` CI run, and check the release
branch's pipeline YAML (Prod publishes with `tag latest`, artifact retention is @6 or later) from a checkout of it:

```bash
git switch --detach "origin/release/$version"
check pipeline-config
```

You can queue through the Azure DevOps pipelines REST API instead of the UI, with the repository ref set to
`refs/heads/release/<x.y.z>` and the pipeline resource version set to the CI build number. Read the run back and
confirm both before the Lockbox request goes out. The run is requested as you, so your Lockbox eligibility is the one
used.

Then:

- Find the Lockbox request ID in the "Lockbox Approval Request" task log (it is also in the request email). Check
  the request targets the TeamsJS release service group the runbook names; a request routed to another team cannot
  be approved by the release approvers. The email's To: line lists exactly who can approve right now. **⛔ Gate 6:**
  ask the owning-team approvers on that line by name in the owning team's chat, with the ID and run link; a direct
  ask was approved within a minute, while channel-only asks have waited hours. Someone other than the releaser
  approves it.
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
can lag by about 40 minutes; trust the registry answer. Where the public registry is unreachable, the check also asks
jsDelivr and unpkg: they can confirm the version and `latest`, but a source that lacks the version or shows an older
`latest` may only be lagging, so the result is inconclusive (exit 3), never a failure. Confirm from another network
or with the publish task's "npm notice version" line, and never re-queue because of it. Note the CDN byte count it
prints for the size record.

The Prod pipeline always publishes with the `latest` tag. That is right for a release of the newest version only. A
hotfix on an older line would move `latest` backwards, so it is a maintainer decision outside this skill (see the
failure modes); stop before queuing one.

### 10. Promote, merge back and update consumers

- **⛔ Gate 4:** edit the GitHub release: untick pre-release and set it as the latest release, then
  `check github-release --version "$version" --expect latest`.
- **⛔ Gates 2-3:** merge `release/<x.y.z>` back to `main` with a PR titled `Cleanup release v<x.y.z>`. If `main` has
  not moved since the branch was cut, a PR straight from the release branch merges cleanly. Otherwise cut
  `<alias>/cleanup_release_<x.y.z>` from `release/<x.y.z>`, merge `origin/main` into it and open the PR from that,
  with a `none` change file (`pnpm changefile`, comment `Released <x.y.z>`); PR CI's change-file check requires it
  even when a local `beachball check` says none is needed.
  Merging `main` can bring back change files the release already consumed; delete any change file whose comment
  appears in the new CHANGELOG section, or the next release ships those entries twice. Before opening the PR,
  `git diff --stat "origin/release/$version" HEAD` should show only the new `none` change file, and
  `check consumed-changes --version "$version" --prep-commit <prep PR squash commit>` passes.
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
- **Announcement**, only after step 9 passed: the formal post in the platform SDK channel the internal runbook names,
  plus a short note linking to it in the owning team's chat. Subject
  `TeamsJS v<x.y.z> Release`; body "teams-js v<x.y.z> has been released to npm and CDN", the npm version page
  (`https://www.npmjs.com/package/@microsoft/teams-js/v/<x.y.z>`), the Prod CDN URL, the GitHub release, and the
  Minor changes and Patches lists copied from the real CHANGELOG section, not from memory or the PR list. Tag the
  current contacts listed in the runbook; older example posts tag people who are no longer the contacts.
  Two recent announcements linked the previous version: save the draft to a file, run
  `check announcement --version "$version" --file <draft>`, and open every link fresh before sending. You may also
  mention the partner who asked for a feature in the release.
  - Post within about three hours of verified publication; past announcements slipped by most of a day, and one
    release was never announced. Read the destination's newest messages first, so a retry never double-posts.
  - Announce Prod releases only. Never announce SDF betas, test builds or dry runs. Beyond the platform SDK channel
    and the owning team's chat, do not cross-post TeamsJS releases; in particular not to the hub SDK release
    channels, which are for hub SDK releases. Some channels pick up releases automatically; they need no post.

Each is a separate **⛔ Gate 6**. Record what was sent and where, so a retry never double-posts.

### 12. Close out

**⛔ Gate 7:** record the bundle size and the delta from the previous version
(`check size --version "$version" --previous <previous version>` prints both) in the size table the internal runbook
keeps, and close the release work item. Then confirm the post-release checklist and run the retro (below).

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
4. **⛔ Gate 5:** queue the SDF release pipeline with that build as its resource. Lockbox and judging the run work as
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
2. **⛔ Gate 5:** queue the DDL release pipeline with that build. It overwrites the stored list and needs its own
   Lockbox approval. A successful DDL run normally ends "partially succeeded".
3. From a checkout of that build's commit, `check domains` passes when the live list equals the source.
4. The list lives at a path with no version, and the CDN serves it with a one-year `Cache-Control: max-age`. A
   successful upload therefore usually stays invisible until the CDN cache is purged. If `check domains` still fails
   after the run, compare the CDN's `Last-Modified` header (`curl -sI <url>`) with the time of the run, then
   **⛔ request the purge** through the process in the internal runbook and rerun `check domains` afterwards. Do not
   queue the DDL again just to refresh the cache. The runbook says to wait 24 hours before purging; this skill checks
   sooner on purpose, because the one-year cache lifetime means waiting rarely helps.
5. Once the live list is verified, **⛔ Gate 6:** draft a short reply in the matching release announcement's thread
   saying which origins are now live, and a note to the partner who asked for them. A DDL push gets no announcement of
   its own.

## Checks

The deterministic checks live in [`check-release.js`](./check-release.js). It uses only Node built-ins, reads files
and public URLs, and never writes anything. Define a shorthand once per shell:

```bash
check() { node .github/skills/release-teamsjs/check-release.js "$@"; }
```

| Command                | Passes when                                                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `check-version`        | `registry.npmjs.org` lacks the version, no mirror lists it, and the Prod CDN and GitHub tag lack it                                                                 |
| `carriers`             | both `package.json` files, the README and the test app name the version and share one SRI                                                                           |
| `artifact`             | a downloaded CI bundle is under `CDNFeed/<v>/js`, `<v>` is the only version folder (besides `_manifest`), and it hashes to that SRI                                 |
| `published`            | the CDN bytes match the SRI and npm has the version, and the dist-tag if given, by the source rules below                                                           |
| `domains`              | the live Prod valid-domains list equals the source                                                                                                                  |
| `github-release`       | `--expect prerelease` or `latest`: the release is in that state, tag `v<v>` carries the bump and sits at the release branch head, and Latest is right for the stage |
| `merged-back`          | `main`'s CHANGELOG has the version's section                                                                                                                        |
| `consumed-changes`     | on the merge-back branch, no pending change file repeats an entry in the released CHANGELOG section, or was deleted by `--prep-commit <sha>` if given               |
| `pipeline-config`      | the checkout's release YAML: Prod publishes with `tag latest`, SDF with `tag beta`, artifact retention @6+                                                          |
| `beta-version`         | a beta `<x.y.z>-beta.<n>` is of a version that has not shipped: newer than npm's `latest`, and absent from the Prod CDN and as tag `v<x.y.z>`                       |
| `announcement`         | every npm, CDN and GitHub release link in a draft names the version, and npm and CDN links are present                                                              |
| `size`, `links`, `sri` | (informational) bundle bytes and change from `--previous`, announcement links, a file's SRI                                                                         |
| `help`                 | lists every command and the flags it takes; any other flag is a usage error                                                                                         |

**npm source rules.** `registry.npmjs.org` is the only source that can show a version is absent or a dist-tag is
current. A `--registry` proxy, jsDelivr and unpkg can lag, so they only add evidence that a version or tag value
exists, and a proxy alone never makes a check pass. When the public registry cannot be reached and the mirrors do not
confirm, the npm result is inconclusive (exit 3), never a failure.

GitHub API calls send `GITHUB_TOKEN` as a bearer token when it is set, which avoids anonymous rate limits. Every
request times out after 30 seconds.

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

- The release pipeline stack: [#3090](https://github.com/OfficeDev/microsoft-teams-library-js/pull/3090) (1/4, a
  shared changelog extractor), [#3139](https://github.com/OfficeDev/microsoft-teams-library-js/pull/3139) (2/4,
  release-integrity and SRI validation), [#3140](https://github.com/OfficeDev/microsoft-teams-library-js/pull/3140)
  (3/4, a required check on PRs into `release/*`) and
  [#3143](https://github.com/OfficeDev/microsoft-teams-library-js/pull/3143) (4/4, GitHub pre-release creation on
  merge, replacing the closed #3141). When they land, steps 4-7 become checks of what the automation did, and their
  validation overlaps `check carriers`; prefer theirs in CI.
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
