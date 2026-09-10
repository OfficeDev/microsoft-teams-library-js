---
name: release-teamsjs
description: Use when releasing @microsoft/teams-js - preview pinned source safely, prepare a reviewed candidate, and require complete npm/CDN publication evidence before finalization.
---

# release-teamsjs

Interactive maintainer workflow. Internal publication still requires the existing runbook and
second-person approval. Never put internal URLs, identities, approval records, logs, or credentials
in public artifacts. This skill does not authorize publishing, merging, or policy changes.

**Prerequisite:** [#3156](https://github.com/OfficeDev/microsoft-teams-library-js/pull/3156)
must be reviewed and landed before publication/finalization. Follow its canonical
[`release-lifecycle.md`](../../../tools/cli/release-lifecycle.md), not imagined flags.
The existing publisher's final-byte export and independent approval handoff must also be integrated.
Until then, preparation is allowed but publication/finalization is blocked.

## Pin and preview

Use reviewed tooling in a dedicated worktree. Confirm its revision; never execute a helper supplied
by an unreviewed candidate. Every Bash block is fail-closed and must run with its stated variables.
Do not replace the source pin after version approval.
Source must belong to freshly fetched `origin/main`. Run preparation without publishing credentials;
the helper strips common write-token environment variables from children. Dependencies may need
separately scoped read-only registry access; this is not a sandbox for untrusted source code.

```bash
set -euo pipefail
checkout_status="$(git status --porcelain=v1 --untracked-files=all)"
if [ -n "$checkout_status" ]; then
  echo "Working tree must be clean, including untracked files." >&2
  exit 1
fi
git fetch origin 'refs/heads/main:refs/remotes/origin/main'
source_commit="$(git rev-parse 'refs/remotes/origin/main^{commit}')"
if [ "$(git rev-parse HEAD)" != "$source_commit" ]; then
  echo "Use a clean dedicated worktree at fetched origin/main before executing release tooling." >&2
  exit 1
fi
tooling_root="$(git rev-parse --show-toplevel)"
preview_json="$(node "$tooling_root/tools/cli/prepare-release.js" preview --source-commit "$source_commit")"
printf '%s\n' "$preview_json"
version="$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).version)' "$preview_json")"
```

The helper creates a new detached worktree, installs that source's frozen dependency graph without
lifecycle scripts, runs the real Beachball CLI without publishing/committing/pushing, and checks
the lockfile command's exit status and changed paths. It removes only its own disposable preview.
The caller's tracked and hidden untracked files are never consumed or restored.

**Confirmation gate:** show the exact source commit, computed version, full pending change set,
channel, and proposed release branch. Wait for the user's explicit reply. In unattended mode emit
`AUTOPILOT HOLD - RELEASE SKILL CONFIRMATION GATE` and stop. A failed lookup is never evidence that a
version is free; conflicting existing package versions require maintainer investigation.

## Controlled major/prerelease preparation

Beachball 2.62 validates before bumping. The configured `major` and `prerelease` exclusions reject
those files; they do not silently demote them. A `prerelease` file is not a channel selector: pending
minor/patch changes may outrank it. See `CONTRIBUTING.md` for the actual contributor menu and policy.

For an exception, require a maintainer-reviewed intent outside the checkout with exactly these fields:

```json
{
  "sourceCommit": "<approved full commit SHA>",
  "expectedVersion": "<approved exact semantic version>",
  "changeType": "major",
  "prereleasePrefix": null
}
```

For semantic prerelease preparation, use an explicitly approved `premajor`, `preminor`, `prepatch`,
or `prerelease` intent and a prefix such as `beta`. Review the resulting version across **all**
pending changes; do not infer it from one file. Record approval of the intent's exact bytes, source,
version, and channel independently. The JSON is an instruction, not proof of approval.

Only after that approval, preview the complete pending set with the intent:

```bash
set -euo pipefail
node "$tooling_root/tools/cli/prepare-release.js" preview \
  --source-commit "$source_commit" --expected-version "$version" --intent-file "$APPROVED_INTENT_FILE"
```

The helper allows the exceptional types only inside its new isolated candidate, adds the approved
intent, invokes the supported Beachball config API, and restores the original config byte-for-byte.
The assertion rejects an unexpected stable result or different semantic version. Never relax
`main`, merge an unconsumed exceptional change file there, or create a policy-restoration PR.
Do not change the contributor policy to match the candidate.

Semantic prerelease preparation is **not** supported publication: the production plan verifier
rejects semantic prerelease versions until a separate destination adapter is approved. Major stable
versions and a GitHub prerelease label on a stable package are different things.

## Prepare, review, then stage

After source/version confirmation, run `prepare` rather than bumping the developer checkout.
For an approved exception, append `--intent-file "$APPROVED_INTENT_FILE"` to this command;
otherwise omit it. `prepare` uses the existing pinned `preRelease.js` to install/build/update carriers.

```bash
set -euo pipefail
prepared_json="$(node "$tooling_root/tools/cli/prepare-release.js" prepare \
  --source-commit "$source_commit" --expected-version "$version")"
release_worktree="$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).worktree)' "$prepared_json")"
git -C "$release_worktree" diff
```

On failure the attempt stops without branch/commit/push. Successful preparation remains in its own
detached worktree. **Stop for review here:** inspect every generated change, release notes, consumed
change files, and the exact version. Verification hashes the built bundle and matches both SRI
carriers. Intentional note edits happen before staging. Source/code changes require a new pin and approval.

After explicit review, stage only verified release output:

```bash
set -euo pipefail
working_branch="<alias>/release_$version-1"
git -C "$release_worktree" switch -c "$working_branch"
(cd "$release_worktree" && node "$tooling_root/tools/cli/prepare-release.js" stage \
  --source-commit "$source_commit" --expected-version "$version")
git -C "$release_worktree" diff --cached
```

Do not add arbitrary paths after staging. After final staged review:

```bash
set -euo pipefail
(cd "$release_worktree" && node "$tooling_root/tools/cli/prepare-release.js" check-staged \
  --source-commit "$source_commit" --expected-version "$version")
git -C "$release_worktree" commit -m "Prepare release $version"
remaining="$(git -C "$release_worktree" status --porcelain=v1 --untracked-files=all)"
if [ -n "$remaining" ]; then echo "Release residue remains; do not push." >&2; exit 1; fi
git -C "$release_worktree" push --set-upstream origin "$working_branch"
local_head="$(git -C "$release_worktree" rev-parse HEAD)"
remote_head="$(git ls-remote --exit-code --heads origin "refs/heads/$working_branch")"
test "${remote_head%%$'\t'*}" = "$local_head"
```

Create the unchanged release base using GitHub's create-only ref API; an existing branch is a
conflict, not permission to overwrite it:

```bash
set -euo pipefail
gh api --method POST 'repos/OfficeDev/microsoft-teams-library-js/git/refs' \
  -f "ref=refs/heads/release/$version" -f "sha=$source_commit"
remote_base="$(git ls-remote --exit-code --heads origin "refs/heads/release/$version")"
test "${remote_base%%$'\t'*}" = "$source_commit"
```

Open the bump PR from the working branch into `release/<version>`, not `main`, and preserve the
existing gates. Do not attach binaries or force refs. Do not continue while that PR is open.

## Approved build, publication, and finalization

After the bump PR merges, fetch its exact remote release ref, read the package at that commit, and
assert the confirmed version. Pin that merged source for the approved build. A later merge is a new
candidate, not proof that an already-approved build shipped. The public merge workflow records only
unverified candidate identity and runs a no-publish rehearsal.
The existing downstream merge notification is unchanged and is not proof of shipment; consumers must
not treat that legacy event as the complete-receipt gate.

Follow `release-lifecycle.md` for the strict public projection, independently approved digest/source,
random evidence identity with private provenance mapping, final npm tarball, and **entire** CDN
inventory. Expected hashes come from final approved build outputs, never the feed under test.
The plan stays outside the payload it describes. Actual publication remains with the existing
publisher and approval authority; this skill does not create permissions or substitute a publisher.

After every attempt, reconcile every target, including previously successful retry targets.
`release-plan.js verify` must return a complete current receipt. npm/CDN partial availability, wrong
bytes/SRI, generic 404, authentication failure, malformed metadata, and network errors block finalization.
Unknown/conflicting evidence does not authorize republishing. A printed status or version is insufficient.

The finalizer re-verifies, creates immutable candidate/final refs once, and checks remote peeled source.
It creates new GitHub metadata as prerelease/non-latest and never edits or demotes an existing release.
An already promoted matching release remains unchanged; a conflict stops. Never move a published tag
or republish an append-only package to repair metadata. npm dist-tags, required publishing-job outcomes,
other destinations, and manual promotion/announcements remain separate approval gates.

Announce only when all publication evidence and operational gates are complete. Do not infer shipment
from a merged bump PR or green build. GITHUB_TOKEN-created events do not start a separate Actions publisher.

## Durable learnings

Only make a learning PR with user authorization, in a clean new worktree pinned to current main.
Edit and stage only `.github/skills/release-teamsjs/**`, reject all other staged paths, inspect the
diff, and open a draft PR. Preserve confirmation, policy, approval, and full-receipt requirements.
