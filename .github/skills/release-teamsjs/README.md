# release-teamsjs skill

An agent skill that walks a maintainer through releasing `@microsoft/teams-js`: the monthly Prod release, the weekly
SDF beta and the valid-domains (DDL) push.

## Who it is for

TeamsJS maintainers who release the library. External contributors do not need it; maintainers cut releases. The
publishing pipelines run in Microsoft's internal Azure DevOps, so parts of the process point at the internal runbook
rather than repeating internal details in this public repository.

## How to use it

Ask your agent something like "release teams-js", "ship 2.59.0" or "do the SDF beta". The agent reads
[`SKILL.md`](./SKILL.md), summarizes the plan with every confirmation gate, and stops at each gate for your explicit
reply. It never pushes, opens a PR, queues a pipeline, edits a GitHub release or sends a message without that reply.

## What it covers

- Pre-flight: CI health, pending change files, the release branch state, Lockbox eligibility and npm reachability.
- Version selection from beachball, with a collision check against npm, the CDN and GitHub tags.
- The release branch, the prep PR into it, and the GitHub pre-release.
- An integrity gate that compares the CI bundle with the SRI hash in the README and test app before Prod.
- Queuing the Prod, SDF or DDL pipeline and judging the run by its publish tasks, not its status.
- Verification on npm and the CDN, promotion to Latest, merge-back, downstream bumps and the announcement draft.
- A retro step that keeps the skill current.

## Checks

The deterministic checks live in [`check-release.js`](./check-release.js): Node built-ins only, reading files and
public URLs, never writing anything. The [Checks](./SKILL.md#checks) section of `SKILL.md` lists its commands. Exit
code 3 means a source was unreachable or answered unexpectedly, and is never success.

Run its tests with:

```bash
node --test .github/skills/release-teamsjs/check-release.test.js
```

## Folder contents

| File                    | Purpose                                           |
| ----------------------- | ------------------------------------------------- |
| `SKILL.md`              | The workflow the agent follows                    |
| `README.md`             | This overview                                     |
| `failure-modes.md`      | Symptoms, causes and fixes, with a diagnosis loop |
| `check-release.js`      | Read-only release checks                          |
| `check-release.test.js` | Tests for the checks                              |

## When something goes wrong

Start with [`failure-modes.md`](./failure-modes.md). If the problem is new, fix the release first, then record the
symptom and fix through the retro step in `SKILL.md`, as a draft PR that changes only this folder.

## Keeping it public-safe

Do not add pipeline IDs, internal URLs, approver group or channel names, people's names or raw pipeline logs. Link the
internal runbook instead.
