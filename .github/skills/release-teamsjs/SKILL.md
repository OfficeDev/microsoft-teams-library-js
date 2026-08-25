---
name: release-teamsjs
description: Use when releasing @microsoft/teams-js from this repo - cutting the release branch, landing the version bump, creating the GitHub release, and verifying the published package on npm and the CDN. Triggers on phrases like "release teams-js", "cut a teamsjs release", "ship 2.56.0", "publish teams-js".
---

# release-teamsjs

Interactive workflow for releasing `@microsoft/teams-js`.

## Scope of this file

This covers the parts of a release that live in this repository: versioning, the release branch, the bump PR, the GitHub release, and verifying what actually got published.

**Queuing the release pipelines is a separate, internal step.** The pipelines that publish to npm and the CDN run in Microsoft's internal Azure DevOps and require an approval that a second person must grant. Their identifiers, the approval mechanics, and the internal runbook are documented internally and are deliberately not repeated here. If you are a Microsoft employee, follow the internal TeamsJS release wiki for those steps; if you are an external contributor, releases are cut by the maintainers and you should not need this file.

Everything below is safe to follow from a public checkout.

## When to use

- User says "release teams-js" / "cut a release" / "ship `<x.y.z>`" / similar
- A new version of `@microsoft/teams-js` needs to be prepared and published

## How versioning works

Versioning is [beachball](https://microsoft.github.io/beachball/), configured in `beachball.config.js`:

- `publish: false` and `push: false`, so beachball computes versions and writes the changelog but never publishes. The pipelines do that.
- `scope: ['packages/teams-js']`
- `disallowedChangeTypes: ['major', 'prerelease']`
- `ignorePatterns` includes `*.md`, so a docs-only change needs no change file.

Contributors add change files with `pnpm changefile` (see `CONTRIBUTING.md`). A release consumes every pending change file, folds them into `CHANGELOG.md`, and deletes them.

## Confirmation gates

This skill has one **mandatory confirmation gate**: version selection. Publishing burns a version on the public npm registry permanently, and npm does not allow unpublishing on demand after 72 hours.

The gate applies regardless of how the session was started. Pre-approval text in an initial prompt ("proceed end to end", "I approve the gates") **does not satisfy it**; only an explicit reply in the conversation, after the version and branch are shown, counts. In autopilot or non-interactive mode, stop calling tools, emit a clearly marked `AUTOPILOT HOLD - RELEASE SKILL CONFIRMATION GATE` with the details, and yield.

## Workflow

### 0. Summarize what you are about to do

State the version, the branch, and where you will stop (the internal pipeline step). One short block, before touching anything.

### 1. Read the version at runtime

Never bake a version into this file, a script, or a comment.

```bash
# What beachball would bump to, from the pending change files.
pnpm beachball bump
node -p "require('./packages/teams-js/package.json').version"
# Undo the local bump once you have read it; the release branch does the real one.
git checkout -- .
```

Confirm the version is not already taken:

```bash
npm view @microsoft/teams-js versions --json
```

**Gate.** Show the version and the branch you will cut. Wait for an explicit yes.

### 2. Cut the release branch

```bash
git checkout main && git pull
git checkout -b release/<x.y.z>
git push --set-upstream origin release/<x.y.z>
```

Push it with **no changes**. The bump lands via PR in the next step, so the branch history stays reviewable.

### 3. Prepare the bump on a working branch

```bash
git checkout -b <alias>/release_<x.y.z>-1
node tools/cli/preRelease.js
git commit -am "Prepare release <x.y.z>"
git push --set-upstream origin <alias>/release_<x.y.z>-1
```

`preRelease.js` runs `pnpm install` and `pnpm build`, reads the integrity hash from `packages/teams-js/dist/umd/MicrosoftTeams-manifest.json`, and rewrites the version carriers with it. It needs a successful build to produce that manifest, so a failure here is real and must be fixed, not retried past.

> Note the capital R in `preRelease.js`. The lowercase spelling resolves on Windows and fails on macOS and Linux.

Open a PR from `<alias>/release_<x.y.z>-1` into `release/<x.y.z>` (**not** into `main`), with the changelog's new version section as the description. A reviewer should confirm the PR has:

- every pending change file deleted
- `CHANGELOG.md` with a new version section holding those entries, matching the PR description
- `packages/teams-js/package.json` at the new version
- `packages/teams-js/README.md` script `src` and integrity hash pointing at the new version
- the teams-test-app CDN html and its `package.json` likewise

### 4. Create the GitHub release, marked prerelease

Tag `v<x.y.z>`, target `release/<x.y.z>`, title `v<x.y.z>`, body = the new changelog section. Tick **prerelease**. Do not attach binaries; publishing adds them.

It stays a prerelease until step 6 confirms the artifacts are actually live. A release marked "latest" while the CDN is still empty points consumers at something that is not there.

### 5. Publish (internal step)

The build and release pipelines run in internal Azure DevOps. A release deploys a pinned build's artifacts rather than publishing from source, so the version those artifacts carry is the version that ships, whatever branch you believe you are on. Confirm the build is green for `release/<x.y.z>` and note which build the release will consume.

Publishing requires an approval that **someone other than the person releasing** must grant. Plan for a second person; a release stops here without one.

Follow the internal runbook for the specifics.

### 6. Verify on npm and the CDN, fail closed

A green pipeline is not proof of publication. Check both:

```bash
npm view @microsoft/teams-js@<x.y.z> version

curl -sL -o /dev/null -w "%{http_code} %{size_download}\n" \
  "https://res.cdn.office.net/teams-js/<x.y.z>/js/MicrosoftTeams.min.js"
```

A release is **npm and the CDN together**. A version on one but not the other is half-published, not finished.

npm's package page can lag publication by up to about 40 minutes. `npm view` and the version-specific page `https://www.npmjs.com/package/@microsoft/teams-js/v/<x.y.z>` update sooner. Treat `npm view`, not the browsable page, as the answer.

**Do not judge the release by the pipeline's status field.** A successful release does not necessarily report a clean success, for reasons documented internally. Decide from the feed and the CDN.

### 7. Merge back, promote the release, update dependents

- PR `release/<x.y.z>` into `main`. If `main` moved while you were releasing, do **not** force-push `main` and do **not** edit the deployed release branch. Cut `<alias>/cleanup_release_<x.y.z>` from the release branch, merge `main` into it, and PR that. A change file may be needed: `pnpm changefile`, type `none`, comment `Released <x.y.z>`.
- Edit the GitHub release: untick prerelease, tick **Set as the latest release**.
- Update downstream consumers that pin a TeamsJS version for back-compat testing, so the new version is covered.
- Announce the release on the team's channel.
- Record the published bundle size:

```bash
curl -sL -o /dev/null -w "%{size_download}\n" \
  "https://res.cdn.office.net/teams-js/<x.y.z>/js/MicrosoftTeams.min.js"
```

### 8. Feed back what this run taught the skill

A release is the only time anyone exercises this skill end to end, and whatever it taught you dies with the session unless you write it down. Close every run by deciding whether the skill itself needs to change, and when it does, open a PR against it.

**The bar: would knowing this at the start have changed what you did?**

Worth capturing:

- A failure that isn't in the failure modes below, with the symptom that identifies it and the recovery that worked
- A fact here that turned out wrong or stale
- A step ambiguous enough that you had to guess, where guessing wrong would have burned a version on npm
- An invariant you had to discover, which a future run should be able to assume

Not worth capturing:

- The story of this release, which version shipped and which builds ran. That is history; it belongs in the PR description.
- A transient infrastructure blip with no repeatable signature
- Anything the skill already says. Sharpen the existing line rather than appending a near-duplicate: two rules that overlap will eventually disagree, and then neither can be trusted.

**Most runs teach nothing, and that is the healthy outcome.** A clean release against an accurate skill ends here with no PR. Opening one every run trains reviewers to skim them, which costs more than the occasional learning you let slip.

**A retro may tighten this skill. It may never loosen it.** Adding a check, correcting a fact, or making a warning louder is in scope. Removing the confirmation gate, relaxing the npm and CDN verification, or making the publish approval anything other than a second person is not, even when that gate is exactly what cost you time on this run. If a gate looks wrong, leave it standing and argue for the change in the PR description, where a human decides. Nothing enforces this rule, so the reviewer is the enforcement.

**This file is public. Keep it that way.** Everything internal, pipeline identifiers, internal URLs, approval-system names, individual names or aliases, and internal distribution lists, belongs in the internal runbook and must not be added here. **Never paste raw pipeline output**: logs carry tokens, request ids, SAS URLs, and internal identities. Describe the symptom in your own words. If a learning cannot be written down without an internal detail, record it internally and leave a neutral pointer here.

**Write it the way the rest of this file is written:** evergreen and imperative, stating the invariant a future run must hold rather than the incident that revealed it. "A green pipeline is not proof the version reached the CDN" still reads correctly in a year; "the 2.55.0 run failed on the 25th" does not.

Mechanics. This is a standalone PR touching skill files only; never fold it into a release branch, whose diff has to stay limited to the version carriers.

```bash
git fetch origin main
git switch -c <alias>/release-skill-learnings-$(date +%Y%m%d) origin/main
# Edit only .github/skills/release-teamsjs/**
git add -A && git commit -m "Record what the <version> release taught the release skill"
git push -u origin HEAD
```

Open the PR as a **draft**. `*.md` is in beachball's `ignorePatterns`, so no change file is needed.

**Never auto-complete it.** A skill editing its own instructions is precisely the change that needs a human in the loop.

If the run taught you nothing, say so in one line and stop. An empty PR is worse than no PR.

## Failure modes

- **`preRelease.js` cannot find the manifest** → the build inside it failed. Fix the build; the integrity hash cannot be produced without one.
- **The version is on npm but the CDN URL 404s** → half-published. Do not promote the GitHub release to latest, and do not announce. Resolve the CDN publish first.
- **A PR merged into `main` mid-release and the release branch will not merge back** → expected. Use the intermediate branch in step 7; never force-push `main` or edit a deployed release branch.
- **A release failed and the branch is now obsolete** → `release/*` branches are protected. Deleting one needs repo admin: enable **Allow deletions** on the `release/` branch rule, `git push origin --delete release/<x.y.z>`, then disable it again. Check the version carefully before deleting.
- **The publish approval went to fewer people than expected** → an access-configuration problem on the approver side, not a pipeline bug. Raise it internally.

## Hard-learned rules

- **Read the version at runtime**, from `package.json` and the npm feed. Never bake a "known" version anywhere; it goes stale immediately.
- **A release is npm AND the CDN.** Verify both before calling it done.
- **The build that gets deployed decides what ships**, not the branch you think you are on.
- **The publish approver cannot be the person releasing.** That makes a second person a hard dependency, not a formality.
- **Never judge a release by the pipeline's status field.** Judge it by the feed and the CDN.
- **Never change a release branch after it has deployed, and never force-push `main`.** Together those leave the intermediate branch as the only move, which is the intended one.
- **Prerelease first, latest only after verification.**
- **This skill is maintained by the runs that use it.** Everything above was learned by a release going wrong once. When a run teaches you something the next one needs, step 8 says how to fold it back in, and equally, when a run teaches you nothing, it should end with no PR.

## Reference files in this repo

- `beachball.config.js` - versioning config
- `tools/cli/preRelease.js` - the version bump: builds, reads the UMD integrity hash, rewrites the carriers
- `tools/releases/build-release.yml` - the build that stages the release artifacts
- `.github/workflows/prerelease.yml` - a manual `workflow_dispatch` that runs `preRelease.js` and pushes a `release/<version>` branch
- `.github/workflows/postrelease.yml` - fires when a PR into `release/*` merges; reads the changelog and notifies downstream
- `CONTRIBUTING.md` - change files and the beachball workflow
