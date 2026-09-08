# release-teamsjs

Public agent guidance for preparing an `@microsoft/teams-js` release from a pinned source and
finalizing it only after the approved build is proven on npm and the CDN.

## Scope

The skill covers repository-owned release work. Internal publication remains governed by the
internal TeamsJS runbook and requires a second person's approval. External contributors do not cut
releases.

Ask Copilot to “release teams-js” or “cut the next TeamsJS release” to load the skill.

## Safety model

1. Pin `origin/main` and preview Beachball in a disposable worktree.
2. Confirm the exact source, resulting version, release branch, and channel.
3. Prepare and review the bump in a separate pinned worktree.
4. Stage only expected generated paths and land them through a release-branch PR.
5. Generate the release plan from the approved build and immutable outputs.
6. Publish through the existing internal approval gates.
7. Require a complete receipt proving every npm/CDN target matches the approved build.
8. Only then promote, merge back, update dependents, and announce.

The deployed build decides what ships. HTTP success, a version string, byte count, or green pipeline
does not prove artifact identity. A partial or unknown receipt keeps the candidate unpromoted.

## Files

| File | Purpose |
|---|---|
| `SKILL.md` | Complete workflow, confirmation boundaries, failure modes, and learning loop. |
| `README.md` | Public overview. |
