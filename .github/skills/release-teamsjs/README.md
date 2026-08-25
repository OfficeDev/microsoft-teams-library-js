# release-teamsjs

An agent skill that walks through releasing `@microsoft/teams-js`: reading the next version,
cutting the release branch, landing the bump, creating the GitHub release, and verifying the
package actually reached npm and the CDN.

## Scope

This skill covers the parts of a release that live in this repository. The pipelines that publish
to npm and the CDN run in Microsoft's internal Azure DevOps and require an approval granted by a
second person; their identifiers and mechanics are documented internally and are intentionally not
duplicated here.

Maintainers should follow the internal TeamsJS release runbook for those steps. External
contributors do not cut releases, so this file is mostly useful as a description of how versioning
and the release branch work.

## How to use it

The skill is auto-loaded by Copilot from `.github/skills/release-teamsjs/`. There is nothing to
install. Just ask in plain language:

- "release teams-js 2.56.0"
- "cut the release branch for the next version"

## What it does

1. Read the next version at runtime from beachball and the npm feed, rather than trusting anything
   written down.
2. **Confirm the version with you.** This is a hard gate: an npm version is effectively permanent.
3. Cut `release/<x.y.z>`, then land the bump through a PR into it. `preRelease.js` builds, reads the
   UMD integrity hash, and rewrites every version carrier together.
4. Create the GitHub release tagged `v<x.y.z>`, marked prerelease for now.
5. Hand off to the internal publish step, which needs a second person's approval.
6. Verify the version is live on **both** npm and the CDN. A green pipeline is not proof.
7. Merge back to `main`, promote the GitHub release to latest, update downstream version pins,
   announce, and record the bundle size.
8. Close the loop: decide whether the run taught the skill anything a future release needs, and if
   so open a **draft PR against the skill itself**. Most runs teach nothing and end with no PR; that
   is the expected outcome, not a failure. A retro may correct a fact or tighten a check, but it may
   never remove the confirmation gate or relax a verification.

## The parts that are easy to get wrong

- **A release is npm AND the CDN.** A version on one but not the other is half-published.
- **The deployed build decides what ships**, not the branch you think you are on.
- **The publish approver must be someone else.** Plan for it; a release stalls without one.
- **Prerelease first.** Promote the GitHub release to latest only after both feeds check out.

## Keeping this file public-safe

This repository is public. The skill deliberately excludes internal pipeline identifiers, internal
URLs, approval-system names, individual names or aliases, and internal distribution lists. When a
release teaches something that cannot be written down without one of those, record it in the
internal runbook and leave a neutral pointer here.

## What is in this folder

| File | Purpose |
|---|---|
| `SKILL.md` | The workflow the agent follows, failure modes, and hard-learned rules. |
| `README.md` | This file. |
