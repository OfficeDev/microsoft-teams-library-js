# release-teamsjs

An agent skill that runs the `@microsoft/teams-js` release process interactively, from picking a
version through queuing the pipeline, getting the lockbox request approved, and verifying the
package actually reached both npm and the CDN.

## Who this is for

Anyone releasing `@microsoft/teams-js` from this repo: a Prod release to npm and the M365 1CDN, a
weekly SDF beta, or a DDL (Dynamic Domain List) publish. You do not need to remember the pipeline
IDs, which artifact feeds which release, or the verification URLs. The skill carries that context
and walks you through it.

## How to use it

The skill is auto-loaded by Copilot from `.github/skills/release-teamsjs/`. There is nothing to
install. Just ask in plain language:

- "release teams-js 2.56.0"
- "do the SDF release"
- "cut a DDL release"

## What it does

The Prod workflow, in order:

1. Confirm the release type, and read the next version at runtime from beachball and the npm feed
   rather than trusting anything written down.
2. **Confirm the version with you.** This is a hard gate: an npm version is permanent.
3. Cut the `release/<x.y.z>` branch, then land the bump through a PR into it (`preRelease.js`
   builds, reads the UMD integrity hash, and rewrites every version carrier together).
4. Create the GitHub release tagged `v<x.y.z>`, marked prerelease for now.
5. Run build pipeline 17483 on the release branch and pin its `build_number`, after checking that
   the artifact's `CDNFeed` folder carries the version you expect.
6. **Confirm the queue with you** (the second hard gate), then run the Prod release pipeline.
7. Surface the Torus lockbox request so a second person can approve it. It cannot be you.
8. Verify the version is live on **both** npm and the CDN. A green run is not proof, and
   `partiallySucceeded` is the normal successful outcome here, so the feeds decide, not the status.
9. Merge back to `main`, flip the GitHub release to latest, update the Hub SDK back-compat version,
   announce, and record the size.
10. Close the loop: decide whether the run taught the skill anything a future release needs, and if
    so open a **draft PR against the skill itself**. Most runs teach nothing and end with no PR;
    that is the expected outcome, not a failure. A retro may correct a fact or tighten a check, but
    it may never remove a confirmation gate or relax a verification.

SDF and DDL follow the same shape against `main`, with their own pipelines.

## The parts that are easy to get wrong

- **A release is npm AND the 1CDN.** Both come from the same build artifacts. A version on npm but
  missing from the CDN is half a release.
- **`partiallySucceeded` is success.** The lockbox stage reports `succeededWithIssues` over a 1ES
  template-policy warning. Waiting for a clean `succeeded` means waiting forever.
- **The lockbox approver must be someone else.** Not a convention, a requirement. Plan for it.
- **The build you pin decides what ships**, not the branch you think you are on.

## What is in this folder

| File | Purpose |
|---|---|
| `SKILL.md` | The full workflow, the release-type reference table, failure modes, and hard-learned rules. |
| `README.md` | This file. |

## Related documentation

- [TeamsJS v2.0 Release Process](https://office.visualstudio.com/MetaOS/_wiki/wikis/MetaOS.wiki/38315/TeamsJS-v2.0-Release-Process) - the canonical wiki this skill is built from.
- [Torus Lockbox Request Approvals](https://office.visualstudio.com/MetaOS/_wiki/wikis/MetaOS.wiki/65714/Torus-Lockbox-Request-Approvals) - how to join the approver team.
- `CONTRIBUTING.md` - change files and the beachball workflow.

The older "Releasing a new version" page in the MetaOS Docs wiki describes a `git flow` process
against a `develop` branch. That branch and tooling no longer exist; see "Known stale references"
in `SKILL.md`.
