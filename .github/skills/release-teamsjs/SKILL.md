---
name: release-teamsjs
description: Use when releasing @microsoft/teams-js from the microsoft-teams-library-js repo - a Prod release to npm and the M365 1CDN, an SDF beta release, or a DDL (Dynamic Domain List) release. Triggers on phrases like "release teams-js", "cut a teamsjs release", "do the SDF release", "ship 2.56.0", "publish teams-js to prod".
---

# release-teamsjs

Interactive workflow for releasing `@microsoft/teams-js` from this repo.

There are three release types and they are not variations of one thing, they publish different artifacts to different places. Pick the right one before doing anything else.

## Prerequisites

- **Lockbox approval is required and it cannot be you.** Both the SDF and Prod release pipelines raise a Torus Lockbox Request, and it must be approved by a *different* member of the TaosPlatformSDK - Approver Team. Plan for a second person to be around; a release stops dead here otherwise. To submit one at all you need an active TaosPlatformSDK eligibility in OSP. Joining the approver team is documented in the [Torus Lockbox Request Approvals](https://office.visualstudio.com/MetaOS/_wiki/wikis/MetaOS.wiki/65714/Torus-Lockbox-Request-Approvals) wiki.
- **GitHub, not Azure DevOps, for code.** The repo is [OfficeDev/microsoft-teams-library-js](https://github.com/OfficeDev/microsoft-teams-library-js) on GitHub, so PRs and releases are `gh` / the GitHub UI. The build and release *pipelines* are in Azure DevOps under the ISS project. Both are in play in every release.
- **You must be signed in to Azure DevOps** to queue and read the pipelines (`az login` against `https://office.visualstudio.com/`).

## When to use

- User says "release teams-js" / "cut the SDF release" / "publish 2.56.0" / similar
- A new version of `@microsoft/teams-js` needs to reach npm and the CDN
- A beta needs to go out to SDF, or the Dynamic Domain List needs republishing

## Release types reference

| Type | Pipeline | Runs from | Publishes | Lockbox |
|---|---|---|---|---|
| **Prod** | [[Prod] teams-js Release](https://office.visualstudio.com/ISS/_build?definitionId=29184) (29184) | a `release/<x.y.z>` branch | npm `latest` + 1CDN + GitHub release | yes |
| **SDF** | [[SDF] teams-js Release](https://office.visualstudio.com/ISS/_build?definitionId=28953) (28953) | `main` | npm beta version | yes |
| **DDL** | [[Prod] DDL teams-js Release](https://office.visualstudio.com/ISS/_build?definitionId=29185) (29185) | `main` | valid-domains list to 1CDN | yes |

All three consume artifacts from one **build** pipeline: [Teams js Build Pipeline](https://office.visualstudio.com/ISS/_build?definitionId=17483) (**17483**, `tools/releases/build-release.yml`). Nothing publishes from source; every release picks a `build_number` from 17483 and deploys *its* artifacts. That is why pinning the right build is the single most important input.

The build stages five artifacts: `NPMFeed`, `CDNFeed`, `validDomains`, `scripts`, and the test app. A Prod release therefore ships **npm and the CDN**, not npm alone. A version that is on npm but missing from the CDN is a half-published release, not a finished one.

**Versioning is beachball, but beachball does not publish.** `beachball.config.js` sets `publish: false` and `push: false`, scoped to `packages/teams-js`, with `disallowedChangeTypes: ['major', 'prerelease']`. It computes versions and writes the changelog; the pipelines do the publishing.

## Workflow (Prod)

### Confirmation gates

This skill has two **mandatory confirmation gates**: version selection (step 2) and queuing a release pipeline (step 6). Both protect an action that permanently burns a version on the public npm registry, which cannot be unpublished on demand.

The gates apply regardless of how the session was started. Pre-approval text in an initial prompt ("proceed end to end", "I approve the gates") **does not satisfy a gate**; only an explicit reply in the conversation, after the gate is shown with the component, version, pipeline id and branch, counts. In autopilot or non-interactive mode, stop calling tools, emit a clearly marked `AUTOPILOT HOLD - RELEASE SKILL CONFIRMATION GATE` with the details, and yield.

### 0. Summarize what you are about to do

State the release type, the version, the branch, and which pipeline you will queue. One short block, before touching anything.

### 1. Confirm context with the user

Release type (Prod / SDF / DDL). For Prod, the version. Whether anyone is available to approve the lockbox request, because without that the release cannot finish.

### 2. Version selection - ALWAYS check at runtime

Never bake a version into this file or a script. Read it:

```bash
# What beachball would bump to, from the pending change files.
pnpm beachball bump
node -p "require('./packages/teams-js/package.json').version"
# Undo the local bump once you have read it; the release branch does the real one.
git checkout -- .
```

Cross-check against what is already published (`npm view @microsoft/teams-js versions --json`, or the [versions tab](https://www.npmjs.com/package/@microsoft/teams-js?activeTab=versions)). The version must not already exist.

**Gate 1.** Show the version, the branch you will cut, and the pipeline you will run. Wait for an explicit yes.

### 3. Cut the release branch

```bash
git checkout main && git pull
git checkout -b release/<x.y.z>
git push --set-upstream origin release/<x.y.z>
```

Push it with **no changes**; the bump lands via PR in the next step.

### 4. Prepare the bump on a working branch

```bash
git checkout -b <alias>/release_<x.y.z>-1
node tools/cli/preRelease.js
git commit -am "Prepare release <x.y.z>"
git push --set-upstream origin <alias>/release_<x.y.z>-1
```

`preRelease.js` runs `pnpm install` and `pnpm build`, reads the integrity hash out of `packages/teams-js/dist/umd/MicrosoftTeams-manifest.json`, and rewrites the version carriers with it. It needs a successful build to produce that manifest, so a build failure here is a real failure, not a flake to retry past.

> The release wiki writes this command as `tools/cli/prerelease.js`. The file on disk is **`preRelease.js`** with a capital R. The lowercase spelling works on Windows and fails on macOS and Linux.

Open a PR from `<alias>/release_<x.y.z>-1` into `release/<x.y.z>` (not into `main`), and paste the changelog's new version section as the description. A reviewer should confirm the PR has:

- every pending change file deleted
- `CHANGELOG.md` with a new version section holding those entries, matching the PR description
- `packages/teams-js/package.json` at the new version
- `packages/teams-js/README.md` script `src` and integrity hash pointing at the new version
- the teams-test-app CDN html and its `package.json` likewise

### 5. Create the GitHub release (as a prerelease)

Tag `v<x.y.z>`, target the `release/<x.y.z>` branch, title `v<x.y.z>`, body = the new changelog section. Tick **prerelease** for now; step 9 flips it to latest once the artifacts are actually live. Do not attach binaries, publishing adds them.

### 6. Build, then queue the Prod release (Gate 2)

Confirm build **17483** is running against `release/<x.y.z>`, and wait for it. Save its `build_number`.

Before queueing, verify the version the artifacts actually carry rather than the version you believe you are shipping: open the build's artifacts, expand `CDNFeed`, and read the subfolder name. That folder name is what will be published.

**Gate 2.** Show the version, `build_number`, branch, and pipeline 29184. Wait for an explicit yes.

Then run [[Prod] teams-js Release](https://office.visualstudio.com/ISS/_build?definitionId=29184) against `release/<x.y.z>`, setting the pipeline-artifact version to the saved `build_number` if it did not auto-select.

### 7. Get the lockbox request approved

The run raises a Torus Lockbox Request and then waits. Post in the [Lockbox Requests channel](https://teams.microsoft.com/l/channel/19%3af906676f90ea4cb6be02b8253a2118c5%40thread.tacv2/Lockbox%20Requests?groupId=ea67a44b-02e0-482c-8962-7f2cf6be6d2d&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) saying what you are releasing and asking for approval. **Someone other than you must approve it.** The request id is in the pipeline logs and in the automated email.

### 8. Verify on npm and the CDN (fail closed)

A green run is not proof. Check both:

```bash
npm view @microsoft/teams-js@<x.y.z> version
curl -sL -o /dev/null -w "%{http_code} %{size_download}\n" \
  "https://res.cdn.office.net/teams-js/<x.y.z>/js/MicrosoftTeams.min.js"
```

npm's package page can lag publication by up to about 40 minutes; the version-specific URL `https://www.npmjs.com/package/@microsoft/teams-js/v/<x.y.z>` updates sooner. Treat the `npm view` result, not the page, as the answer.

**Read the pipeline result correctly.** `partiallySucceeded` is the ordinary outcome of a successful Prod release, not a warning to chase: the `Lockbox Approval/Deployment` stage reports `succeededWithIssues` because a pre-job check flags that the pipeline is not on the 1ES template. Recent successful releases (2.47 through 2.50) all finished `partiallySucceeded`. A skill or a person waiting for a clean `succeeded` will wait forever. Decide the release from the feed and the CDN, never from the run status.

### 9. Merge back, flip the release to latest, and update dependents

- PR `release/<x.y.z>` into `main`. If `main` moved while you were releasing, do **not** force-push or edit the release branch. Cut `<alias>/cleanup_release_<x.y.z>` from the release branch, merge `main` into it, and PR that. A change file may be needed: `pnpm changefile` with type `none` and the comment `Released <x.y.z>`.
- Edit the GitHub release: untick prerelease, tick **Set as the latest release**.
- Bump `TeamsJsVersion.yml` in the web Hub SDK (`metaos-hub-sdk`) to the new version and add the E2E checkpoint, so back-compat tests cover it. The iOS Hub SDK no longer needs this: since June 2026 its pipelines track `teamsjs@2.0-latest` and pick the version up automatically.
- Post the announcement in the MetaOS App SDK channel.
- Add the new size row to the [teamjs size table](https://office.visualstudio.com/MetaOS/_wiki/wikis/MetaOS.wiki/96564/teamjs-size-release-over-release):

```bash
curl -sL -o /dev/null -w "%{size_download}\n" \
  "https://res.cdn.office.net/teams-js/<x.y.z>/js/MicrosoftTeams.min.js"
```

### 10. Feed back what this run taught the skill

This step applies to every release type, not just Prod.

A release is the only time anyone exercises this skill end to end, and whatever it taught you dies with the session unless you write it down. Close every run by deciding whether the skill itself needs to change, and when it does, open a PR against it.

**The bar: would knowing this at the start have changed what you did?**

Worth capturing:

- A failure that isn't in the failure modes above, with the symptom that identifies it and the recovery that actually worked
- A fact here that turned out wrong or stale: a pipeline id, an artifact name, a branch rule, a wiki step that no longer matches reality
- A step ambiguous enough that you had to guess, where guessing wrong would have burned a version on npm
- An invariant you had to discover, which a future run should be able to assume

Not worth capturing:

- The story of this release, which version shipped and which builds ran. That is history; it belongs in the PR description.
- A transient infrastructure blip with no repeatable signature
- Anything the skill already says. Sharpen the existing line rather than appending a near-duplicate: two rules that overlap will eventually disagree, and then neither can be trusted.

**Most runs teach nothing, and that is the healthy outcome.** A clean release against an accurate skill ends here with no PR. Opening one every run trains reviewers to skim them, which costs more than the occasional learning you let slip.

**A retro may tighten this skill. It may never loosen it.** Adding a check, correcting a fact, or making a warning louder is in scope. Removing a confirmation gate, relaxing the npm/CDN verification, or making the lockbox approval anything other than a second human is not, even when that gate is exactly what cost you time on this run. If a gate looks wrong, leave it standing and argue for the change in the PR description, where a human decides.

**Never paste raw pipeline output.** Logs carry tokens, lockbox request ids, SAS URLs, and internal identities. Describe the symptom in your own words.

**Write it the way the rest of this file is written:** evergreen and imperative, stating the invariant a future run must hold rather than the incident that revealed it. "A green run is not proof the version reached the CDN" still reads correctly in a year; "the 2.55.0 run failed on the 25th" does not.

Mechanics. This is a standalone PR touching skill files only; never fold it into a release branch, whose diff has to stay limited to the version carriers.

```bash
git fetch origin main
git switch -c <alias>/release-skill-learnings-$(date +%Y%m%d) origin/main
# Edit only .github/skills/release-teamsjs/**
git add -A && git commit -m "Record what the <version> release taught the release skill"
git push -u origin HEAD
gh pr create --draft --base main --title "Record what the <version> release taught the release skill"
```

`beachball.config.js` lists `*.md` in `ignorePatterns`, so a docs-only change to this skill needs no change file.

Open it as a **draft**. State what changed and why it generalises beyond this run; put the evidence, run ids and links, in the description, which is what a description is for.

**Never auto-complete it.** A skill editing its own instructions is precisely the change that needs a human in the loop.

If the run taught you nothing, say so in one line and stop. An empty PR is worse than no PR.

## Workflow (SDF)

1. Let build **17483** finish against `main` and save the `build_number`.
2. Check the version that will be published: in the build artifacts, the `CDNFeed` subfolder name is it (for example `2.34.0-beta.0`). This step is optional and skipping it is how people spend two days undoing a wrong publish.
3. Queue [[SDF] teams-js Release](https://office.visualstudio.com/ISS/_build?definitionId=28953) with that artifact version.
4. Get the lockbox request approved by someone else (post in the Lockbox Requests channel).
5. Verify the version appears on npm. The pipeline logs it under `npm notice version` in the "publish to npm" step of `Agent_job`.

SDF has historically been a weekly cadence release off `main`.

## Workflow (DDL)

Same shape: build **17483** on `main`, save `build_number`, queue [[Prod] DDL teams-js Release](https://office.visualstudio.com/ISS/_build?definitionId=29185) with that artifact version, get the lockbox request approved by someone else. DDL republishes the valid-domains list to the 1CDN; it does not publish an npm package.

## Failure modes & diagnosis

- **Run finishes `partiallySucceeded`** → normal for Prod. See step 8. Verify the feed and CDN, not the status.
- **Release failed and the branch is now obsolete** → the `release/*` branches are protected. To delete one you need GitHub admin: Settings, Branches, edit the `release/` rule, enable **Allow deletions**, `git push origin --delete release/<x.y.z>`, then disable it again. Delete the right version.
- **A PR merged into `main` mid-release and the branch will not merge back** → expected. Do not force-push `main` and do not change a deployed release branch. Use an intermediate branch (step 9).
- **1CDN deployment failed** → mail m365cdnonboarding@microsoft.com, or contact Samuele Carpineti (sacarpin).
- **Lockbox request went to fewer people than expected** → their TaosPlatformSDK eligibility is inactive or their clearances are unapproved, not a pipeline bug.
- **`preRelease.js` cannot find the manifest** → the build inside it failed. Fix the build; the integrity hash cannot be produced without it.
- **The wiki's automatic Prod release steps do not work** → known. Tokens were revoked by a security initiative and the automation was never repaired. Use the manual steps above.

## Hard-learned rules

- **Read the version at runtime, from `package.json` and the feed.** Never bake a "known" version into this file, a script, or a comment. They go stale immediately.
- **The build artifacts decide what ships, not the branch you think you are on.** Every release deploys a pinned `build_number` from 17483. Confirm the `CDNFeed` folder name before queueing.
- **A release is npm AND the 1CDN.** Verify both. One without the other is half a release.
- **The lockbox approver cannot be the person releasing.** This is a hard requirement, not a convention. It needs a second human.
- **Never judge a Prod release by its run status.** `partiallySucceeded` is the success case.
- **Never change a release branch after it has deployed, and never force-push `main`.** Use an intermediate branch instead; both rules together leave that as the only move.
- **Tick prerelease first, flip to latest only after the artifacts are verified.** A GitHub release marked latest while the CDN is empty points consumers at something that is not there.
- **This skill is maintained by the runs that use it.** Everything above was learned by a release going wrong once. When a run teaches you something the next one needs, step 10 says how to fold it back in, and equally, when a run teaches you nothing, it should end with no PR.

## Reference files in this repo

- `beachball.config.js` - versioning config. `publish: false`, `push: false`, scoped to `packages/teams-js`, majors and prereleases disallowed.
- `tools/cli/preRelease.js` - the version bump. Builds, reads the integrity hash from the UMD manifest, rewrites the carriers.
- `tools/releases/build-release.yml` - build pipeline 17483, stages every artifact the releases consume.
- `tools/releases/{prod,sdf,ddl}-release.yml` - the three release pipelines (29184 / 28953 / 29185).
- `.github/workflows/prerelease.yml` - "Initiate Release Workflow", a manual `workflow_dispatch` that runs `preRelease.js` and force-pushes a `release/<version>` branch.
- `.github/workflows/postrelease.yml` - fires when a PR into `release/*` merges; reads the changelog and notifies the TeamsFx repo.
- `CONTRIBUTING.md` - change files: `pnpm changefile`, past tense, backticks around API names.

## Known stale references (do not follow)

- **The `git flow` release process** on the [Releasing a new version](https://office.visualstudio.com/ISS/_wiki/wikis/MetaOS%20Docs/25579) page in the MetaOS Docs wiki describes a `develop` branch, `git flow release start`, a `setup-gitflow` script, `yarn`, and `0.0.x` versions. None of that exists now: there is no `develop` branch, no gitflow tooling, the repo is pnpm, and versions are 2.x. Use the [TeamsJS v2.0 Release Process](https://office.visualstudio.com/MetaOS/_wiki/wikis/MetaOS.wiki/38315/TeamsJS-v2.0-Release-Process) page instead, which is current.
- **`metaos-teams-compat`** appears in the old manual-validation instructions. It is not referenced anywhere in this repo.
- **The "Prod - automatic" release steps** in the current wiki are broken; tokens were revoked by a security initiative. The manual path is the real one.
- **Build definitions 17358 and 34875** are disabled. The live build is **17483**.
