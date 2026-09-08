---
name: release-teamsjs
description: Use when releasing @microsoft/teams-js from this repo - pinning and previewing the source, preparing the bump, creating the candidate, and requiring complete npm and CDN verification before finalization.
---

# release-teamsjs

Interactive workflow for releasing `@microsoft/teams-js`.

## Scope and prerequisite

This covers the public, repository-owned parts of a release. Internal npm/CDN publication still
requires second-person approval and the internal TeamsJS runbook. The executable release-plan and
verification-receipt lifecycle introduced by
[#3156](https://github.com/OfficeDev/microsoft-teams-library-js/pull/3156) is a prerequisite:
**stop until its tools are reviewed, landed, and present in the source commit.** Do not invent
replacement commands. Once landed, follow
[`tools/cli/release-lifecycle.md`](../../../tools/cli/release-lifecycle.md) for the authoritative
public interface.

Everything here is public-safe. Never paste internal URLs, pipeline identifiers, approval-system
names, raw pipeline logs, signed URLs, tokens, or internal identities into a public artifact.

## Beachball behavior in this repository

The installed Beachball version is pinned in `pnpm-lock.yaml`. For Beachball 2.62:

- `bump` validates before calculating or writing. A hand-authored `major` or `prerelease` file is
  rejected while disallowed, not silently demoted.
- The stable-package prompt offers `patch`, `minor`, and `none`. Beachball also recognizes
  `prerelease`, `prepatch`, `preminor`, `premajor`, and `major`; the checked-in guard disallows only
  `major` and `prerelease`. Do not silently change that policy.
- `--config` is an alias for `--config-path`. `--type` controls change-file creation. `bump`
  supports `--prerelease-prefix`; there is no `--prerelease` switch. None of these flags is, by
  itself, a reviewed TeamsJS major/prerelease release procedure.
- `publish: false` and `push: false` mean Beachball writes versions and changelogs but does not
  publish or push them.

Contributors use `pnpm changefile`; see `CONTRIBUTING.md`. A stable release consumes the full set of
pending change files, updates `packages/teams-js/CHANGELOG.md`, and deletes the consumed files.

## Non-negotiable gates

1. **Exact source and version confirmation.** Show the pinned commit and version computed from all
   pending changes. Only a later explicit reply counts. In non-interactive mode, emit
   `AUTOPILOT HOLD - RELEASE SKILL CONFIRMATION GATE` and stop.
2. **No checkout mutation for preview.** Preview only in the disposable worktree created by
   `tools/cli/prepare-release.js`.
3. **Real review boundaries.** Version confirmation happens before any release branch is created.
   Generated bump output is reviewed before staging or committing.
4. **Approved build plan.** Publish from one pinned approved build and its immutable outputs, never
   a mutable checkout or observed feed.
5. **Complete receipt.** Finalization requires every planned target to be `present-matching`.

## Workflow

### 0. State the intended operation

State the requested release line, that source and version confirmation will follow, and that the
workflow stops at the separately approved internal publication step. Do not imply that publishing
has started while preparation or approval is pending.

### 1. Pin the source and preview the version without touching the checkout

Start in a clean, dedicated worktree. Explicitly check the status command itself and include every
untracked file; local `status.showUntrackedFiles` configuration must not weaken the check.

```bash
set -euo pipefail

if ! checkout_status="$(git status --porcelain=v1 --untracked-files=all)"; then
  echo "Unable to verify working-tree status." >&2
  exit 1
fi
if [ -n "$checkout_status" ]; then
  echo "Working tree must be clean, including untracked files." >&2
  printf '%s\n' "$checkout_status" >&2
  exit 1
fi

if ! git fetch origin '+refs/heads/main:refs/remotes/origin/main'; then
  echo "Unable to fetch origin/main." >&2
  exit 1
fi
if ! source_commit="$(git rev-parse 'refs/remotes/origin/main^{commit}')"; then
  echo "Unable to pin origin/main." >&2
  exit 1
fi
case "$source_commit" in
  ''|*[!0-9a-f]*) echo "Pinned source is not a full commit SHA." >&2; exit 1 ;;
  *) [ "${#source_commit}" -eq 40 ] || exit 1 ;;
esac

if ! preview_json="$(
  node tools/cli/prepare-release.js preview \
    --source-commit "$source_commit"
)"; then
  echo "Version preview failed." >&2
  exit 1
fi
printf '%s\n' "$preview_json"
if ! version="$(
  node -e '
    const result = JSON.parse(process.argv[1]);
    if (typeof result.version !== "string") throw new Error("Missing version");
    process.stdout.write(result.version);
  ' "$preview_json"
)"; then
  echo "Unable to read the previewed version." >&2
  exit 1
fi
```

The helper creates a detached worktree at exactly `source_commit`, installs its frozen dependency
graph without lifecycle scripts, and invokes that source's Beachball with publishing, pushing,
tags, and commits disabled. It checks only expected preview paths changed, explicitly requires the
lockfile update to succeed (Beachball 2.62 only warns on failure), and removes the worktree. It never
restores or cleans the developer checkout.

Read `version` from the JSON result. Check that the version is not already published:

```bash
set -euo pipefail
if npm_result="$(npm view "@microsoft/teams-js@$version" version 2>&1)"; then
  echo "@microsoft/teams-js@$version already exists." >&2
  exit 1
fi
case "$npm_result" in
  *E404*) ;;
  *)
    echo "Unable to establish whether @microsoft/teams-js@$version exists." >&2
    printf '%s\n' "$npm_result" >&2
    exit 1
    ;;
esac
```

**Gate.** Show `source_commit`, `version`, the intended `release/<version>` branch, and the planned
channel. Wait for explicit confirmation. After confirmation, rerun the same pinned preview with an
exact assertion before any branch mutation:

```bash
set -euo pipefail
if ! node tools/cli/prepare-release.js preview \
  --source-commit "$source_commit" \
  --expected-version "$version"; then
  echo "The confirmed source/version pair no longer validates." >&2
  exit 1
fi
```

Never replace `source_commit` with a later `origin/main` value after confirmation. A different
source requires a new preview and a new confirmation.

### 2. Create the unchanged release branch from the confirmed source

The branch must not already exist. Every remote query, branch mutation, and push is a stopping
point on failure.

```bash
set -euo pipefail
release_ref="refs/heads/release/$version"

if existing_release="$(git ls-remote --exit-code --heads origin "$release_ref")"; then
  echo "$release_ref already exists; refusing to reuse it." >&2
  printf '%s\n' "$existing_release" >&2
  exit 1
else
  status=$?
  if [ "$status" -ne 2 ]; then
    echo "Unable to prove that $release_ref is absent." >&2
    exit "$status"
  fi
fi

if ! git push origin "$source_commit:$release_ref"; then
  echo "Failed to create $release_ref." >&2
  exit 1
fi
if ! remote_release="$(git ls-remote --exit-code --heads origin "$release_ref")"; then
  echo "Unable to verify $release_ref after push." >&2
  exit 1
fi
remote_release="${remote_release%%$'\t'*}"
if [ "$remote_release" != "$source_commit" ]; then
  echo "$release_ref is $remote_release; expected $source_commit." >&2
  exit 1
fi
```

Never force-push a release branch.

### 3. Prepare the bump in a separate worktree

Choose a new path outside every existing checkout. Do not reuse an old release worktree.

```bash
set -euo pipefail
working_branch="<alias>/release_$version-1"
release_worktree="<new-user-owned-path>"

if [ -e "$release_worktree" ]; then
  echo "Release worktree path already exists: $release_worktree" >&2
  exit 1
fi
if ! git worktree add -b "$working_branch" "$release_worktree" "$source_commit"; then
  echo "Unable to create the pinned release worktree." >&2
  exit 1
fi
if ! prepared_head="$(git -C "$release_worktree" rev-parse HEAD)"; then
  exit 1
fi
if [ "$prepared_head" != "$source_commit" ]; then
  echo "Release worktree is not at the confirmed source." >&2
  exit 1
fi
if ! prepared_status="$(git -C "$release_worktree" status --porcelain=v1 --untracked-files=all)"; then
  exit 1
fi
if [ -n "$prepared_status" ]; then
  echo "New release worktree is not clean." >&2
  exit 1
fi

if ! (cd "$release_worktree" && node tools/cli/preRelease.js); then
  echo "Release preparation failed; do not stage, commit, or push." >&2
  exit 1
fi
if ! (
  cd "$release_worktree" &&
    node tools/cli/prepare-release.js verify \
      --source-commit "$source_commit" \
      --expected-version "$version"
); then
  echo "Generated release output failed verification." >&2
  exit 1
fi
```

`preRelease.js` runs Beachball, installs, builds, reads the generated UMD integrity value, and
updates the version carriers. Its failure is final for this attempt. Do not commit or push partial
output.

**Review boundary.** Inspect the full diff. Confirm every pending change file was consumed, the
changelog section and PR description agree, both package manifests have the exact confirmed
version, and both CDN examples have the same build-derived integrity value. Make any intentional
release-note edits now, then rerun `prepare-release.js verify`. An edit that changes the source
commit or expected paths requires a new preparation.

### 4. Stage, commit, and push only the reviewed preparation

```bash
set -euo pipefail

if ! git -C "$release_worktree" add -- \
  packages/teams-js/package.json \
  packages/teams-js/CHANGELOG.md \
  packages/teams-js/README.md \
  apps/teams-test-app/package.json \
  apps/teams-test-app/index_cdn.html \
  pnpm-lock.yaml; then
  exit 1
fi
if ! tracked_change_files="$(git -C "$release_worktree" ls-files -- 'change/*.json')"; then
  exit 1
fi
if [ -z "$tracked_change_files" ]; then
  echo "Pinned source has no tracked change files to consume." >&2
  exit 1
fi
if ! git -C "$release_worktree" add -A -- ':(top,glob)change/*.json'; then
  exit 1
fi
if ! tracked_json_changelog="$(
  git -C "$release_worktree" ls-files -- packages/teams-js/CHANGELOG.json
)"; then
  exit 1
fi
if [ -n "$tracked_json_changelog" ]; then
  if ! git -C "$release_worktree" add -A -- packages/teams-js/CHANGELOG.json; then
    exit 1
  fi
fi
if ! staged="$(git -C "$release_worktree" diff --cached --name-only --no-renames)"; then
  exit 1
fi
if [ -z "$staged" ]; then
  echo "No release preparation is staged." >&2
  exit 1
fi
while IFS= read -r staged_path; do
  case "$staged_path" in
    packages/teams-js/package.json|packages/teams-js/CHANGELOG.md|packages/teams-js/README.md|\
    apps/teams-test-app/package.json|apps/teams-test-app/index_cdn.html|pnpm-lock.yaml|\
    packages/teams-js/CHANGELOG.json|change/*.json) ;;
    *) echo "Unexpected staged release path: $staged_path" >&2; exit 1 ;;
  esac
done <<< "$staged"

if ! git -C "$release_worktree" commit -m "Prepare release $version"; then
  echo "Release preparation commit failed." >&2
  exit 1
fi
if ! committed_status="$(git -C "$release_worktree" status --porcelain=v1 --untracked-files=all)"; then
  exit 1
fi
if [ -n "$committed_status" ]; then
  echo "Release worktree has residue after commit." >&2
  printf '%s\n' "$committed_status" >&2
  exit 1
fi
if ! git -C "$release_worktree" push --set-upstream origin "$working_branch"; then
  echo "Release preparation push failed." >&2
  exit 1
fi
if ! local_head="$(git -C "$release_worktree" rev-parse HEAD)"; then
  exit 1
fi
if ! remote_head="$(git ls-remote --exit-code --heads origin "refs/heads/$working_branch")"; then
  exit 1
fi
remote_head="${remote_head%%$'\t'*}"
if [ "$remote_head" != "$local_head" ]; then
  echo "Remote working branch does not match the reviewed commit." >&2
  exit 1
fi
```

Open the bump PR from `working_branch` into `release/<version>`, not `main`. Do not attach binaries.
Do not continue while the PR is open.

### 5. Build the merged release commit and produce the approved plan

After the bump PR merges, fetch `refs/remotes/origin/release/<version>` explicitly and require its
package version to equal `version`. Queue the reviewed build for that exact commit. The public
Post Release workflow records source/tooling identity and runs a no-publish rehearsal; its merge,
notification, or `unverified-candidate.json` output is not a publisher or publication evidence.

Before a real release, the publishing authority must integrate a reviewed producer and independent
approval adapter into the existing publisher. It exports the final npm tarball and entire CDN
version directory from the same pinned approved build, after the last transformation. The
directory inventory includes every deployed `.js`, `.ts`, and `.map` file. Source must be the
reviewed release commit, and tooling must be the reviewed default-branch helper revision.

Only that producer runs:

```bash
set -euo pipefail
if ! plan_digest="$(
  node tools/cli/release-plan.js produce \
    "$APPROVED_IDENTITY_FILE" \
    "$FINAL_NPM_TARBALL" \
    "$FINAL_CDN_VERSION_DIRECTORY" \
    "$NEW_PLAN_FILE"
)"; then
  echo "Approved-build plan production failed." >&2
  exit 1
fi
printf 'Plan digest: %s\n' "$plan_digest"
```

Persist the canonical digest with the immutable plan. Approval must bind the digest and source
independently of the supplied plan. Stop on an incomplete inventory, unresolved value, wrong
source/tool revision, or any expected hash derived from an observed feed.

### 6. Publish through the existing gates

The plan-producing CLI does not publish, approve, choose an npm dist-tag, or replace the publisher.
The internal publication step still requires the existing second-person approval and must consume
the approved build behind the plan. Do not claim publication started before approval or weaken
environment, locking, branch-protection, or self-approval policies.

### 7. Reconcile every target and finalize only from a complete receipt

After every publish attempt, including partial failure, verify the entire plan:

```bash
set -euo pipefail
if ! node tools/cli/release-plan.js verify \
  "$PLAN_FILE" \
  "$INDEPENDENTLY_APPROVED_PLAN_DIGEST" \
  "$INDEPENDENTLY_APPROVED_SOURCE_SHA" \
  "$NEW_RECEIPT_FILE"; then
  echo "Publication receipt is incomplete; do not finalize." >&2
  exit 1
fi
```

The command records every target and exits nonzero for partial, conflicting, or unknown outcomes.
Retry scope may not shrink the target set. It independently downloads and hashes the npm tarball
and every planned CDN object; the plan represents the full `.js`, `.ts`, and `.map` inventory.

For npm and the CDN, `present-matching` requires the actual artifact/content identity to match the
independent build-derived expectation and any applicable source reference. A version string,
folder, HTTP 200, download size, package-page rendering, or pipeline success is insufficient.
Authentication errors, malformed responses, generic 404s, and skipped jobs are `unknown`, not
authoritative absence.

Only a receipt with the independently approved digest/source, exactly one current
`present-matching` observation per target, and `complete: true` permits metadata finalization:

```bash
set -euo pipefail
node tools/cli/create-github-release.js \
  "$PLAN_FILE" \
  "$RECEIPT_FILE" \
  "$INDEPENDENTLY_APPROVED_PLAN_DIGEST" \
  "$INDEPENDENTLY_APPROVED_SOURCE_SHA"
```

This command re-verifies publication, creates immutable `candidate/<version>/<planDigest>` and the
annotated `v<version>` exactly once, and checks their remote peeled source. It never edits, retags,
or promotes a release. GitHub release metadata remains `prerelease: true` and `make_latest: false`.
Any later manual promotion, merge-back, compatibility update, or announcement still requires the
complete receipt and existing operational approval.

If publication is partial, report it as partial. Derive recovery from the receipt. Never republish
an append-only package to repair metadata, and never move a published final tag.

### 8. Feed back a durable learning

Record a durable correction only when it would have changed this run. Use a clean new worktree at
current `origin/main`, edit/stage only `.github/skills/release-teamsjs/**`, reject other staged
paths, and open a draft PR. Never relax confirmation, approval, completeness, or verification.

## Major and prerelease candidates

No reviewed public procedure safely releases a blocked `major` or `prerelease` change. Never relax
the guard, use a permissive config, claim demotion, or assume prerelease outranks other pending types.
A future approved executable route must isolate policy, pin source, calculate all changes, assert
the exact version, and retain every gate. Until then, stop and design it separately.
