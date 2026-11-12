---
applyTo: 'tools/releases/**,tools/yaml-templates/build-test-publish.yml,tools/yaml-templates/install-dotnet-sdk.yml,tools/yaml-templates/security.yml,tools/cli/preRelease.js,tools/cli/readChangelog.js,packages/teams-js/prepBetaRelease.cjs,packages/teams-js/scripts/**,.github/workflows/postrelease.yml,.github/workflows/verify-release.yml,.github/skills/release-teamsjs/**'
---

# Release pipelines and tooling

These files drive how `@microsoft/teams-js` is versioned and published. Before changing them:

- Read `.github/skills/release-teamsjs/SKILL.md` and `failure-modes.md`. A change here can change what a release
  publishes or how its run is judged.
- The release pipelines read their YAML from the branch that is queued, usually `release/<x.y.z>`. A fix on `main`
  takes effect only from release branches cut or updated after it merges; say so in the PR. Scripts the release
  pipelines run from the CI build's `scripts` artifact (`packages/teams-js/scripts/*.ps1`) take effect from the CI
  build that is selected, not the queued branch.
- Tasks that only run on `main` or release builds (for example artifact retention) are not exercised by PR builds.
  State how the change will be proven.
- Keep the skill in step: if a change adds, removes or renames a pipeline step, a version carrier or a script the
  skill names, update `SKILL.md`, `failure-modes.md` and `check-release.js` in the same PR, and run
  `node --test .github/skills/release-teamsjs/check-release.test.js`.
- CI's "Release tooling tests" job (`.github/workflows/main.yml`) runs every `*.test.js` under the skill folder and
  `tools/releases`, and every `tools/releases/**/*.test.ps1`, on Windows with Node 18 and 20. Name new tests to match,
  and make a PowerShell test exit non-zero when it fails.
- This repository is public. Do not add internal pipeline IDs, URLs, approver groups or people's names.
- Do not add steps that bypass a review, a branch ruleset or a pipeline approval, or that force-push a release branch.
